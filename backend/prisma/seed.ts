import { PrismaClient, LabelPenyakit } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create a Test User (Lugas)
  const hashedPasswordLugas = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'lugas' },
    update: { role: 'USER' },
    create: {
      username: 'lugas',
      password: hashedPasswordLugas,
      nama_lengkap: 'Lugas Hermanto',
      avatar: null,
      role: 'USER',
    },
  });

  // 1.1 Create Admin User (adminku)
  const hashedPasswordAdmin = await bcrypt.hash('bismillahlancar57', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'adminku' },
    update: { role: 'ADMIN' },
    create: {
      username: 'adminku',
      password: hashedPasswordAdmin,
      nama_lengkap: 'Administrator Utama',
      role: 'ADMIN',
    },
  });

  console.log('Users created: lugas (USER) and adminku (ADMIN)');

  // 2. Create Dummy History Data (15 records)
  const labels = Object.values(LabelPenyakit);
  
  // Clear existing history for clean test
  await prisma.hasilPrediksi.deleteMany({ where: { citra: { userId: user.id } } });
  await prisma.citra.deleteMany({ where: { userId: user.id } });

  for (let i = 0; i < 15; i++) {
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const randomConfidence = 0.7 + Math.random() * 0.28; // 70% - 98%
    
    // Generate random probabilities
    const allProbs = {
      HEALTHY: randomLabel === 'HEALTHY' ? randomConfidence : (1 - randomConfidence) / 3,
      COCCIDIOSIS: randomLabel === 'COCCIDIOSIS' ? randomConfidence : (1 - randomConfidence) / 3,
      NEWCASTLE: randomLabel === 'NEWCASTLE' ? randomConfidence : (1 - randomConfidence) / 3,
      SALMONELLA: randomLabel === 'SALMONELLA' ? randomConfidence : (1 - randomConfidence) / 3,
    };

    const citra = await prisma.citra.create({
      data: {
        userId: user.id,
        namaFile: 'dummy-feces.jpg', // Placeholder
        ukuranFile: 1024 * 500, // 500KB
        tanggalUnggah: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Random days ago
        hasilPrediksi: {
          create: {
            labelPenyakit: randomLabel,
            nilaiAkurasi: randomConfidence,
            allProbs: allProbs,
            waktuProses: 0.5 + Math.random() * 1.5,
          }
        }
      }
    });
  }

  console.log('Successfully seeded 15 history records!');

  // 3. Create Testimonials
  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Pemilik Peternakan Jaya',
      text: 'Sangat membantu mendeteksi Coccidiosis lebih awal. Aplikasi ini menyelamatkan ribuan ayam saya dari kematian massal.',
      rating: 5
    },
    {
      name: 'Drh. Ratna',
      role: 'Dokter Hewan Spesialis',
      text: 'Akurasi model AI-nya cukup mengejutkan. Sangat cocok digunakan sebagai opini kedua yang praktis di lapangan.',
      rating: 5
    },
    {
      name: 'Agus Pratama',
      role: 'Peternak Ayam Broiler',
      text: 'Desainnya sangat modern dan mudah digunakan bahkan lewat HP jadul. Hasilnya cepat dan sarannya sangat berguna.',
      rating: 5
    }
  ];

  await prisma.testimonial.deleteMany({}); // Clear existing
  for (const testi of testimonials) {
    await prisma.testimonial.create({ data: testi });
  }

  console.log('Successfully seeded testimonials!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

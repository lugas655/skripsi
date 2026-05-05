import { PrismaClient, LabelPenyakit } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create a Test User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'lugas' },
    update: {},
    create: {
      username: 'lugas',
      password: hashedPassword,
      nama_lengkap: 'Lugas Hermanto',
      avatar: null,
    },
  });

  console.log('User created:', user.username);

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

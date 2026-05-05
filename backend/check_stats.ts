import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkStats() {
  const userId = 2; // ID untuk user 'lugas' yang punya 15 data
  console.log('--- CHECKING STATS FOR USER ID 2 ---');
  
  const totalDiagnoses = await prisma.citra.count({ where: { userId } });
  console.log('Total Diagnoses:', totalDiagnoses);

  const labelCounts = await prisma.hasilPrediksi.groupBy({
    by: ['labelPenyakit'],
    where: { citra: { userId } },
    _count: { labelPenyakit: true },
  });
  console.log('Label Counts (Raw):', JSON.stringify(labelCounts, null, 2));

  const recentChecks = await prisma.citra.findMany({
    where: { userId },
    include: { hasilPrediksi: true },
    orderBy: { tanggalUnggah: 'desc' },
    take: 5,
  });
  console.log('Recent Checks Count:', recentChecks.length);
  if (recentChecks.length > 0) {
    console.log('First recent check prediction:', recentChecks[0].hasilPrediksi?.labelPenyakit);
  }
}

checkStats().finally(() => prisma.$disconnect());

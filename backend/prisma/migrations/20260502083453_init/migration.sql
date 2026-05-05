-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Citra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `namaFile` VARCHAR(191) NOT NULL,
    `ukuranFile` INTEGER NOT NULL,
    `tanggalUnggah` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HasilPrediksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citraId` INTEGER NOT NULL,
    `labelPenyakit` ENUM('HEALTHY', 'COCCIDIOSIS', 'NEWCASTLE', 'SALMONELLA') NOT NULL,
    `nilaiAkurasi` DOUBLE NOT NULL,
    `waktuProses` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HasilPrediksi_citraId_key`(`citraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Citra` ADD CONSTRAINT `Citra_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HasilPrediksi` ADD CONSTRAINT `HasilPrediksi_citraId_fkey` FOREIGN KEY (`citraId`) REFERENCES `Citra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

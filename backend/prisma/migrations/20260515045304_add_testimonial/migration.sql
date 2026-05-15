-- AlterTable
ALTER TABLE `hasilprediksi` ADD COLUMN `saranAI` TEXT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `HasilPrediksi_labelPenyakit_idx` ON `HasilPrediksi`(`labelPenyakit`);

-- RenameIndex
ALTER TABLE `citra` RENAME INDEX `Citra_userId_fkey` TO `Citra_userId_idx`;

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  avatar?: string | null;
  role: 'USER' | 'ADMIN';
}

export enum LabelPenyakit {
  HEALTHY = 'HEALTHY',
  COCCIDIOSIS = 'COCCIDIOSIS',
  NEWCASTLE = 'NEWCASTLE',
  SALMONELLA = 'SALMONELLA',
}

export interface HasilPrediksi {
  id: number;
  citraId: number;
  labelPenyakit: LabelPenyakit;
  nilaiAkurasi: number;
  allProbs?: Record<string, number>;
  saranAI?: string;
  waktuProses: number;
  createdAt: string;
}

export interface Citra {
  id: number;
  userId: number;
  namaFile: string;
  ukuranFile: number;
  tanggalUnggah: string;
  hasilPrediksi?: HasilPrediksi;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PredictResponse {
  message: string;
  data: {
    citra: Citra;
    prediksi: HasilPrediksi;
  };
}

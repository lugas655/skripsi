import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateAdvice = async (label: string, confidence: number): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Falling back to default advice.");
    return getDefaultAdvice(label);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let labelIndo = label;
    if (label.toUpperCase() === 'HEALTHY') labelIndo = 'Sehat';
    if (label.toUpperCase() === 'NEWCASTLE') labelIndo = 'Newcastle Disease (Tetelo)';

    const prompt = `Kamu adalah dokter hewan ahli unggas yang profesional. Sistem mendeteksi kondisi feses ayam adalah "${labelIndo}" dengan keyakinan ${(confidence * 100).toFixed(1)}%. Berikan saran penanganan atau pencegahan yang singkat, praktis, dan profesional dalam bahasa Indonesia. Maksimal 3 kalimat saja. Jangan gunakan salam pembuka/penutup.`;

    console.log(`[DEBUG] Sending prompt to Gemini: ${labelIndo}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`[DEBUG] Gemini AI Response: ${text}`);
    return text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return getDefaultAdvice(label);
  }
};

const getDefaultAdvice = (label: string): string => {
  switch (label?.toUpperCase()) {
    case 'HEALTHY': return 'Kondisi feses ayam menunjukkan parameter kesehatan yang optimal. Pastikan ventilasi dan kualitas air minum tetap terjaga.';
    case 'COCCIDIOSIS': return 'Terdeteksi Koksidiosis. Segera bersihkan kotoran yang basah, ganti alas kandang (litter), dan konsultasikan pemberian koksidiostat.';
    case 'NEWCASTLE': return 'Sinyal Bahaya: Newcastle Disease terdeteksi. Virus ini sangat cepat menyebar. Segera lakukan isolasi total dan lapor petugas kesehatan hewan.';
    case 'SALMONELLA': return 'Indikasi Salmonella. Perhatikan kebersihan tempat pakan dan segera berikan antibiotik yang sesuai untuk unggas.';
    default: return 'Data analisis tidak tersedia.';
  }
};

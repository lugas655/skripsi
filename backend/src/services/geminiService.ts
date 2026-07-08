import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateAdvice = async (label: string, confidence: number): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Falling back to default advice.");
    return getDefaultAdvice(label);
  }

  let labelIndo = label;
  if (label.toUpperCase() === 'HEALTHY') labelIndo = 'Sehat';
  if (label.toUpperCase() === 'NEWCASTLE') labelIndo = 'Newcastle Disease (Tetelo)';

  const prompt = `Kamu adalah dokter hewan ahli unggas yang profesional. Sistem mendeteksi kondisi feses ayam adalah "${labelIndo}" dengan keyakinan ${(confidence * 100).toFixed(1)}%. Berikan saran penanganan atau pencegahan yang singkat, praktis, dan profesional dalam bahasa Indonesia. Maksimal 3 kalimat saja. Jangan gunakan salam pembuka/penutup.`;

  const modelName = "gemini-3-flash-preview";
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      console.log(`[DEBUG] Sending prompt to Gemini (Attempt ${attempt}/${maxRetries}): ${labelIndo}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`[DEBUG] Gemini AI Response: ${text}`);
      return text;
    } catch (error: any) {
      console.warn(`[WARN] Gemini AI Error (Attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait 2s, then 4s
        const delay = attempt * 2000;
        console.log(`[INFO] Waiting ${delay}ms before retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("[ERROR] Gemini API failed after multiple retries, using default advice.");
  return getDefaultAdvice(label);
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

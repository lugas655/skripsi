import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    console.log("Checking available models for your API Key...");
    // @ts-ignore
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json() as any;
    
    if (data.models) {
      console.log("\nModel yang tersedia untuk Anda:");
      data.models.forEach((m: any) => {
        console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
      });
    } else {
      console.log("Tidak ada model yang ditemukan atau API Key tidak valid.", data);
    }
  } catch (error) {
    console.error("Error checking models:", error);
  }
}

listModels();

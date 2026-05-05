import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const predictImage = async (filePath: string) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error calling ML Service:', error.message);
    throw new Error('ML Service is currently unavailable');
  }
};

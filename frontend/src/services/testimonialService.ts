import api from '../api/api';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
  createdAt: string;
}

export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get('/testimonials');
  return response.data;
};

export const createTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
  const response = await api.post('/testimonials', data);
  return response.data;
};

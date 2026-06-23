import api from '../api/api';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
  createdAt: string;
  userId?: number | null;
}

export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get('/testimonials');
  return response.data;
};

export const getMyTestimonial = async (): Promise<Testimonial | null> => {
  const response = await api.get('/testimonials/mine');
  return response.data;
};

export const createTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
  const response = await api.post('/testimonials', data);
  return response.data;
};

export const updateTestimonial = async (data: { text: string; rating: number }): Promise<Testimonial> => {
  const response = await api.put('/testimonials/mine', data);
  return response.data;
};

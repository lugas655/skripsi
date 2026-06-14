import api, { API_ENDPOINTS } from '../api/api';

export interface AdminStats {
  users: number;
  totalUploads: number;
  totalPredictions: number;
  diseaseStats: {
    label: string;
    count: number;
  }[];
}

export interface AdminUser {
  id: number;
  username: string;
  nama_lengkap: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  _count: {
    citras: number;
  };
}

export interface AdminUpload {
  id: number;
  userId: number;
  namaFile: string;
  ukuranFile: number;
  tanggalUnggah: string;
  user: {
    username: string;
    nama_lengkap: string;
  };
  hasilPrediksi: {
    labelPenyakit: string;
    nilaiAkurasi: number;
    saranAI: string | null;
  } | null;
}

export interface SystemHealth {
  mlService: { status: 'online' | 'offline'; latency: number };
  geminiApi: { status: 'online' | 'offline' | 'misconfigured'; latency: number };
}

export interface AdminTestimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string | null;
  createdAt: string;
}

const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_USERS);
    return response.data;
  },

  createUser: async (userData: any): Promise<AdminUser> => {
    const response = await api.post(API_ENDPOINTS.ADMIN_USERS, userData);
    return response.data.user;
  },

  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await api.patch(API_ENDPOINTS.ADMIN_USER_PASSWORD(id), { newPassword });
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_USER_DELETE(id));
  },

  getUploads: async (): Promise<AdminUpload[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_UPLOADS);
    return response.data;
  },

  downloadFile: async (id: number, filename: string): Promise<void> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_DOWNLOAD(id), {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadAll: async (): Promise<void> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_DOWNLOAD_ALL, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `all-uploads-${new Date().toISOString().split('T')[0]}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getHealth: async (): Promise<SystemHealth> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_HEALTH);
    return response.data;
  },

  getTestimonials: async (): Promise<AdminTestimonial[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN_TESTIMONIALS);
    return response.data;
  },

  deleteTestimonial: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_TESTIMONIAL_DELETE(id));
  },
};

export default adminService;

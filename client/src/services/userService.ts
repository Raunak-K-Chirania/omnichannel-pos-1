import api from './api';

export const userService = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async updateRole(userId: string, role: string, store?: string | null) {
    const response = await api.put(`/users/${userId}/role`, { role, store });
    return response.data;
  },

  async delete(userId: string) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default userService;

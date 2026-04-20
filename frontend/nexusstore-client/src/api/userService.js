import api from './api';

export const userService = {
    getAll: () => api.get('/usuarios'),
    create: (data) => api.get('/usuarios').then(() => api.post('/usuarios', data)), // Refresca tras crear
    delete: (id) => api.delete(`/usuarios/${id}`),
    resetPassword: (id, password) => api.put(`/usuarios/${id}/reset-password`, { password })
};

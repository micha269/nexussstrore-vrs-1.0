// src/api/api.js
import axios from 'axios';

// Añade esto a tu archivo api.js
export const updateProduct = (id, data) => api.put(`/productos/${id}`, data);

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // La URL por defecto de Laravel
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;

// apiConfig.js
// En desarrollo usa localhost:3000/api
// En producción (Azure) usa la ruta relativa /api para que apunte al mismo servidor que sirve el frontend
const isProd = import.meta.env.PROD;

export const API_URL = isProd ? '/api' : 'http://localhost:3000/api';
export const STATIC_URL = isProd ? '' : 'http://localhost:3000';

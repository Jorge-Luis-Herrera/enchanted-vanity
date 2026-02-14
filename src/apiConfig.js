// apiConfig.js
// En desarrollo: Vite hace proxy de /api y /uploads al backend (localhost:3000)
// En producción: mismo servidor sirve frontend y API
const isProd = import.meta.env.PROD;

export const API_URL = '/api';
export const STATIC_URL = isProd ? '' : '';

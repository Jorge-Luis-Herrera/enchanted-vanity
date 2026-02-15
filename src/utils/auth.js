const ADMIN_KEY = 'bv_is_admin';

export function getToken() {
    return localStorage.getItem(ADMIN_KEY) === 'true' ? 'admin' : null;
}

export function setToken(val) {
    localStorage.setItem(ADMIN_KEY, val ? 'true' : 'false');
}

export function clearToken() {
    localStorage.removeItem(ADMIN_KEY);
}

export function getAuthHeaders() {
    return {}; // No longer using Bearer tokens for this simple implementation
}

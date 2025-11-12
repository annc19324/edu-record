// src/services/auth.js
export const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    localStorage.setItem('token', data.token);
    return data.user;
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
};

export const getUserFromToken = async (token) => {
    const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
};
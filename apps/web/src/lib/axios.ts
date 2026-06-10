import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Inject access token from localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('devflow-auth');
        if (stored) {
            const { state } = JSON.parse(stored);
            if (state?.accessToken) {
                config.headers.Authorization = `Bearer ${state.accessToken}`;
            }
        }
    }
    return config;
});

// Auto refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                // Update persisted store
                const stored = localStorage.getItem('devflow-auth');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.state.accessToken = data.accessToken;
                    localStorage.setItem('devflow-auth', JSON.stringify(parsed));
                }

                // Update cookie
                document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900`;
                localStorage.setItem('refreshToken', data.refreshToken);

                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                localStorage.clear();
                document.cookie = 'accessToken=; path=/; max-age=0';
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default api;
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Важно для Sanctum!
})

// Interceptor для установки CSRF cookie перед запросами
api.interceptors.request.use(
    async (config) => {
        // Для всех запросов кроме получения CSRF cookie, убедимся что cookie установлены
        if (!config.url?.includes('/sanctum/csrf-cookie')) {
            // Проверяем есть ли CSRF token в cookie
            const hasCsrfToken = document.cookie.includes('XSRF-TOKEN')
            if (!hasCsrfToken) {
                await api.get('/sanctum/csrf-cookie')
            }
        }

        // Добавляем токен аутентификации
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Автоматический логаут при 401 ошибке
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')

            // Редирект на страницу логина
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    getCsrfCookie: async () => {
        return await api.get('/sanctum/csrf-cookie')
    },

    register: async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
        const response = await api.post('/register', data)
        return response.data
    },

    login: async (data: { email: string; password: string }) => {
        // Сначала получаем CSRF cookie
        await authAPI.getCsrfCookie()
        const response = await api.post('/login', data)
        return response.data
    },

    logout: async () => {
        const response = await api.post('/logout')
        return response.data
    },

    getUser: async () => {
        const response = await api.get('/user')
        return response.data
    },

    checkAuth: async () => {
        const response = await api.get('/check-auth')
        return response.data
    },
}
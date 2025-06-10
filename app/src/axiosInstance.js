import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 60000, // Timeout after 60 seconds
});

// Request interceptor to add the authorization token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = JSON.parse(sessionStorage.user)?.token;
        if (token) {
            console.log('Adding token to request headers:', token);
            config.headers['Authorization'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling responses globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
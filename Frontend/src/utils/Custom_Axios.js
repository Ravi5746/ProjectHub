import axios from 'axios';
import { baseURL } from '../common/summaryAPI';

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

Axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Try to refresh token
                const refreshResponse = await axios.post(`${baseURL}/api/v1/auth/refresh-token`, {}, {
                    withCredentials: true
                });

                if (refreshResponse.data.success) {
                    return Axios(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, let the caller handle it (e.g., redirect to login)
                console.error("Token refresh failed", refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default Axios;

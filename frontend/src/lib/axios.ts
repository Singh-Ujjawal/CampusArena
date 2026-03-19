import axios from 'axios';
import { toast } from 'sonner';

const envBaseUrls = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const baseUrls = envBaseUrls.split(',').map((url: string) => url.trim());
let currentBaseUrlIndex = 0;

// Track recently toasted errors to prevent duplicates
const recentlyToastedErrors = new Set<string>();

export const api = axios.create({
    baseURL: baseUrls[currentBaseUrlIndex],
});

// Request interceptor to add Bearer Token header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Also set userId header for legacy/specific endpoints if needed
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.id) {
                    config.headers['userId'] = user.id;
                }
            } catch (e) {}
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401/403 and Retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Automatically retry on different base URL if it's a network error and we have multiple URLs
        const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
        
        if (isNetworkError && config && baseUrls.length > 1) {
            config._retryCount = config._retryCount || 0;
            
            if (config._retryCount < baseUrls.length - 1) {
                config._retryCount += 1;
                
                // Move to the next base URL
                currentBaseUrlIndex = (currentBaseUrlIndex + 1) % baseUrls.length;
                const nextBaseUrl = baseUrls[currentBaseUrlIndex];
                
                // Update config and default instance
                config.baseURL = nextBaseUrl;
                api.defaults.baseURL = nextBaseUrl;
                
                // Retry the request
                return api(config);
            }
        }

        if (error.response?.status === 401) {
            // Unauthorized - clear storage and redirect (handled by AuthContext state ideally, but we can trigger event)
            // For now, we just rely on the UI to handle the logged out state
        }

        // Create a unique key for this error to prevent duplicate toasts
        const data = error.response?.data;
        const message = (typeof data === 'string' ? data : data?.message) || error.message || 'Something went wrong';
        const errorKey = `${message}`;

        // Only show toast if this error hasn't been shown in the last 5 seconds
        if (!recentlyToastedErrors.has(errorKey)) {
            toast.error(`Error: ${message}`);

            // Add to recent toasts
            recentlyToastedErrors.add(errorKey);

            // Remove from set after 5 seconds to allow showing the same error again
            setTimeout(() => {
                recentlyToastedErrors.delete(errorKey);
            }, 5000);
        }

        return Promise.reject(error);
    }
);

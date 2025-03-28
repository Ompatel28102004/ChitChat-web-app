import axios from "axios";
import { HOST } from "@/utils/constants";

export const apiClient = axios.create({
    baseURL: HOST,
    withCredentials: true,  // Ensures cookies are sent along with requests
});

// ✅ Interceptor to log cookies (optional for debugging)
apiClient.interceptors.request.use(
    (config) => {
        console.log("Sending request with credentials:", config.withCredentials);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

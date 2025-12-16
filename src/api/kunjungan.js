import axios from "axios";
import { tokenUser } from "./auth";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true
});

axiosJWT.interceptors.request.use(
    async (config) => {
        const response = await tokenUser(); // ✅ tunggu token dulu
        const token = response.data.data.access_token;
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export const insertKunjungan = async (pasienId, poliklinikId, dokterId) => {
    try {
        const response = await axiosJWT.post(`/api/v1/kunjungan`, {
            pasienId,
            poliklinikId,
            dokterId
        });
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const getKunjungan = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/api/v1/kunjungan`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
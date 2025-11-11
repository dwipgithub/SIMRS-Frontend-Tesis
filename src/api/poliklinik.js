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

export const getPoliklinik = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/backend/poliklinik`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data poliklinik:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const showPoliklinik = async (id) => {
    try {
        const response = await axiosJWT.get(`/backend/poliklinik/${id}`);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data poliklinik:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
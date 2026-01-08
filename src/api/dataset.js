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

export const getDataset = async () => {
    try {
        const response = await axiosJWT.get(`/api/v1/dataset/penyakit-jantung`, {});
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data modeling:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const getDatasetClassDistribution = async () => {
    try {
        const response = await axiosJWT.get(`/api/v1/dataset/penyakit-jantung/distribusi-kelas`, {});
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data modeling:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const getDatasetStatistic = async () => {
    try {
        const response = await axiosJWT.get(`/api/v1/dataset/penyakit-jantung/statistik`, {});
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data statistics:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
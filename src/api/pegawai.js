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

export const getPegawai = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/api/v1/pegawai`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const showPegawai = async (id) => {
    try {
        const response = await axiosJWT.get(`/api/v1/pegawai/${id}`);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
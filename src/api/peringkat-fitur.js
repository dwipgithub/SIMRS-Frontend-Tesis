import axios from "axios";
import { tokenUser } from "./auth";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true
});

axiosJWT.interceptors.request.use(
    async (config) => {
        const response = await tokenUser(); 
        const token = response.data.data.access_token;
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export const getPeringkatFitur = async () => {
    try {
        const response = await axiosJWT.get(`/api/v1/model-klasifikasi/penyakit-jantung/peringkat-fitur`, {});
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data modeling:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
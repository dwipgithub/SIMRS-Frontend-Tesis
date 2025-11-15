import axios from "axios";
import { tokenUser } from "./auth";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true,
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
);

export const insertPemeriksaan = async (kunjunganId, keluhan, diagnosa, tindakan) => {
    try {
        const response = await axiosJWT.post(`/backend/pemeriksaan`, {
            kunjunganId,
            keluhan,
            diagnosa,
            tindakan,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const getPemeriksaan = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/backend/pemeriksaan`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};


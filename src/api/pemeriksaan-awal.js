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

export const insertPemeriksaanAwal = async (
    kunjunganId,
    tekananDarahSistolik,
    tekananDarahDiastolik,
    denyutNadi,
    suhuTubuh,
    tinggiBadan,
    beratBadan
) => {
    try {
        const response = await axiosJWT.post(`/backend/pemeriksaan-awal`, {
            kunjunganId,
            tekananDarahSistolik,
            tekananDarahDiastolik,
            denyutNadi,
            suhuTubuh,
            tinggiBadan,
            beratBadan,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const getPemeriksaanAwal = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/backend/pemeriksaan-awal`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};


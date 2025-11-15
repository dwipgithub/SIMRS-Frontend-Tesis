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

export const insertPrediksiPenyakitJantung = async (Usia, Jenis_Kelamin, Riwayat_Hipertensi, Riwayat_Diabetes, Riwayat_Merokok, Riwayat_Jantung_Keluarga, BMI, Tekanan_Darah_Sistolik, Tekanan_Darah_Diastolik, Kadar_LDL, Kadar_HDL, Kolesterol_Total, Gula_Darah_Puasa, Denyut_Nadi) => {
    try {
        const response = await axiosJWT.post(`/backend/prediksi-penyakit-jantung`, {
            Usia,
            Jenis_Kelamin,
            Riwayat_Hipertensi,
            Riwayat_Diabetes,
            Riwayat_Merokok,
            Riwayat_Jantung_Keluarga,
            BMI,
            Tekanan_Darah_Sistolik,
            Tekanan_Darah_Diastolik,
            Kadar_LDL,
            Kadar_HDL,
            Kolesterol_Total,
            Gula_Darah_Puasa,
            Denyut_Nadi,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};
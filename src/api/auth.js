import axios from "axios";

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`/backend/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const logoutUser = async() => {
    try {
        await axios.delete(`/backend/logout`, {})
    } catch (error) {
        console.error("Logout error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const tokenUser = async() => {
    try {
        const response = await axios.get(`/backend/token`, {})
        return response
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}
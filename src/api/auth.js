import axios from "axios";

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`/api/v1/login`, {
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
        await axios.delete(`/api/v1/logout`, {})
    } catch (error) {
        console.error("Logout error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const tokenUser = async() => {
    try {
        const response = await axios.get(`/api/v1/token`, {})
        return response
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}
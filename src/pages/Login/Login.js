import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../../api/auth";
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await loginUser(email, password);
            navigate("/beranda")
        } catch (err) {
            setError(err.message || "Login gagal, periksa kembali email/password");
        } finally {

        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                backgroundColor: "white",
                fontFamily: "'Pacifico', cursive",
            }}
        >
            <div
                className="text-center"
                style={{
                    width: "450px",
                    backgroundColor: "white",
                    padding: "20px 30px",
                }}
            >
                {/* Ikon di atas form */}
                <FaUserCircle
                    style={{
                        fontSize: "5rem",
                        color: "#555",
                        marginBottom: "15px",
                    }}
                />

                <h2 className="mb-4" style={{ fontSize: "2.4rem" }}>
                    Selamat Datang
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-3 text-start position-relative">
                        <label
                            htmlFor="email"
                            className="form-label"
                            style={{ fontSize: "1.3rem", marginBottom: "0.2rem", fontFamily: '"Times New Roman", serif' }}
                        >
                            Email
                        </label>
                        <div className="d-flex align-items-center">
                            <FaEnvelope
                                style={{
                                    position: "absolute",
                                    left: "10px",
                                    color: "#aaa",
                                    fontSize: "1.2rem",
                                }}
                            />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control ps-5"
                                style={{
                                    border: "none",
                                    borderBottom: "2px solid #ddd",
                                    outline: "none",
                                    boxShadow: "none",
                                    backgroundColor: "white",
                                    borderRadius: "0",
                                    fontSize: "1.2rem",
                                    fontFamily: '"Times New Roman", serif',
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-4 text-start position-relative">
                        <label
                            htmlFor="password"
                            className="form-label"
                            style={{ fontSize: "1.3rem", marginBottom: "0.2rem", fontFamily: '"Times New Roman", serif' }}
                        >
                            Password
                        </label>
                        <div className="d-flex align-items-center">
                            <FaLock
                                style={{
                                    position: "absolute",
                                    left: "10px",
                                    color: "#aaa",
                                    fontSize: "1.2rem",
                                }}
                            />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control ps-5"
                                style={{
                                    border: "none",
                                    borderBottom: "2px solid #ddd",
                                    outline: "none",
                                    boxShadow: "none",
                                    backgroundColor: "white",
                                    borderRadius: "0",
                                    fontSize: "1.2rem",
                                }}
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-danger mb-3" style={{ fontSize: "1rem" }}>
                            {error}
                        </div>
                    )}

                    {/* Tombol Masuk */}
                    <button
                        type="submit"
                        className="btn w-100 d-flex justify-content-center align-items-center gap-2"
                        style={{
                            backgroundColor: "#444",
                            color: "white",
                            border: "none",
                            borderRadius: "25px",
                            fontSize: "1.2rem",
                            padding: "10px",
                            transition: "background-color 0.3s ease",
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#555")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
                    >
                        <FaSignInAlt />
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

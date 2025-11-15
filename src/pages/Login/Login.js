import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

// Style constants
const styles = {
    container: {
        backgroundColor: "white",
        fontFamily: "'Pacifico', cursive",
    },
    card: {
        width: "350px",
        backgroundColor: "white",
        padding: "20px 25px",
    },
    icon: {
        fontSize: "3.5rem",
        color: "#555",
        marginBottom: "10px",
    },
    title: {
        fontSize: "1.8rem",
    },
    label: {
        fontSize: "1rem",
        marginBottom: "0.2rem",
        fontFamily: '"Times New Roman", serif',
    },
    inputIcon: {
        position: "absolute",
        left: "10px",
        color: "#aaa",
        fontSize: "1rem",
    },
    input: {
        border: "none",
        borderBottom: "2px solid #ddd",
        outline: "none",
        boxShadow: "none",
        backgroundColor: "white",
        borderRadius: "0",
        fontSize: "1rem",
        fontFamily: '"Times New Roman", serif',
        padding: "8px 5px 8px 35px",
    },
    button: {
        backgroundColor: "#444",
        color: "white",
        border: "none",
        borderRadius: "20px",
        fontSize: "1rem",
        padding: "8px",
        transition: "background-color 0.3s ease",
    },
    buttonHover: {
        backgroundColor: "#555",
    },
    buttonDisabled: {
        backgroundColor: "#999",
        cursor: "not-allowed",
    },
    error: {
        fontSize: "0.9rem",
    },
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!email.trim()) {
            setError("Email tidak boleh kosong");
            return false;
        }
        if (!password.trim()) {
            setError("Password tidak boleh kosong");
            return false;
        }
        if (!email.includes("@")) {
            setError("Format email tidak valid");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await loginUser(email, password);
            navigate("/beranda");
        } catch (err) {
            setError(
                err.message || "Login gagal, periksa kembali email/password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError("");
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={styles.container}
        >
            <div className="text-center" style={styles.card}>
                <FaUserCircle style={styles.icon} aria-hidden="true" />

                <h2 className="mb-3" style={styles.title}>
                    Selamat Datang
                </h2>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-2 text-start position-relative">
                        <label
                            htmlFor="email"
                            className="form-label"
                            style={styles.label}
                        >
                            Email
                        </label>
                        <div className="d-flex align-items-center">
                            <FaEnvelope
                                style={styles.inputIcon}
                                aria-hidden="true"
                            />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleInputChange(setEmail)}
                                className="form-control"
                                style={styles.input}
                                disabled={isLoading}
                                required
                                aria-describedby={error ? "error-message" : undefined}
                            />
                        </div>
                    </div>

                    <div className="mb-3 text-start position-relative">
                        <label
                            htmlFor="password"
                            className="form-label"
                            style={styles.label}
                        >
                            Password
                        </label>
                        <div className="d-flex align-items-center">
                            <FaLock
                                style={styles.inputIcon}
                                aria-hidden="true"
                            />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={handleInputChange(setPassword)}
                                className="form-control"
                                style={styles.input}
                                disabled={isLoading}
                                required
                                aria-describedby={error ? "error-message" : undefined}
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            id="error-message"
                            className="text-danger mb-3"
                            style={styles.error}
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn w-100 d-flex justify-content-center align-items-center gap-2"
                        style={{
                            ...styles.button,
                            ...(isLoading && styles.buttonDisabled),
                        }}
                        disabled={isLoading}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor =
                                    styles.buttonHover.backgroundColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor =
                                    styles.button.backgroundColor;
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <FaSignInAlt aria-hidden="true" />
                                Masuk
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

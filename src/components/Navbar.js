import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { logoutUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true); // ubah sesuai status login
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/')
        } catch (err) {
            toast.error(err.message);
            navigate('/')
        }
    };

    return (
        <nav
            className="navbar navbar-light bg-white border-bottom shadow-sm px-4"
            style={{
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 1030,
                height: "60px",
            }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Logo & Judul */}
                <span
                    className="navbar-brand mb-0 h1 d-flex align-items-center"
                    style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "1.7rem",
                        fontFamily: "'Orbitron', sans-serif", // font seperti robot
                        textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                    }}
                >
                    SIMRS
                </span>

                {/* Bagian kanan */}
                <div>
                    {isLoggedIn ? (
                        <Dropdown align="end">
                            <Dropdown.Toggle
                                variant="light"
                                id="dropdown-basic"
                                className="d-flex align-items-center"
                                style={{
                                    border: "none",
                                    background: "none",
                                    color: "black",
                                    fontSize: "0.95rem",
                                    fontWeight: "500",
                                }}
                            >
                                <FaUserCircle
                                    style={{ fontSize: "1.6rem", marginRight: "8px", color: "black" }}
                                />
                                <span>Nama Pengguna</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href="#/profile">Profil Saya</Dropdown.Item>
                                <Dropdown.Item href="#/settings">Pengaturan</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    ) : (
                        <button
                            className="btn btn-outline-dark btn-sm"
                            style={{
                                borderRadius: "20px",
                                fontSize: "0.9rem",
                                padding: "5px 15px",
                            }}
                            onClick={() => setIsLoggedIn(true)}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom'

const Sidebar = () => {
    const menus = [
        { name: "Kunjungan", path: "/kunjungan" },
        { name: "Pemeriksaan", path: "/pemeriksaan" },
        { name: "Hasil Lab", path: "/hasil-lab" },
    ];

    return (
        <div
            className="d-flex flex-column p-3 bg-white"
            style={{
                width: "260px",
                minHeight: "100vh",
                position: "fixed",
                top: "60px",
                left: "60px",
                overflowY: "auto",
                border: "none",
                boxShadow: "none",
                fontFamily: "'Times New Roman', Times, serif",
            }}
        >
            <ul className="nav flex-column mb-auto" style={{ lineHeight: "1.3" }}>
                {menus.map((menu, index) => (
                    <li
                        className="nav-item"
                        key={index}
                        style={{
                            marginBottom: "4px", // 🔹 jarak antar item lebih rapat
                        }}
                    >
                        <Link
                            to={menu.path}
                            className="nav-link"
                            style={{
                                color: "#000", // hitam sesuai preferensimu
                                fontWeight: "500",
                                fontSize: "1rem",
                                backgroundColor: "transparent",
                                paddingLeft: "0",
                                textDecoration: "none",
                                paddingTop: "2px",
                                paddingBottom: "2px",
                            }}
                        >
                            {menu.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState(null);

    const menus = [
        { name: "Kunjungan", path: "/kunjungan" },
        { name: "Pemeriksaan", path: "/kunjungan" },
        { name: "Laboratorium", path: "/hasil-lab" },
        {
            name: "Machine Learning",
            subMenus: [
                { name: "Dataset", path: "/dataset" },
                { name: "Evaluasi Model", path: "/evaluasi-model" },
            ],
        },
    ];

    const toggleSubMenu = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

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
            <ul className="nav flex-column mb-auto" style={{ lineHeight: "1.2" }}>
                {menus.map((menu, index) => (
                    <li key={index} className="nav-item" style={{ marginBottom: "2px" }}>
                        {menu.subMenus ? (
                            <>
                                <button
                                    className="btn btn-link text-start w-100"
                                    onClick={() => toggleSubMenu(index)}
                                    style={{
                                        color: "#000",
                                        fontWeight: "500",
                                        fontSize: "0.95rem",
                                        textDecoration: "none",
                                        padding: "2px 0",
                                        margin: "0",
                                    }}
                                >
                                    {menu.name}
                                </button>

                                {/* Submenu dengan garis penghubung titik-titik */}
                                {openMenu === index && (
                                    <ul
                                        className="nav flex-column ms-3"
                                        style={{
                                            marginTop: "4px",
                                            borderLeft: "1px dotted #aaa", // 🔹 garis penghubung vertikal
                                            paddingLeft: "10px",
                                        }}
                                    >
                                        {menu.subMenus.map((sub, subIndex) => (
                                            <li
                                                key={subIndex}
                                                className="nav-item"
                                                style={{
                                                    marginBottom: "2px",
                                                    borderBottom: "1px dotted #ccc", // 🔹 garis horizontal antar submenu
                                                    paddingBottom: "2px",
                                                }}
                                            >
                                                <Link
                                                    to={sub.path}
                                                    className="nav-link"
                                                    style={{
                                                        color: "#333",
                                                        fontSize: "0.9rem",
                                                        textDecoration: "none",
                                                        padding: "1px 0",
                                                    }}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Link
                                to={menu.path}
                                className="nav-link"
                                style={{
                                    color: "#000",
                                    fontWeight: "500",
                                    fontSize: "0.95rem",
                                    textDecoration: "none",
                                    padding: "2px 0",
                                }}
                            >
                                {menu.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;

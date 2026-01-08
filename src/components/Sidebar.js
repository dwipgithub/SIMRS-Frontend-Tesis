import React, { useState, useEffect, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    // track which top-level menus are open (default: all open)
    const [openMenus, setOpenMenus] = useState(() => {
        const m = {};
        // will be populated after `menus` is created in the next lines
        return m;
    });

    const menus = useMemo(() => [
        { name: "Kunjungan", path: "/kunjungan", icon: "👥" },
        { name: "Pemeriksaan", path: "/pemeriksaan", icon: "🩺" },
        { name: "Laboratorium", path: "/laboratorium", icon: "🧪" },
        {
            name: "Model Klasfikasi",
            icon: "🧠",
            subMenus: [
                {
                    name: "Dataset",
                    icon: "📁",
                    subMenus: [
                        { name: "Variabel", path: "/dataset/variabel", icon: "🗂️" },
                        { name: "Distribusi Kelas", path: "/dataset/distribusi-kelas", icon: "📊" },
                        { name: "Statistik", path: "/dataset/statistik", icon: "📈" }
                    ],
                },
                { name: "Peringkat Fitur", path: "/model-klasifikasi/peringkat-fitur", icon: "⭐" },
                { name: "Pelatihan Model", path: "/model-klasifikasi/pelatihan-model", icon: "🎯" },
                { name: "Evaluasi Model", path: "/model-klasifikasi/evaluasi-model", icon: "📋" },
            ],
        },
    ], []);

    const toggleSubMenu = (index) => {
        setOpenMenus((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // nested open state: map parentIndex -> { subIndex: true }
    const [openSubMenus, setOpenSubMenus] = useState(() => ({}));
    const toggleNested = (parentIndex, subIndex) => {
        setOpenSubMenus((prev) => {
            const parent = prev[parentIndex] || {};
            return { ...prev, [parentIndex]: { ...parent, [subIndex]: !parent[subIndex] } };
        });
    };

    const location = useLocation();
    const pathname = location.pathname;

    const isPathActive = useCallback((path) => {
        if (!path) return false;
        return pathname === path || pathname.startsWith(path);
    }, [pathname]);

    const isMenuActive = (menu) => {
        if (menu.path && isPathActive(menu.path)) return true;
        if (menu.subMenus) {
            return menu.subMenus.some((sub) => {
                if (sub.path && isPathActive(sub.path)) return true;
                if (sub.subMenus) {
                    return sub.subMenus.some((ss) => ss.path && isPathActive(ss.path));
                }
                return false;
            });
        }
        return false;
    };

    // Auto-open parent menus when a child route is active
    useEffect(() => {
        // Build the maps we want to open by default
        const defaultOpenMenus = {};
        const defaultOpenSubMenus = {};
        menus.forEach((menu, i) => {
            // default: keep entries undefined so initial render is collapsed
            // we'll open them after mount to trigger CSS transitions
            defaultOpenMenus[i] = true;
            if (menu.subMenus) {
                const subMap = {};
                menu.subMenus.forEach((sub, sIdx) => {
                    if (sub.subMenus) subMap[sIdx] = true;
                });
                if (Object.keys(subMap).length) defaultOpenSubMenus[i] = subMap;
            }
        });

        // Also ensure active-route groups are marked open
        menus.forEach((menu, mIdx) => {
            if (menu.subMenus) {
                const activeSubIndex = menu.subMenus.findIndex((sub) => {
                    if (sub.path && isPathActive(sub.path)) return true;
                    if (sub.subMenus) return sub.subMenus.some((ss) => ss.path && isPathActive(ss.path));
                    return false;
                });
                if (activeSubIndex !== -1) {
                    defaultOpenMenus[mIdx] = true;
                    defaultOpenSubMenus[mIdx] = { ...(defaultOpenSubMenus[mIdx] || {}), [activeSubIndex]: true };
                }
            }
        });

        // Delay applying the 'open' state to let the initial collapsed DOM render,
        // then expand to trigger the CSS transitions. Increased delay for smoother visibility.
        const t = setTimeout(() => {
            setOpenMenus((prev) => ({ ...prev, ...defaultOpenMenus }));
            setOpenSubMenus((prev) => ({ ...(prev || {}), ...defaultOpenSubMenus }));
        }, 140);

        return () => clearTimeout(t);
    }, [pathname, menus, isPathActive]);

    return (
        <div
            className="d-flex flex-column p-3"
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
            <style>{`
                .sidebar-menu{ transition: transform .15s ease, filter .15s ease; }
                .sidebar-menu:hover{ filter: brightness(1.06); transform: translateX(6px); }
                .sidebar-submenu{ transition: transform .15s ease, background-color .15s ease; background: transparent; border: none; }
                .sidebar-submenu:hover{ background: rgba(255,122,24,0.12); transform: translateX(6px); }
                /* Smooth collapse/expand for submenu and nested groups (slower) */
                .submenu-collapse{ max-height: 0; overflow: hidden; opacity: 0; transform: translateY(-8px); transition: max-height 800ms cubic-bezier(.2,.9,.2,1), opacity 800ms ease, transform 800ms cubic-bezier(.2,.9,.2,1); }
                .submenu-collapse.open{ max-height: 2000px; opacity: 1; transform: translateY(0); transition-delay: 80ms; }
                /* Stagger deeper nested opens for more pleasant effect */
                .submenu-collapse.open .submenu-collapse.open{ transition-delay: 160ms; }
                .submenu-collapse.open .submenu-collapse.open .submenu-collapse.open{ transition-delay: 260ms; }
            `}</style>
            <ul className="nav flex-column mb-auto" style={{ lineHeight: "1.2" }}>
                {menus.map((menu, index) => (
                    <li key={index} className="nav-item" style={{ marginBottom: "2px" }}>
                        {menu.subMenus ? (
                            <>
                                <button
                                    className="btn btn-link text-start w-100 sidebar-menu"
                                    onClick={() => toggleSubMenu(index)}
                                    style={{
                                        color: "#fff",
                                        fontWeight: "600",
                                        fontSize: "0.95rem",
                                        textDecoration: "none",
                                        padding: "8px 10px",
                                        margin: "0",
                                        background: "linear-gradient(90deg,#ff7a18,#ffb347)",
                                        borderRadius: "8px",
                                        border: "none",
                                        display: 'flex',
                                        alignItems: 'center',
                                        ...(isMenuActive(menu) && { borderLeft: '6px solid #ff7a18', background: 'rgba(255,122,24,0.12)', color: '#000' })
                                    }}
                                >
                                    <span style={{ marginRight: 8 }}>{menu.icon}</span>
                                    {menu.name}
                                </button>

                                {/* Submenu dengan garis penghubung titik-titik */}
                                <ul
                                    className={"nav flex-column ms-3 submenu-collapse " + (openMenus[index] ? 'open' : '')}
                                    style={{
                                        marginTop: "4px",
                                        borderLeft: "2px dotted #ff7a18", // 🔹 garis penghubung vertikal (orange)
                                        paddingLeft: "10px",
                                    }}
                                >
                                        {menu.subMenus.map((sub, subIndex) => (
                                            <li
                                                key={subIndex}
                                                className="nav-item"
                                                style={{
                                                    marginBottom: "2px",
                                                    borderBottom: "2px dotted #ff7a18",
                                                    paddingBottom: "2px",
                                                }}
                                            >
                                                {sub.subMenus ? (
                                                    <>
                                                        <button
                                                            className="btn btn-link text-start w-100 sidebar-submenu"
                                                            onClick={() => toggleNested(index, subIndex)}
                                                            style={{
                                                                color: "#000",
                                                                fontSize: "0.9rem",
                                                                textDecoration: "none",
                                                                padding: "6px 10px",
                                                                margin: "4px 0",
                                                                borderRadius: 6,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                ...(isMenuActive(menu) && openSubMenus[index] && openSubMenus[index][subIndex] && { background: 'rgba(255,122,24,0.12)', fontWeight: 700 })
                                                            }}
                                                        >
                                                            <span style={{ marginRight: 8 }}>{sub.icon}</span>
                                                            {sub.name}
                                                        </button>

                                                        <ul
                                                            className={"nav flex-column ms-3 submenu-collapse " + (openSubMenus[index] && openSubMenus[index][subIndex] ? 'open' : '')}
                                                            style={{
                                                                marginTop: "4px",
                                                                paddingLeft: "10px",
                                                                borderLeft: "2px dotted #ff7a18", // dotted connector for nested group
                                                            }}
                                                        >
                                                                {sub.subMenus.map((ss, ssIndex) => (
                                                                    <li
                                                                        key={ssIndex}
                                                                        className="nav-item"
                                                                        style={{
                                                                            marginBottom: "2px",
                                                                            borderBottom: "2px dotted #ff7a18",
                                                                            paddingBottom: "4px",
                                                                            ...(ssIndex === 0 && {
                                                                                borderTop: "2px dotted #ff7a18", // dotted line above first nested item
                                                                                paddingTop: "4px",
                                                                            }),
                                                                        }}
                                                                    >
                                                                        <Link
                                                                            to={ss.path}
                                                                            className="nav-link sidebar-submenu"
                                                                            style={{
                                                                                color: "#000",
                                                                                fontSize: "0.9rem",
                                                                                textDecoration: "none",
                                                                                padding: "6px 10px",
                                                                                margin: "4px 0",
                                                                                borderRadius: 6,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                ...(isPathActive(ss.path) && { background: 'rgba(255,122,24,0.12)', fontWeight: 700 })
                                                                            }}
                                                                        >
                                                                            <span style={{ marginRight: 8 }}>{ss.icon}</span>
                                                                            {ss.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                ) : (
                                                    <Link
                                                        to={sub.path}
                                                        className="nav-link sidebar-submenu"
                                                        style={{
                                                            color: "#000",
                                                            fontSize: "0.9rem",
                                                            textDecoration: "none",
                                                            padding: "6px 10px",
                                                            margin: "4px 0",
                                                            borderRadius: 6,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            ...(isPathActive(sub.path) && { background: 'rgba(255,122,24,0.12)', fontWeight: 700 })
                                                        }}
                                                    >
                                                        <span style={{ marginRight: 8 }}>{sub.icon}</span>
                                                        {sub.name}
                                                    </Link>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                            </>
                        ) : (
                            <Link
                                to={menu.path}
                                className="nav-link sidebar-menu"
                                style={{
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "0.95rem",
                                    textDecoration: "none",
                                    padding: "8px 10px",
                                    margin: "0",
                                    background: "linear-gradient(90deg,#ff7a18,#ffb347)",
                                    borderRadius: "8px",
                                    display: 'flex',
                                    alignItems: 'center',
                                    ...(isMenuActive(menu) && { borderLeft: '6px solid #ff7a18', background: 'rgba(255,122,24,0.12)', color: '#000' })
                                }}
                            >
                                <span style={{ marginRight: 8 }}>{menu.icon}</span>
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

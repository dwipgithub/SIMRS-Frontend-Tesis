import React, { useEffect, useState } from "react";
import { getOrderLab } from "../../api/order-lab";
import { insertHasilLab } from "../../api/laboratorium";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import "../Kunjungan/Kunjungan.css";

// Style constants
const styles = {
    formContainer: {
        backgroundColor: "#e9ecef",
        border: "1px solid #bbb",
    },
    table: {
        marginBottom: 0,
        backgroundColor: "transparent",
    },
    tableCell: {
        padding: "0",
        paddingLeft: "6px",
    },
    tableCellInput: {
        padding: "0",
    },
    submitButton: {
        backgroundColor: "#ff6c37",
        borderColor: "#ff6c37",
        color: "white",
    },
    submitButtonHover: {
        backgroundColor: "#e65c2b",
        borderColor: "#e65c2b",
    },
    container: {
        fontFamily: "'Times New Roman', Times, serif",
    },
    selectButton: {
        backgroundColor: "#ff6c37",
        borderColor: "#ff6c37",
        color: "white",
        fontSize: "0.875rem",
        padding: "4px 12px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
    selectButtonHover: {
        backgroundColor: "#e65c2b",
        borderColor: "#e65c2b",
    },
    searchInputGroup: {
        width: "300px",
    },
};

const Laboratorium = () => {
    const navigate = useNavigate();

    // State
    const [orderLabList, setOrderLabList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("daftarOrderLab");
    const [tanggalFilter, setTanggalFilter] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    // Selected order lab state
    const [selectedOrderLab, setSelectedOrderLab] = useState(null);
    const [hasilLabData, setHasilLabData] = useState([]);

    // Load order lab
    const loadOrderLab = async () => {
        try {
            setLoading(true);
            const filters = { tanggal: tanggalFilter };
            const response = await getOrderLab(filters);
            setOrderLabList(response.data || []);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data order lab");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadOrderLab();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Select order lab
    const handleSelectOrderLab = (orderLab) => {
        setSelectedOrderLab(orderLab);
        // Initialize hasil lab data dengan orderLabDetail
        const initialData = orderLab.orderLabDetail.map((detail) => ({
            orderLabDetailId: detail.id,
            nilai: "",
        }));
        setHasilLabData(initialData);
        setActiveTab("hasilLab");
    };

    // Update hasil lab data
    const updateHasilLabData = (orderLabDetailId, nilai) => {
        setHasilLabData((prev) =>
            prev.map((item) =>
                item.orderLabDetailId === orderLabDetailId
                    ? { ...item, nilai }
                    : item
            )
        );
    };

    // Submit hasil lab
    const handleSubmitHasilLab = async (e) => {
        e.preventDefault();

        if (!selectedOrderLab) {
            toast.error("Harap pilih order lab terlebih dahulu!");
            return;
        }

        // Validate all values are filled
        const hasEmptyValue = hasilLabData.some(
            (item) => !item.nilai || item.nilai.trim() === ""
        );

        if (hasEmptyValue) {
            toast.error("Harap isi semua nilai hasil lab!");
            return;
        }

        try {
            setLoading(true);
            const data = hasilLabData.map((item) => ({
                orderLabDetailId: item.orderLabDetailId,
                nilai: parseFloat(item.nilai),
            }));

            await insertHasilLab(String(selectedOrderLab.id), data);
            toast.success("Hasil lab berhasil disimpan!");
            setSelectedOrderLab(null);
            setHasilLabData([]);
            loadOrderLab(); // Reload data
            setActiveTab("daftarOrderLab");
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    };

    // Render daftar order lab
    const renderDaftarOrderLab = () => (
        <div>
            <h4>📋 Daftar Order Lab</h4>
            <p className="text-muted">
                Pilih tanggal untuk melihat daftar order lab.
            </p>

            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <strong>Jumlah Data: {orderLabList.length}</strong>
                    <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={loadOrderLab}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                <div className="input-group" style={styles.searchInputGroup}>
                    <input
                        type="date"
                        className="form-control"
                        value={tanggalFilter}
                        onChange={(e) => setTanggalFilter(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-outline-orange"
                        type="button"
                        onClick={loadOrderLab}
                        disabled={loading}
                    >
                        {loading ? "Mencari..." : "Cari"}
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "5%" }}>Aksi</th>
                            <th>ID Order Lab</th>
                            <th>ID Kunjungan</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Jenis Kelamin</th>
                            <th>Poliklinik</th>
                            <th>Dokter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center text-muted py-3"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : orderLabList.length > 0 ? (
                            orderLabList.map((orderLab) => (
                                <tr
                                    key={orderLab.id}
                                    className={
                                        selectedOrderLab?.id === orderLab.id
                                            ? "table-info"
                                            : ""
                                    }
                                >
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            style={styles.selectButton}
                                            onClick={() =>
                                                handleSelectOrderLab(orderLab)
                                            }
                                            disabled={loading}
                                            onMouseEnter={(e) => {
                                                if (!loading) {
                                                    Object.assign(
                                                        e.target.style,
                                                        styles.selectButtonHover
                                                    );
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor =
                                                    "#ff6c37";
                                                e.target.style.borderColor =
                                                    "#ff6c37";
                                            }}
                                        >
                                            <FaCheck size={14} />
                                            Pilih
                                        </button>
                                    </td>
                                    <td>{orderLab.id}</td>
                                    <td>{orderLab.kunjungan?.id || "-"}</td>
                                    <td>
                                        {orderLab.kunjungan?.pasien?.nik || "-"}
                                    </td>
                                    <td>
                                        {orderLab.kunjungan?.pasien?.nama || "-"}
                                    </td>
                                    <td>
                                        {orderLab.kunjungan?.pasien?.jenisKelamin ||
                                            orderLab.kunjungan?.jenisKelamin ||
                                            "-"}
                                    </td>
                                    <td>
                                        {orderLab.kunjungan?.poliklinik?.nama ||
                                            "-"}
                                    </td>
                                    <td>
                                        {orderLab.kunjungan?.dokter?.nama || "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center text-muted py-3"
                                >
                                    Tidak ada order lab untuk tanggal ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render form hasil lab
    const renderHasilLab = () => (
        <div>
            <h4 className="mb-3">🧪 Hasil Pemeriksaan Laboratorium</h4>
            <p className="text-muted">
                Pilih order lab dari tab Daftar Order Lab, lalu isi hasil
                pemeriksaan.
            </p>

            {selectedOrderLab ? (
                <form
                    onSubmit={handleSubmitHasilLab}
                    className="rounded"
                    style={styles.formContainer}
                >
                    <table
                        className="table table-bordered mb-0"
                        style={styles.table}
                    >
                        <tbody>
                            <tr>
                                <td
                                    className="fw-bold"
                                    style={{ ...styles.tableCell, width: "20%" }}
                                >
                                    ID Order Lab
                                </td>
                                <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        value={selectedOrderLab.id}
                                        readOnly
                                    />
                                </td>

                                <td
                                    className="fw-bold"
                                    style={{ ...styles.tableCell, width: "20%" }}
                                >
                                    NIK
                                </td>
                                <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        value={
                                            selectedOrderLab.kunjungan?.pasien
                                                ?.nik || ""
                                        }
                                        readOnly
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td className="fw-bold" style={styles.tableCell}>
                                    Nama
                                </td>
                                <td style={styles.tableCellInput}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        value={
                                            selectedOrderLab.kunjungan?.pasien
                                                ?.nama || ""
                                        }
                                        readOnly
                                    />
                                </td>

                                <td className="fw-bold" style={styles.tableCell}>
                                    Poliklinik
                                </td>
                                <td style={styles.tableCellInput}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        value={
                                            selectedOrderLab.kunjungan?.poliklinik
                                                ?.nama || ""
                                        }
                                        readOnly
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-3 p-3">
                        <h5 className="mb-3">Hasil Pemeriksaan Lab</h5>
                        {selectedOrderLab.orderLabDetail &&
                        selectedOrderLab.orderLabDetail.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nama Pemeriksaan</th>
                                            <th>Nilai Rujukan</th>
                                            <th>Satuan</th>
                                            <th>Hasil</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrderLab.orderLabDetail.map(
                                            (detail) => {
                                                const hasilData = hasilLabData.find(
                                                    (item) =>
                                                        item.orderLabDetailId ===
                                                        detail.id
                                                );
                                                return (
                                                    <tr key={detail.id}>
                                                        <td>
                                                            {
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.nama
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.nilaiRujukanBawah
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.nilaiRujukanAtas
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.satuan
                                                            }
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="form-control"
                                                                value={
                                                                    hasilData?.nilai ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateHasilLabData(
                                                                        detail.id,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="..."
                                                                disabled={loading}
                                                                required
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-muted py-3">
                                Tidak ada detail pemeriksaan lab.
                            </div>
                        )}
                    </div>

                    <div className="text-end mt-2 me-2 mb-2">
                        <button
                            type="submit"
                            className="btn px-4"
                            style={styles.submitButton}
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    Object.assign(
                                        e.target.style,
                                        styles.submitButtonHover
                                    );
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#ff6c37";
                                e.target.style.borderColor = "#ff6c37";
                            }}
                        >
                            {loading ? "⏳ Menyimpan..." : "💾 Simpan"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="alert alert-info">
                    Silakan pilih order lab dari tab Daftar Order Lab terlebih
                    dahulu.
                </div>
            )}
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "hasilLab":
                return renderHasilLab();
            case "daftarOrderLab":
            default:
                return renderDaftarOrderLab();
        }
    };

    return (
        <div className="container" style={styles.container}>
            <h3 className="mb-4">🔬 Manajemen Laboratorium</h3>

            <ul className="nav nav-tabs" id="laboratoriumTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "daftarOrderLab" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("daftarOrderLab")}
                        type="button"
                    >
                        Daftar Order Lab
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "hasilLab" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("hasilLab")}
                        type="button"
                    >
                        Hasil Lab
                    </button>
                </li>
            </ul>

            <div
                className="tab-content border border-top-0 p-3"
                id="laboratoriumTabContent"
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default Laboratorium;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getPasien, showPasien } from "../../api/pasien";
import { getPegawai } from "../../api/pegawai";
import { getPoliklinik } from "../../api/poliklinik";
import { insertKunjungan, getKunjungan } from "../../api/kunjungan";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./Kunjungan.css";

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
    searchButton: {
        border: "1px solid #ff6c37",
        color: "#ff6c37",
        backgroundColor: "transparent",
        borderRadius: "6px",
        padding: "6px 10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.2s ease-in-out",
        minWidth: "40px",
        minHeight: "38px",
    },
    searchButtonHover: {
        backgroundColor: "#ff6c37",
        color: "white",
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
    searchInputGroup: {
        width: "300px",
    },
    container: {
        fontFamily: "'Times New Roman', Times, serif",
    },
};

// Utility functions
const getJenisKelamin = (kode) => {
    const jenisKelaminMap = {
        1: "Laki-laki",
        2: "Perempuan",
    };
    return jenisKelaminMap[kode] || "-";
};

const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const Kunjungan = () => {
    const navigate = useNavigate();
    const idPasienRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        idPasien: "",
        NIK: "",
        nama: "",
        jenisKelamin: "",
        tanggalLahir: "",
        alamat: "",
        poli: "",
        dokter: "",
    });

    // Lists state
    const [dokterList, setDokterList] = useState([]);
    const [poliklinikList, setPoliklinikList] = useState([]);

    // Search state
    const [keywordNamaPasien, setKeywordNamaPasien] = useState("");
    const [resultsDataPasien, setResultsDataPasien] = useState([]);
    const [resultsKunjungan, setResultsKunjungan] = useState([]);

    // UI state
    const [activeTab, setActiveTab] = useState("baru");
    const [loading, setLoading] = useState(false);

    // Date state
    const [tanggalKunjungan, setTanggalKunjungan] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    // Update form data helper
    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Fetch poliklinik
    const getPoli = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPoliklinik();
            setPoliklinikList(response.data);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data poliklinik");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch dokter
    const getDokter = useCallback(async () => {
        try {
            setLoading(true);
            const filters = { profesiId: 2 };
            const response = await getPegawai(filters);
            setDokterList(response.data);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data dokter");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        getPoli();
        getDokter();
    }, [getPoli, getDokter]);

    // Search pasien by name
    const handleGetPasien = async () => {
        if (!keywordNamaPasien.trim()) {
            toast.info("Silakan masukkan nama pasien");
            return;
        }

        try {
            setLoading(true);
            const filters = { nama: keywordNamaPasien };
            const response = await getPasien(filters);
            setResultsDataPasien(response.data);
        } catch (err) {
            toast.error(err.message || "Gagal mencari data pasien");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    // Search kunjungan by date
    const handleGetKunjungan = async () => {
        try {
            setLoading(true);
            const filters = { tanggal: tanggalKunjungan };
            const response = await getKunjungan(filters);
            setResultsKunjungan(response.data);
        } catch (err) {
            toast.error(err.message || "Gagal mencari data kunjungan");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    // Show pasien by ID
    const handleShowPasien = async (id) => {
        if (!id || id.trim() === "") {
            toast.info("Silakan isi ID Pasien!");
            return;
        }

        try {
            setLoading(true);
            const response = await showPasien(id);
            const pasien = response.data;

            setFormData({
                idPasien: id,
                NIK: pasien.nik || "",
                nama: pasien.nama || "",
                jenisKelamin: getJenisKelamin(pasien.jenis_kelamin),
                tanggalLahir: formatTanggal(pasien.tanggal_lahir),
                alamat: pasien.alamat || "",
                poli: formData.poli,
                dokter: formData.dokter,
            });

            setResultsDataPasien([pasien]);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data pasien");
            resetFormKunjungan();
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetFormKunjungan = () => {
        setFormData({
            idPasien: "",
            NIK: "",
            nama: "",
            jenisKelamin: "",
            tanggalLahir: "",
            alamat: "",
            poli: "",
            dokter: "",
        });
        setResultsDataPasien([]);
        idPasienRef.current?.focus();
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.idPasien) {
            toast.error("Harap cari pasien terlebih dahulu!");
            return;
        }

        if (!formData.poli || !formData.dokter) {
            toast.error("Harap pilih poliklinik dan dokter!");
            return;
        }

        try {
            setLoading(true);
            await insertKunjungan(
                formData.idPasien,
                formData.poli,
                formData.dokter
            );
            toast.success("Kunjungan berhasil disimpan!");
            resetFormKunjungan();
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
            resetFormKunjungan();
        } finally {
            setLoading(false);
        }
    };

    // Render kunjungan baru form
    const renderKunjunganBaru = () => (
        <div>
            <h4 className="mb-3">🏥 Pengisian Kunjungan Baru</h4>
            <p className="text-muted">
                Formulir ini digunakan untuk mencatat kunjungan pasien baru atau
                lama.
            </p>

            <form
                onSubmit={handleSubmit}
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
                                ID
                            </td>
                            <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                <div className="d-flex">
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        placeholder="Masukkan ID pasien..."
                                        value={formData.idPasien}
                                        onChange={(e) =>
                                            updateFormData("idPasien", e.target.value)
                                        }
                                        ref={idPasienRef}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleShowPasien(formData.idPasien)
                                        }
                                        disabled={loading}
                                        style={styles.searchButton}
                                        onMouseEnter={(e) => {
                                            Object.assign(
                                                e.target.style,
                                                styles.searchButtonHover
                                            );
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor =
                                                "transparent";
                                            e.target.style.color = "#ff6c37";
                                        }}
                                    >
                                        <FiSearch size={18} />
                                    </button>
                                </div>
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
                                    value={formData.NIK}
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
                                    value={formData.nama}
                                    readOnly
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Jenis Kelamin
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.jenisKelamin}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Tanggal Lahir
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.tanggalLahir}
                                    readOnly
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Alamat
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.alamat}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Poliklinik
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formData.poli}
                                    onChange={(e) =>
                                        updateFormData("poli", e.target.value)
                                    }
                                    disabled={loading}
                                >
                                    <option value="">-- Pilih Poliklinik --</option>
                                    {poliklinikList.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama}
                                        </option>
                                    ))}
                                </select>
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Dokter
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formData.dokter}
                                    onChange={(e) =>
                                        updateFormData("dokter", e.target.value)
                                    }
                                    disabled={loading}
                                >
                                    <option value="">-- Pilih Dokter --</option>
                                    {dokterList.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-end mt-2 me-2 mb-2">
                    <button
                        type="submit"
                        className="btn px-4"
                        style={styles.submitButton}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            Object.assign(
                                e.target.style,
                                styles.submitButtonHover
                            );
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
        </div>
    );

    // Render cari pasien
    const renderCariPasien = () => (
        <div>
            <h4>🔍 Cari Data Pasien</h4>
            <p>Halaman ini untuk mencari pasien yang sudah terdaftar.</p>

            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>Jumlah Data: {resultsDataPasien.length}</div>

                <div className="input-group" style={styles.searchInputGroup}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Cari berdasarkan Nama"
                        value={keywordNamaPasien}
                        onChange={(e) => setKeywordNamaPasien(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleGetPasien();
                            }
                        }}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-outline-orange"
                        type="button"
                        onClick={handleGetPasien}
                        disabled={loading}
                    >
                        {loading ? "Mencari..." : "Cari"}
                    </button>
                </div>
            </div>

            <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Jenis Kelamin</th>
                            <th>Tanggal Lahir</th>
                            <th>Alamat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center text-muted py-3"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : resultsDataPasien.length > 0 ? (
                            resultsDataPasien.map((pasien) => (
                                <tr key={pasien.id}>
                                    <td>{pasien.id}</td>
                                    <td>{pasien.nik}</td>
                                    <td>{pasien.nama}</td>
                                    <td>
                                        {getJenisKelamin(pasien.jenis_kelamin)}
                                    </td>
                                    <td>{formatTanggal(pasien.tanggal_lahir)}</td>
                                    <td>{pasien.alamat}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center text-muted py-3"
                                >
                                    Tidak ada data pasien ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render cari kunjungan
    const renderCariKunjungan = () => (
        <div>
            <h4>📝 Cari Kunjungan Lama</h4>
            <p>Halaman ini untuk melihat riwayat kunjungan yang sudah dicatat.</p>

            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>Jumlah Data: {resultsKunjungan.length}</div>

                <div className="input-group" style={styles.searchInputGroup}>
                    <input
                        type="date"
                        className="form-control"
                        value={tanggalKunjungan}
                        onChange={(e) => setTanggalKunjungan(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-outline-orange"
                        type="button"
                        onClick={handleGetKunjungan}
                        disabled={loading}
                    >
                        {loading ? "Mencari..." : "Cari"}
                    </button>
                </div>
            </div>

            <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Tanggal Lahir</th>
                            <th>Poliklinik</th>
                            <th>Dokter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center text-muted py-3"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : resultsKunjungan.length > 0 ? (
                            resultsKunjungan.map((kunjungan) => (
                                <tr key={kunjungan.id}>
                                    <td>{kunjungan.id}</td>
                                    <td>{kunjungan.pasien?.nik || "-"}</td>
                                    <td>{kunjungan.pasien?.nama || "-"}</td>
                                    <td>
                                        {formatTanggal(
                                            kunjungan.pasien?.tanggalLahir ||
                                                kunjungan.pasien?.tanggal_lahir
                                        )}
                                    </td>
                                    <td>{kunjungan.poliklinik?.nama || "-"}</td>
                                    <td>{kunjungan.dokter?.nama || "-"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center text-muted py-3"
                                >
                                    Tidak ada data kunjungan ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "cariPasien":
                return renderCariPasien();
            case "cariKunjungan":
                return renderCariKunjungan();
            case "baru":
            default:
                return renderKunjunganBaru();
        }
    };

    return (
        <div className="container" style={styles.container}>
            <h3 className="mb-4">📋 Manajemen Kunjungan</h3>

            <ul className="nav nav-tabs" id="kunjunganTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "baru" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("baru")}
                        type="button"
                    >
                        Kunjungan Baru
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "cariPasien" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("cariPasien")}
                        type="button"
                    >
                        Data Pasien
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "cariKunjungan" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("cariKunjungan")}
                        type="button"
                    >
                        Riwayat Kunjungan
                    </button>
                </li>
            </ul>

            <div
                className="tab-content border border-top-0 p-3"
                id="kunjunganTabContent"
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default Kunjungan;

import React, { useEffect, useState, useCallback, useRef } from "react";
import { getKunjungan } from "../../api/kunjungan";
import { insertPemeriksaanAwal } from "../../api/pemeriksaan-awal";
import { getPemeriksaanLab } from "../../api/pemeriksaan-lab";
import { insertOrderLab } from "../../api/order-lab";
import { getHasilLab } from "../../api/laboratorium";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
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

// Utility functions
const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const PemeriksaanAwal = () => {
    const navigate = useNavigate();
    const tekananDarahSistolikRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        kunjunganId: "",
        NIK: "",
        nama: "",
        jenisKelamin: "",
        tanggalLahir: "",
        alamat: "",
        poliklinik: "",
        dokter: "",
        keluhan: "",
        diagnosa: "",
        tindakan: "",
    });

    // Form pemeriksaan awal state
    const [formPemeriksaanAwal, setFormPemeriksaanAwal] = useState({
        kunjunganId: "",
        tekananDarahSistolik: "",
        tekananDarahDiastolik: "",
        denyutNadi: "",
        suhuTubuh: "",
        tinggiBadan: "",
        beratBadan: "",
    });

    // Lists state
    const [kunjunganHariIni, setKunjunganHariIni] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("dataPasien");
    const [searchKeyword, setSearchKeyword] = useState("");

    // Order Lab state
    const [pemeriksaanLabList, setPemeriksaanLabList] = useState([]);
    const [selectedPemeriksaanLab, setSelectedPemeriksaanLab] = useState([]);

    // Hasil Lab state
    const [hasilLabList, setHasilLabList] = useState([]);

    // Get today's date
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Load kunjungan hari ini
    const loadKunjunganHariIni = useCallback(async () => {
        try {
            setLoading(true);
            const filters = { tanggal: getTodayDate() };
            const response = await getKunjungan(filters);
            setKunjunganHariIni(response.data || []);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data kunjungan");
            navigate("/");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Load pemeriksaan lab
    const loadPemeriksaanLab = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPemeriksaanLab();
            setPemeriksaanLabList(response.data || []);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data pemeriksaan lab");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadKunjunganHariIni();
        loadPemeriksaanLab();
    }, [loadKunjunganHariIni, loadPemeriksaanLab]);

    // Auto focus ke input tekanan darah sistolik ketika tab pemeriksaan awal aktif
    useEffect(() => {
        if (activeTab === "pemeriksaanAwal" && formPemeriksaanAwal.kunjunganId) {
            setTimeout(() => {
                tekananDarahSistolikRef.current?.focus();
            }, 100);
        }
    }, [activeTab, formPemeriksaanAwal.kunjunganId]);

    // Select kunjungan untuk pemeriksaan
    const handleSelectKunjungan = (kunjungan) => {
        const selectedData = {
            kunjunganId: kunjungan.id,
            NIK: kunjungan.pasien?.nik || "",
            nama: kunjungan.pasien?.nama || "",
            jenisKelamin: kunjungan.pasien?.jenisKelamin || "",
            tanggalLahir: formatTanggal(
                kunjungan.pasien?.tanggal_lahir ||
                    kunjungan.pasien?.tanggalLahir
            ),
            alamat: kunjungan.pasien?.alamat || "",
            poliklinik: kunjungan.poliklinik?.nama || "",
            dokter: kunjungan.dokter?.nama || "",
        };

        setFormData({
            ...selectedData,
            keluhan: "",
            diagnosa: "",
            tindakan: "",
        });

        setFormPemeriksaanAwal({
            kunjunganId: kunjungan.id,
            tekananDarahSistolik: "",
            tekananDarahDiastolik: "",
            denyutNadi: "",
            suhuTubuh: "",
            tinggiBadan: "",
            beratBadan: "",
        });

        setSelectedPemeriksaanLab([]);
        
        // Load hasil lab berdasarkan kunjunganId
        loadHasilLab(kunjungan.id);
    };

    // Load hasil lab berdasarkan kunjunganId
    const loadHasilLab = async (kunjunganId) => {
        if (!kunjunganId) {
            setHasilLabList([]);
            return;
        }

        try {
            setLoading(true);
            const filters = { kunjunganId };
            const response = await getHasilLab(filters);
            setHasilLabList(response.data || []);
        } catch (err) {
            toast.error(err.message || "Gagal memuat data hasil lab");
        } finally {
            setLoading(false);
        }
    };

    // Update form pemeriksaan awal helper
    const updateFormPemeriksaanAwal = (field, value) => {
        setFormPemeriksaanAwal((prev) => ({ ...prev, [field]: value }));
    };
    // Submit form pemeriksaan awal
    const handleSubmitPemeriksaanAwal = async (e) => {
        e.preventDefault();

        if (!formPemeriksaanAwal.kunjunganId) {
            toast.error("Harap pilih pasien terlebih dahulu!");
            return;
        }

        if (!formPemeriksaanAwal.tekananDarahSistolik.trim()) {
            toast.error("Harap isi tekanan darah sistolik!");
            return;
        }

        if (!formPemeriksaanAwal.tekananDarahDiastolik.trim()) {
            toast.error("Harap isi tekanan darah diastolik!");
            return;
        }

        try {
            setLoading(true);
            await insertPemeriksaanAwal(
                formPemeriksaanAwal.kunjunganId,
                formPemeriksaanAwal.tekananDarahSistolik,
                formPemeriksaanAwal.tekananDarahDiastolik,
                formPemeriksaanAwal.denyutNadi,
                formPemeriksaanAwal.suhuTubuh,
                formPemeriksaanAwal.tinggiBadan,
                formPemeriksaanAwal.beratBadan
            );
            toast.success("Pemeriksaan awal berhasil disimpan!");
            setFormPemeriksaanAwal({
                kunjunganId: formPemeriksaanAwal.kunjunganId,
                tekananDarahSistolik: "",
                tekananDarahDiastolik: "",
                denyutNadi: "",
                suhuTubuh: "",
                tinggiBadan: "",
                beratBadan: "",
            });
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    };

    // Handle checkbox pemeriksaan lab
    const handleTogglePemeriksaanLab = (pemeriksaanLabId) => {
        setSelectedPemeriksaanLab((prev) => {
            if (prev.includes(pemeriksaanLabId)) {
                return prev.filter((id) => id !== pemeriksaanLabId);
            } else {
                return [...prev, pemeriksaanLabId];
            }
        });
    };

    // Submit order lab
    const handleSubmitOrderLab = async (e) => {
        e.preventDefault();

        if (!formData.kunjunganId) {
            toast.error("Harap pilih pasien terlebih dahulu!");
            return;
        }

        if (selectedPemeriksaanLab.length === 0) {
            toast.error("Harap pilih minimal satu pemeriksaan lab!");
            return;
        }

        try {
            setLoading(true);
            const data = selectedPemeriksaanLab.map((id) => ({
                pemeriksaanLabId: String(id),
            }));

            await insertOrderLab(String(formData.kunjunganId), data);
            toast.success("Order lab berhasil disimpan!");
            setSelectedPemeriksaanLab([]);
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    };

    // Filter kunjungan berdasarkan keyword
    const filteredKunjungan = kunjunganHariIni.filter((kunjungan) => {
        if (!searchKeyword.trim()) return true;

        const keyword = searchKeyword.toLowerCase();
        const nik = (kunjungan.pasien?.nik || "").toLowerCase();
        const nama = (kunjungan.pasien?.nama || "").toLowerCase();
        const poliklinik = (kunjungan.poliklinik?.nama || "").toLowerCase();
        const dokter = (kunjungan.dokter?.nama || "").toLowerCase();
        const idKunjungan = String(kunjungan.id || "").toLowerCase();
        const jenisKelamin = (kunjungan.pasien?.jenisKelamin || "").toLowerCase();

        return (
            nik.includes(keyword) ||
            nama.includes(keyword) ||
            poliklinik.includes(keyword) ||
            dokter.includes(keyword) ||
            idKunjungan.includes(keyword) ||
            jenisKelamin.includes(keyword)
        );
    });

    // Render form pemeriksaan awal
    const renderPemeriksaanAwal = () => (
        <div>
            <h4 className="mb-3">🩺 Pemeriksaan Awal Pasien</h4>
            <p className="text-muted">
                Pilih pasien dari tab Data Pasien, lalu isi data pemeriksaan
                awal.
            </p>

            <form
                onSubmit={handleSubmitPemeriksaanAwal}
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

                            <td
                                className="fw-bold"
                                style={{ ...styles.tableCell, width: "20%" }}
                            >
                                Nama
                            </td>
                            <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.nama}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
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
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Poliklinik
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.poliklinik}
                                    readOnly
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Dokter
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.dokter}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Tekanan Darah Sistolik
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    ref={tekananDarahSistolikRef}
                                    type="number"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.tekananDarahSistolik}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "tekananDarahSistolik",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                    required
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Tekanan Darah Diastolik
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="number"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.tekananDarahDiastolik}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "tekananDarahDiastolik",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                    required
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Denyut Nadi
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="number"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.denyutNadi}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "denyutNadi",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Suhu Tubuh
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.suhuTubuh}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "suhuTubuh",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Tinggi Badan (cm)
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.tinggiBadan}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "tinggiBadan",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Berat Badan (kg)
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control border-0"
                                    value={formPemeriksaanAwal.beratBadan}
                                    onChange={(e) =>
                                        updateFormPemeriksaanAwal(
                                            "beratBadan",
                                            e.target.value
                                        )
                                    }
                                    placeholder="..."
                                    disabled={loading || !formPemeriksaanAwal.kunjunganId}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-end mt-2 me-2 mb-2">
                    <button
                        type="submit"
                        className="btn px-4"
                        style={styles.submitButton}
                        disabled={loading || !formPemeriksaanAwal.kunjunganId}
                        onMouseEnter={(e) => {
                            if (!loading && formPemeriksaanAwal.kunjunganId) {
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
        </div>
    );

    // Render daftar kunjungan hari ini (Data Pasien)
    const renderDataPasien = () => (
        <div>
            <h4>📅 Data Pasien - Kunjungan Hari Ini</h4>
            <p className="text-muted">
                Tanggal: {formatTanggal(getTodayDate())}
            </p>

            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <strong>Jumlah Data: {filteredKunjungan.length}</strong>
                    {searchKeyword && (
                        <span className="text-muted ms-2">
                            (dari {kunjunganHariIni.length} total)
                        </span>
                    )}
                    <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={loadKunjunganHariIni}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                <div className="input-group" style={styles.searchInputGroup}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Cari NIK, Nama, Poliklinik, Dokter..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        disabled={loading}
                    />
                    <span className="input-group-text">
                        <FiSearch />
                    </span>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "5%" }}>Aksi</th>
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
                                    colSpan="7"
                                    className="text-center text-muted py-3"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filteredKunjungan.length > 0 ? (
                            filteredKunjungan.map((kunjungan) => (
                                <tr
                                    key={kunjungan.id}
                                    className={
                                        formData.kunjunganId === kunjungan.id
                                            ? "table-info"
                                            : ""
                                    }
                                >
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            style={styles.selectButton}
                                            onClick={() => {
                                                handleSelectKunjungan(kunjungan);
                                                setActiveTab("pemeriksaanAwal");
                                            }}
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
                                    <td>{kunjungan.id}</td>
                                    <td>{kunjungan.pasien?.nik || "-"}</td>
                                    <td>{kunjungan.pasien?.nama || "-"}</td>
                                    <td>{kunjungan.pasien?.jenisKelamin || "-"}</td>
                                    <td>{kunjungan.poliklinik?.nama || "-"}</td>
                                    <td>{kunjungan.dokter?.nama || "-"}</td>
                                </tr>
                            ))
                        ) : searchKeyword ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="text-center text-muted py-3"
                                >
                                    Tidak ada data yang sesuai dengan pencarian
                                    "{searchKeyword}".
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="text-center text-muted py-3"
                                >
                                    Tidak ada kunjungan hari ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render form order lab
    const renderOrderLab = () => (
        <div>
            <h4 className="mb-3">🧪 Order Lab</h4>
            <p className="text-muted">
                Pilih pasien dari tab Data Pasien, lalu pilih pemeriksaan lab
                yang ingin diorder.
            </p>

            <form
                onSubmit={handleSubmitOrderLab}
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

                            <td
                                className="fw-bold"
                                style={{ ...styles.tableCell, width: "20%" }}
                            >
                                Nama
                            </td>
                            <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.nama}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Poliklinik
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.poliklinik}
                                    readOnly
                                />
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Dokter
                            </td>
                            <td style={styles.tableCellInput}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={formData.dokter}
                                    readOnly
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-3 p-3">
                    <h5 className="mb-3">Daftar Pemeriksaan Lab</h5>
                    {loading ? (
                        <div className="text-center text-muted py-3">
                            Memuat data...
                        </div>
                    ) : pemeriksaanLabList.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: "5%" }}>Pilih</th>
                                        <th>Nama Pemeriksaan</th>
                                        <th>Nilai Rujukan</th>
                                        <th>Satuan</th>
                                        <th>Tarif</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pemeriksaanLabList.map((lab) => (
                                        <tr key={lab.id}>
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedPemeriksaanLab.includes(
                                                        lab.id
                                                    )}
                                                    onChange={() =>
                                                        handleTogglePemeriksaanLab(
                                                            lab.id
                                                        )
                                                    }
                                                    disabled={
                                                        loading ||
                                                        !formData.kunjunganId
                                                    }
                                                />
                                            </td>
                                            <td>{lab.nama}</td>
                                            <td>
                                                {lab.nilai_rujukan_bawah} -{" "}
                                                {lab.nilai_rujukan_atas}
                                            </td>
                                            <td>{lab.satuan}</td>
                                            <td>
                                                Rp{" "}
                                                {parseInt(lab.tarif).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-muted py-3">
                            Tidak ada data pemeriksaan lab.
                        </div>
                    )}

                    {selectedPemeriksaanLab.length > 0 && (
                        <div className="mt-3">
                            <strong>
                                Pemeriksaan terpilih: {selectedPemeriksaanLab.length}
                            </strong>
                        </div>
                    )}
                </div>

                <div className="text-end mt-2 me-2 mb-2">
                    <button
                        type="submit"
                        className="btn px-4"
                        style={styles.submitButton}
                        disabled={loading || !formData.kunjunganId}
                        onMouseEnter={(e) => {
                            if (!loading && formData.kunjunganId) {
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
        </div>
    );

    // Render hasil lab
    const renderHasilLab = () => (
        <div>
            <h4 className="mb-3">🔬 Hasil Pemeriksaan Laboratorium</h4>
            <p className="text-muted">
                Pilih pasien dari tab Data Pasien untuk melihat hasil lab.
            </p>

            {formData.kunjunganId ? (
                <div>
                    <div className="rounded mb-3" style={styles.formContainer}>
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

                                    <td
                                        className="fw-bold"
                                        style={{ ...styles.tableCell, width: "20%" }}
                                    >
                                        Nama
                                    </td>
                                    <td style={{ ...styles.tableCellInput, width: "30%" }}>
                                        <input
                                            type="text"
                                            className="form-control border-0"
                                            value={formData.nama}
                                            readOnly
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="fw-bold" style={styles.tableCell}>
                                        Poliklinik
                                    </td>
                                    <td style={styles.tableCellInput}>
                                        <input
                                            type="text"
                                            className="form-control border-0"
                                            value={formData.poliklinik}
                                            readOnly
                                        />
                                    </td>

                                    <td className="fw-bold" style={styles.tableCell}>
                                        Dokter
                                    </td>
                                    <td style={styles.tableCellInput}>
                                        <input
                                            type="text"
                                            className="form-control border-0"
                                            value={formData.dokter}
                                            readOnly
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {loading ? (
                        <div className="text-center text-muted py-3">
                            Memuat data hasil lab...
                        </div>
                    ) : hasilLabList.length > 0 ? (
                        hasilLabList.map((hasilLab) => (
                            <div
                                key={hasilLab.id}
                                className="rounded mb-3"
                                style={styles.formContainer}
                            >
                                <div className="p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            Hasil Lab #{hasilLab.id}
                                        </h5>
                                        <div>
                                            <small className="text-muted">
                                                Tanggal:{" "}
                                                {formatTanggal(hasilLab.tanggal)}
                                            </small>
                                            {hasilLab.petugasLab && (
                                                <small className="text-muted ms-2">
                                                    | Petugas:{" "}
                                                    {hasilLab.petugasLab.nama}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {hasilLab.hasilLabDetail &&
                                    hasilLab.hasilLabDetail.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Nama Pemeriksaan</th>
                                                        <th>Nilai Rujukan</th>
                                                        <th>Hasil</th>
                                                        <th>Satuan</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {hasilLab.hasilLabDetail.map(
                                                        (detail) => {
                                                            const nilai = parseFloat(
                                                                detail.nilai
                                                            );
                                                            const nilaiBawah = parseFloat(
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.nilaiRujukanBawah ||
                                                                    0
                                                            );
                                                            const nilaiAtas = parseFloat(
                                                                detail
                                                                    .pemeriksaanLab
                                                                    ?.nilaiRujukanAtas ||
                                                                    0
                                                            );
                                                            const isNormal =
                                                                nilai >=
                                                                    nilaiBawah &&
                                                                nilai <= nilaiAtas;

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
                                                                        <strong>
                                                                            {
                                                                                detail.nilai
                                                                            }
                                                                        </strong>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            detail
                                                                                .pemeriksaanLab
                                                                                ?.satuan
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`badge ${
                                                                                isNormal
                                                                                    ? "bg-success"
                                                                                    : "bg-danger"
                                                                            }`}
                                                                        >
                                                                            {isNormal
                                                                                ? "Normal"
                                                                                : "Tidak Normal"}
                                                                        </span>
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
                                            Tidak ada detail hasil lab.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="alert alert-info">
                            Belum ada hasil lab untuk kunjungan ini.
                        </div>
                    )}
                </div>
            ) : (
                <div className="alert alert-info">
                    Silakan pilih pasien dari tab Data Pasien terlebih dahulu.
                </div>
            )}
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "pemeriksaanAwal":
                return renderPemeriksaanAwal();
            case "orderLab":
                return renderOrderLab();
            case "hasilLab":
                return renderHasilLab();
            case "dataPasien":
            default:
                return renderDataPasien();
        }
    };

    return (
        <div className="container" style={styles.container}>
            <h3 className="mb-4">🏥 Manajemen Pemeriksaan</h3>

            <ul className="nav nav-tabs" id="pemeriksaanTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "dataPasien" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("dataPasien")}
                        type="button"
                    >
                        Data Pasien
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "pemeriksaanAwal" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("pemeriksaanAwal")}
                        type="button"
                    >
                        Pemeriksaan Awal
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "orderLab" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("orderLab")}
                        type="button"
                    >
                        Order Lab
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
                id="pemeriksaanTabContent"
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default PemeriksaanAwal;


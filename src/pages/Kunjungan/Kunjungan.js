import React, { useEffect, useState, useRef } from "react";
import { getPasien, showPasien } from "../../api/pasien"
import { getPegawai } from "../../api/pegawai"
import { getPoliklinik } from "../../api/poliklinik"
import { insertKunjungan, getKunjungan } from "../../api/kunjungan"
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'
import { FiSearch } from "react-icons/fi";
import "./Kunjungan.css";

const Kunjungan = () => {
    const [poli, setPoli] = useState("");
    const [dokter, setDokter] = useState("");
    const [errorMsg] = useState("");

    const [idPasien, setIdPasien] = useState("");
    const [NIK, setNIK] = useState("")
    const [nama, setNama] = useState("")
    const [jenisKelamin, setJenisKelamin] = useState("")
    const [tanggalLahir, setTanggalLahir] = useState("")
    const [alamat, setAlamat] = useState("")

    const [dokterList, setDokterList] = useState([]);
    const [poliklinikList, setPoliklinik] = useState([]);

    const [keywordNamaPasien, setKeywordNamaPasien] = useState("");
    const [resultsDataPasien, setResultsDataPasien] = useState([]);
    const [resultsKunjungan, setResultsKunjungan] = useState([]);
    const [loading, setLoading] = useState(false);
    const idPasienRef = useRef(null);
    const [activeTab, setActiveTab] = useState('baru');

    const [tanggalKunjungan, setTanggalKunjungan] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // format yyyy-mm-dd
    });

    const navigate = useNavigate()

    const getPoli = async () => {
        try {
            const response = await getPoliklinik();
            setPoliklinik(response.data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const getDokter = async () => {
        const filters = {
            profesiId: 2
        }

        try {
            const response = await getPegawai(filters);
            console.log(response.data)
            setDokterList(response.data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPoli()
        getDokter()
    }, [])

    const handleGetPasien = async () => {
        const filters = {
            nama: keywordNamaPasien
        }
        try {
            const response = await getPasien(filters);
            setResultsDataPasien(response.data);
        } catch (err) {
            toast.error(err.message);
            navigate("/")
        } finally {
            setLoading(false);
        }
    }

    const handleGetKunjungan = async () => {
        const filters = {
            tanggal: tanggalKunjungan
        }
        try {
            const response = await getKunjungan(filters);
            setResultsKunjungan(response.data);
        } catch (err) {
            toast.error(err.message);
            navigate("/")
        } finally {
            setLoading(false);
        }
    }

    const handleShowPasien = async (Id) => {
        if (!Id || Id.trim() === "") {
            toast.info("Silahkan isi ID Pasien!");
            return;
        }
        try {
            const response = await showPasien(Id);
            console.log(response.data)
            setNIK(response.data.nik)
            setNama(response.data.nama)
            setJenisKelamin(getJenisKelamin(response.data.jenis_kelamin))
            setTanggalLahir(formatTanggal(response.data.tanggal_lahir))
            setAlamat(response.data.alamat)
            setResultsDataPasien(response.data);
        } catch (err) {
            toast.error(err.message);
            resetFormKunjungan()
        } finally {
            setLoading(false);
        }
    }

    const resetFormKunjungan = () => {
        setIdPasien("");
        setNIK("");
        setNama("");
        setJenisKelamin("");
        setTanggalLahir("");
        setAlamat("");
        setPoli("");
        setDokter("");
        setResultsDataPasien([]);

        // Fokuskan kembali ke input ID pasien (jika ada)
        idPasienRef.current?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idPasien) {
            // alert("Harap cari pasien terlebih dahulu!");
            toast.error("Harap cari pasien terlebih dahulu!");
            return;
        }
        if (!poli || !dokter) {
            toast.error("Harap pilih poliklinik dan dokter!");
            return;
        }

        try {
            await insertKunjungan(idPasien, poli, dokter);
            toast.success("Kunjungan berhasil disimpan!");
            resetFormKunjungan()
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan");
            resetFormKunjungan()
        } finally {

        }
    };

    const getJenisKelamin = (kode) => {
        if (kode === 1) return "Laki-laki";
        if (kode === 2) return "Perempuan";
        return "-";
    };

    const formatTanggal = (tanggal) => {
        const date = new Date(tanggal);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const renderKunjunganBaru = () => (
        <div>
            <h4 className="mb-3">🏥 Pengisian Kunjungan Baru</h4>
            <p className="text-muted">
                Formulir ini digunakan untuk mencatat kunjungan pasien baru atau lama.
            </p>

            <form
                onSubmit={handleSubmit}
                className="rounded"
                style={{
                    backgroundColor: "#e9ecef",
                    border: "1px solid #bbb",
                }}
            >
                <table
                    className="table table-bordered mb-0"
                    style={{
                        marginBottom: 0,
                        backgroundColor: "transparent",
                    }}
                >
                    <tbody>
                        <tr>
                            <td className="fw-bold" style={{ width: "20%", padding: "0", paddingLeft: "6px" }}>ID</td>
                            <td style={{ width: "30%", padding: "0" }}>
                                <div className="d-flex">
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        placeholder="Masukkan ID pasien..."
                                        value={idPasien}
                                        onChange={(e) => setIdPasien(e.target.value)}
                                        ref={idPasienRef}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleShowPasien(idPasien)}
                                        disabled={loading}
                                        style={{
                                            border: "1px solid #ff6c37",
                                            color: "#ff6c37",
                                            backgroundColor: "transparent",
                                            borderRadius: "6px",
                                            padding: "6px 10px", // ⬅️ tombol proporsional untuk ikon
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            transition: "all 0.2s ease-in-out",
                                            minWidth: "40px",
                                            minHeight: "38px", // ⬅️ sejajar dengan input
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = "#ff6c37";
                                            e.target.style.color = "white";
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = "transparent";
                                            e.target.style.color = "#ff6c37";
                                        }}
                                    >
                                        <FiSearch size={18} />
                                    </button>
                                </div>
                                {errorMsg && <div className="text-danger ms-2">{errorMsg}</div>}
                            </td>

                            <td className="fw-bold" style={{ width: "20%", padding: "0", paddingLeft: "6px" }}>NIK</td>
                            <td style={{ width: "30%", padding: "0" }}>
                                <input
                                    type="text"
                                    className="form-control border-0"
                                    value={NIK}
                                    readOnly
                                />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Nama</td>
                            <td style={{ padding: "0" }}>
                                <input type="text" className="form-control border-0" value={nama} readOnly />
                            </td>

                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Jenis Kelamin</td>
                            <td style={{ padding: "0" }}>
                                <input type="text" className="form-control border-0" value={jenisKelamin} readOnly />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Tanggal Lahir</td>
                            <td style={{ padding: "0" }}>
                                <input type="text" className="form-control border-0" value={tanggalLahir} readOnly />
                            </td>

                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Alamat</td>
                            <td style={{ padding: "0" }}>
                                <input type="text" className="form-control border-0" value={alamat} readOnly />
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Poliklinik</td>
                            <td style={{ padding: "0" }}>
                                <select
                                    className="form-select border-0"
                                    value={poli}
                                    onChange={(e) => setPoli(e.target.value)}
                                >
                                    <option value="">-- Pilih Poliklinik --</option>
                                    {poliklinikList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </td>

                            <td className="fw-bold" style={{ padding: "0", paddingLeft: "6px" }}>Dokter</td>
                            <td style={{ padding: "0" }}>
                                <select
                                    className="form-select border-0"
                                    value={dokter}
                                    onChange={(e) => setDokter(e.target.value)}
                                >
                                    <option value="">-- Pilih Dokter --</option>
                                    {dokterList.map((d) => (
                                        <option key={d.id} value={d.id}>{d.nama}</option>
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
                        style={{
                            backgroundColor: "#ff6c37",   // warna orange khas Postman
                            borderColor: "#ff6c37",
                            color: "white",
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#e65c2b"; // sedikit lebih gelap saat hover
                            e.target.style.borderColor = "#e65c2b";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#ff6c37";
                            e.target.style.borderColor = "#ff6c37";
                        }}
                    >
                        💾 Simpan
                    </button>
                </div>

            </form>


            {/* <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">ID Pasien</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Masukkan ID pasien..."
                                value={idPasien}
                                onChange={(e) => setIdPasien(e.target.value)}
                                ref={idPasienRef}
                            />
                            <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => handleShowPasien(idPasien)}
                                disabled={loading}
                            >
                                {loading ? "Mencari..." : "Cari"}
                            </button>
                        </div>
                        {errorMsg && <div className="text-danger mt-2">{errorMsg}</div>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">NIK</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={NIK}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Nama</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={nama}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Jenis Kelamin</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={jenisKelamin}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Tanggal Lahir</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={tanggalLahir}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Alamat</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={alamat}
                                readOnly
                            />
                        </div>
                    </div>
                </div>


                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Poliklinik</label>
                        <select
                            className="form-select"
                            value={poli}
                            onChange={(e) => setPoli(e.target.value)}
                        >
                            <option value="">-- Pilih Poliklinik --</option>
                            {poliklinikList.map((poliklinik) => (
                                <option key={poliklinik.id} value={poliklinik.id}>
                                    {poliklinik.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Dokter</label>
                        <select
                            className="form-select"
                            value={dokter}
                            onChange={(e) => setDokter(e.target.value)}
                        >
                            <option value="">-- Pilih Dokter --</option>
                            {dokterList.map((dokter) => (
                                <option key={dokter.id} value={dokter.id}>
                                    {dokter.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-end">
                    <button type="submit" className="btn btn-primary px-4">
                        💾
                    </button>
                </div>
            </form> */}
        </div>
    );

    const renderCariPasien = () => (
        <div>
            <h4>🔍 Cari Data Pasien</h4>
            <p>Halaman ini untuk mencari pasien yang sudah terdaftar.</p>

            <div className="d-flex justify-content-between align-items-end mb-3">
                {/* 📊 Info jumlah data di kiri */}
                <div>
                    Jumlah Data: {resultsDataPasien.length}
                </div>

                {/* 🔍 Search box di kanan */}
                <div className="input-group" style={{ width: "300px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Cari berdasarkan Nama"
                        value={keywordNamaPasien}
                        onChange={(e) => setKeywordNamaPasien(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-orange"
                        type="button"
                        onClick={handleGetPasien}
                    >
                        Cari
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
                        {resultsDataPasien.length > 0 ? (
                            resultsDataPasien.map((pasien) => (
                                <tr key={pasien.id}>
                                    <td>{pasien.id}</td>
                                    <td>{pasien.nik}</td>
                                    <td>{pasien.nama}</td>
                                    <td>{getJenisKelamin(pasien.jenis_kelamin)}</td>
                                    <td>{formatTanggal(pasien.tanggal_lahir)}</td>
                                    <td>{pasien.alamat}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-3">
                                    Tidak ada data pasien ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCariKunjungan = () => (
        <div>
            <h4>📝 Cari Kunjungan Lama</h4>
            <p>Halaman ini untuk melihat riwayat kunjungan yang sudah dicatat.</p>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    Jumlah Data: {resultsKunjungan.length}
                </div>

                <div className="input-group" style={{ width: "300px" }}>
                    <input
                        type="date"
                        className="form-control"
                        value={tanggalKunjungan}
                        onChange={(e) => setTanggalKunjungan(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-orange"
                        type="button"
                        onClick={handleGetKunjungan}
                    >
                        Cari
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
                        {resultsKunjungan.length > 0 ? (
                            resultsKunjungan.map((kunjungan) => (
                                <tr key={kunjungan.id}>
                                    <td>{kunjungan.id}</td>
                                    <td>{kunjungan.pasien.nik}</td>
                                    <td>{kunjungan.pasien.nama}</td>
                                    <td>{formatTanggal(kunjungan.pasien.tanggalLahir)}</td>
                                    <td>{kunjungan.poliklinik.nama}</td>
                                    <td>{kunjungan.dokter.nama}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-3">
                                    Tidak ada data kunjungan ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Fungsi untuk menampilkan konten berdasarkan tab yang aktif
    const renderContent = () => {
        switch (activeTab) {
            case 'cariPasien':
                return renderCariPasien();
            case 'cariKunjungan':
                return renderCariKunjungan();
            case 'baru':
            default:
                return renderKunjunganBaru();
        }
    };

    return (
        <div className="container" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <h3 className="mb-4">📋 Manajemen Kunjungan</h3>
            <ul className="nav nav-tabs" id="kunjunganTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'baru' ? 'active' : ''}`}
                        onClick={() => setActiveTab('baru')}
                        type="button"
                    >
                        Kunjungan Baru
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'cariPasien' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cariPasien')}
                        type="button"
                    >
                        Data Pasien
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'cariKunjungan' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cariKunjungan')}
                        type="button"
                    >
                        Riwayat Kunjungan
                    </button>
                </li>
            </ul>

            {/* Bagian Konten Tab */}
            <div className="tab-content border border-top-0 p-3" id="kunjunganTabContent">
                {renderContent()}
            </div>
        </div>
    );
};

export default Kunjungan;
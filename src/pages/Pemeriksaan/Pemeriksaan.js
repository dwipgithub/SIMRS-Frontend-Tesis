import React, { useEffect, useState, useCallback, useRef } from "react";
import { getKunjungan } from "../../api/kunjungan";
import { insertPemeriksaanAwal, getPemeriksaanAwal } from "../../api/pemeriksaan-awal";
import { getPemeriksaanLab } from "../../api/pemeriksaan-lab";
import { insertOrderLab, getOrderLab } from "../../api/order-lab";
import { getHasilLab } from "../../api/laboratorium";
import { insertAnamnesis, getAnamnesis } from "../../api/anamnesis";
import { insertPrediksiPenyakitJantung } from "../../api/prediksi-penyakit-jantung";
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
    toggleSwitch: {
        position: "relative",
        display: "inline-block",
        width: "48px",
        height: "24px",
        cursor: "pointer",
        verticalAlign: "middle",
        marginRight: "10px"
    },
    toggleSlider: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ccc",
        borderRadius: "24px",
        transition: "0.3s",
    },
    toggleSliderOn: {
        backgroundColor: "#4caf50",
    },
    toggleCircle: {
        position: "absolute",
        width: "20px",
        height: "20px",
        backgroundColor: "white",
        borderRadius: "50%",
        top: "2px",
        left: "2px",
        transition: "0.3s"
    },
    toggleCircleOn: {
        transform: "translateX(24px)",
    }
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

// Calculate age from date of birth
const calculateAge = (tanggalLahir) => {
    if (!tanggalLahir) return null;
    const birthDate = new Date(tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Calculate BMI
const calculateBMI = (tinggiBadan, beratBadan) => {
    if (!tinggiBadan || !beratBadan) return null;
    const tinggiMeter = parseFloat(tinggiBadan) / 100;
    const beratKg = parseFloat(beratBadan);
    if (tinggiMeter <= 0 || beratKg <= 0) return null;
    return parseFloat((beratKg / (tinggiMeter * tinggiMeter)).toFixed(1));
};

// Convert jenis kelamin to number (1 for Laki-laki, 0 for Perempuan)
const convertJenisKelamin = (jenisKelamin) => {
    if (!jenisKelamin) return null;
    const jk = jenisKelamin.toLowerCase();
    if (jk.includes("laki") || jk === "l") return 1;
    if (jk.includes("perempuan") || jk === "p") return 0;
    return null;
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

    // Form anamnesis state
    const [formAnamnesis, setFormAnamnesis] = useState({
        kunjunganId: "",
        riwayatHipertensi: "",
        riwayatDiabetes: "",
        riwayatMerokok: "",
        riwayatJantungKeluarga: "",
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

    // Riwayat Pemeriksaan Awal state
    const [riwayatPemeriksaanAwal, setRiwayatPemeriksaanAwal] = useState([]);

    // Riwayat Anamnesis state
    const [riwayatAnamnesis, setRiwayatAnamnesis] = useState([]);

    // Riwayat Order Lab state
    const [riwayatOrderLab, setRiwayatOrderLab] = useState([]);

    // Prediksi Penyakit state
    const [dataPemeriksaanAwalPrediksi, setDataPemeriksaanAwal] = useState(null);
    const [dataAnamnesisPrediksi, setDataAnamnesis] = useState(null);
    const [prediksiResult, setPrediksiResult] = useState(null);

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


    // State untuk menyimpan apakah bagian perhitungan manual ditampilkan atau disembunyikan.
    // Nilai awal bernilai false, artinya bagian detail perhitungan manual tidak ditampilkan ketika pertama kali ditampilkan.
    const [showManualCalc, setShowManualCalc] = useState(false);

    // State untuk toggle informasi pendukung di tab prediksi penyakit
    const [showDataPasien, setShowDataPasien] = useState(false);
    const [showPemeriksaanAwal, setShowPemeriksaanAwal] = useState(false);
    const [showAnamnesis, setShowAnamnesis] = useState(false);
    const [showHasilLab, setShowHasilLab] = useState(false);


    // Load data on mount
    useEffect(() => {
        loadKunjunganHariIni();
        loadPemeriksaanLab();
        setShowManualCalc(false);
    }, [loadKunjunganHariIni, loadPemeriksaanLab]);

    // Auto focus ke input tekanan darah sistolik ketika tab pemeriksaan awal aktif
    useEffect(() => {
        if (activeTab === "pemeriksaanAwal" && formPemeriksaanAwal.kunjunganId) {
            setTimeout(() => {
                tekananDarahSistolikRef.current?.focus();
            }, 100);
        }
    }, [activeTab, formPemeriksaanAwal.kunjunganId]);

    // Load hasil lab saat tab prediksi penyakit dibuka jika belum ada data
    useEffect(() => {
        if (activeTab === "prediksiPenyakit" && formData.kunjunganId && hasilLabList.length === 0) {
            loadHasilLab(formData.kunjunganId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, formData.kunjunganId]);

    // Auto prediksi ketika tab prediksi penyakit aktif dan ada kunjunganId
    useEffect(() => {
        if (activeTab === "prediksiPenyakit" && formData.kunjunganId && hasilLabList.length > 0) {
            // Tunggu sebentar untuk memastikan hasil lab sudah dimuat
            const timer = setTimeout(() => {
                handleSubmitPrediksi();
            }, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, formData.kunjunganId, hasilLabList.length]);

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

        setFormAnamnesis({
            kunjunganId: kunjungan.id,
            riwayatHipertensi: "",
            riwayatDiabetes: "",
            riwayatMerokok: "",
            riwayatJantungKeluarga: "",
        });

        setSelectedPemeriksaanLab([]);
        
        // Load hasil lab berdasarkan kunjunganId
        loadHasilLab(kunjungan.id);
        
        // Load riwayat pemeriksaan awal
        loadRiwayatPemeriksaanAwal(kunjungan.id);
        
        // Load riwayat anamnesis
        loadRiwayatAnamnesis(kunjungan.id);
        
        // Load riwayat order lab
        loadRiwayatOrderLab(kunjungan.id);
        
        // Reset prediksi data
        setDataPemeriksaanAwal(null);
        setDataAnamnesis(null);
        setPrediksiResult(null);
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

    // Load riwayat pemeriksaan awal berdasarkan kunjunganId
    const loadRiwayatPemeriksaanAwal = useCallback(async (kunjunganId) => {
        if (!kunjunganId) {
            setRiwayatPemeriksaanAwal([]);
            return;
        }

        try {
            const filters = { kunjunganId };
            const response = await getPemeriksaanAwal(filters);
            setRiwayatPemeriksaanAwal(response.data || []);
        } catch (err) {
            // Silent fail untuk riwayat, tidak perlu toast error
            setRiwayatPemeriksaanAwal([]);
        }
    }, []);

    // Load riwayat anamnesis berdasarkan kunjunganId
    const loadRiwayatAnamnesis = useCallback(async (kunjunganId) => {
        if (!kunjunganId) {
            setRiwayatAnamnesis([]);
            return;
        }

        try {
            const filters = { kunjunganId };
            const response = await getAnamnesis(filters);
            setRiwayatAnamnesis(response.data || []);
        } catch (err) {
            // Silent fail untuk riwayat, tidak perlu toast error
            setRiwayatAnamnesis([]);
        }
    }, []);

    // Load riwayat order lab berdasarkan kunjunganId
    const loadRiwayatOrderLab = useCallback(async (kunjunganId) => {
        if (!kunjunganId) {
            setRiwayatOrderLab([]);
            return;
        }

        try {
            const filters = { kunjunganId };
            const response = await getOrderLab(filters);
            setRiwayatOrderLab(response.data || []);
        } catch (err) {
            // Silent fail untuk riwayat, tidak perlu toast error
            setRiwayatOrderLab([]);
        }
    }, []);

    // Update form pemeriksaan awal helper
    const updateFormPemeriksaanAwal = (field, value) => {
        setFormPemeriksaanAwal((prev) => ({ ...prev, [field]: value }));
    };

    // Update form anamnesis helper
    const updateFormAnamnesis = (field, value) => {
        setFormAnamnesis((prev) => ({ ...prev, [field]: value }));
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
            // Reload riwayat pemeriksaan awal setelah berhasil simpan
            loadRiwayatPemeriksaanAwal(formPemeriksaanAwal.kunjunganId);
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
            // Reload riwayat order lab setelah berhasil simpan
            loadRiwayatOrderLab(formData.kunjunganId);
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setLoading(false);
        }
    };

    // Get lab value by name
    const getLabValue = (labName) => {
        if (!hasilLabList || hasilLabList.length === 0) return null;
        
        // Get the most recent hasil lab
        const latestHasilLab = hasilLabList[hasilLabList.length - 1];
        if (!latestHasilLab?.hasilLabDetail) return null;

        // Find the lab detail by name (case insensitive)
        const detail = latestHasilLab.hasilLabDetail.find(
            (item) => item.pemeriksaanLab?.nama?.toLowerCase().includes(labName.toLowerCase())
        );

        return detail ? parseFloat(detail.nilai) : null;
    };

    // Submit prediksi penyakit jantung (bisa dipanggil manual atau otomatis)
    const handleSubmitPrediksi = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!formData.kunjunganId) {
            if (e) {
                toast.error("Harap pilih pasien terlebih dahulu!");
            }
            return;
        }

        try {
            setLoading(true);
            const filters = { kunjunganId: formData.kunjunganId };

            // Load data dari API secara langsung
            const [responsePemeriksaanAwal, responseAnamnesis] = await Promise.all([
                getPemeriksaanAwal(filters),
                getAnamnesis(filters)
            ]);

            const pemeriksaanAwalData = responsePemeriksaanAwal.data?.[0] || null;
            const anamnesisData = responseAnamnesis.data?.[0] || null;

            // Update state
            setDataPemeriksaanAwal(pemeriksaanAwalData);
            setDataAnamnesis(anamnesisData);

            // Get tanggal lahir dari kunjungan
            const kunjungan = kunjunganHariIni.find(k => k.id === formData.kunjunganId);
            const tanggalLahir = kunjungan?.pasien?.tanggal_lahir || kunjungan?.pasien?.tanggalLahir;
            const usia = calculateAge(tanggalLahir);
            const jenisKelamin = convertJenisKelamin(formData.jenisKelamin);

            // Validate required data
            if (!usia) {
                if (e) {
                    toast.error("Data tanggal lahir pasien tidak ditemukan!");
                }
                setLoading(false);
                return;
            }

            if (jenisKelamin === null) {
                if (e) {
                    toast.error("Data jenis kelamin pasien tidak valid!");
                }
                setLoading(false);
                return;
            }

            if (!pemeriksaanAwalData) {
                if (e) {
                    toast.error("Data pemeriksaan awal belum tersedia!");
                }
                setLoading(false);
                return;
            }

            if (!anamnesisData) {
                if (e) {
                    toast.error("Data anamnesis belum tersedia!");
                }
                setLoading(false);
                return;
            }

            // Calculate BMI
            const bmi = calculateBMI(
                pemeriksaanAwalData.tinggiBadan,
                pemeriksaanAwalData.beratBadan
            );

            if (!bmi) {
                if (e) {
                    toast.error("Data tinggi badan atau berat badan tidak lengkap!");
                }
                setLoading(false);
                return;
            }

            // Get lab values
            const kadarLDL = getLabValue("LDL");
            const kadarHDL = getLabValue("HDL");
            const kolesterolTotal = getLabValue("kolesterol") || getLabValue("total");
            const gulaDarahPuasa = getLabValue("gula") || getLabValue("glukosa");

            // Prepare payload
            const payload = {
                Usia: usia,
                Jenis_Kelamin: jenisKelamin,
                Riwayat_Hipertensi: anamnesisData.riwayatHipertensi || 0,
                Riwayat_Diabetes: anamnesisData.riwayatDiabetes || 0,
                Riwayat_Merokok: anamnesisData.riwayatMerokok || 0,
                Riwayat_Jantung_Keluarga: anamnesisData.riwayatJantungKeluarga || 0,
                BMI: bmi,
                Tekanan_Darah_Sistolik: parseFloat(pemeriksaanAwalData.tekananDarahSistolik) || 0,
                Tekanan_Darah_Diastolik: parseFloat(pemeriksaanAwalData.tekananDarahDiastolik) || 0,
                Kadar_LDL: kadarLDL || 0,
                Kadar_HDL: kadarHDL || 0,
                Kolesterol_Total: kolesterolTotal || 0,
                Gula_Darah_Puasa: gulaDarahPuasa || 0,
                Denyut_Nadi: parseFloat(pemeriksaanAwalData.denyutNadi) || 0,
            };

            // Submit prediksi
            const response = await insertPrediksiPenyakitJantung(payload.Usia, payload.Jenis_Kelamin, payload.Riwayat_Hipertensi, payload.Riwayat_Diabetes, payload.Riwayat_Merokok, payload.Riwayat_Jantung_Keluarga, payload.BMI, payload.Tekanan_Darah_Sistolik, payload.Tekanan_Darah_Diastolik, payload.Kadar_LDL, payload.Kadar_HDL, payload.Kolesterol_Total, payload.Gula_Darah_Puasa, payload.Denyut_Nadi);

            console.log(response);

            // Response structure: { status: true, message: "data found", data: { prediction: 0, probability: 0, label: "Tidak Berisiko" } }
            setPrediksiResult(response.data?.data || response.data);
        } catch (err) {
            if (e) {
                toast.error(err.message || "Terjadi kesalahan saat melakukan prediksi");
            }
            setPrediksiResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Submit form anamnesis
    const handleSubmitAnamnesis = async (e) => {
        e.preventDefault();

        if (!formAnamnesis.kunjunganId) {
            toast.error("Harap pilih pasien terlebih dahulu!");
            return;
        }

        if (!formAnamnesis.riwayatHipertensi) {
            toast.error("Harap pilih riwayat hipertensi!");
            return;
        }

        if (!formAnamnesis.riwayatDiabetes) {
            toast.error("Harap pilih riwayat diabetes!");
            return;
        }

        if (!formAnamnesis.riwayatMerokok) {
            toast.error("Harap pilih riwayat merokok!");
            return;
        }

        if (!formAnamnesis.riwayatJantungKeluarga) {
            toast.error("Harap pilih riwayat jantung keluarga!");
            return;
        }

        try {
            setLoading(true);
            // Konversi "Ya" menjadi 1 dan "Tidak" menjadi 0
            const riwayatHipertensi = formAnamnesis.riwayatHipertensi === "Ya" ? 1 : 0;
            const riwayatDiabetes = formAnamnesis.riwayatDiabetes === "Ya" ? 1 : 0;
            const riwayatMerokok = formAnamnesis.riwayatMerokok === "Ya" ? 1 : 0;
            const riwayatJantungKeluarga = formAnamnesis.riwayatJantungKeluarga === "Ya" ? 1 : 0;

            await insertAnamnesis(
                formAnamnesis.kunjunganId,
                riwayatHipertensi,
                riwayatDiabetes,
                riwayatMerokok,
                riwayatJantungKeluarga
            );
            toast.success("Anamnesis berhasil disimpan!");
            setFormAnamnesis({
                kunjunganId: formAnamnesis.kunjunganId,
                riwayatHipertensi: "",
                riwayatDiabetes: "",
                riwayatMerokok: "",
                riwayatJantungKeluarga: "",
            });
            // Reload riwayat anamnesis setelah berhasil simpan
            loadRiwayatAnamnesis(formAnamnesis.kunjunganId);
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

            {!formPemeriksaanAwal.kunjunganId && (
                <div className="alert alert-info">
                    Silakan pilih pasien dari tab Data Pasien terlebih dahulu.
                </div>
            )}

            {/* Form hanya ditampilkan jika belum ada riwayat */}
            {riwayatPemeriksaanAwal.length === 0 && formPemeriksaanAwal.kunjunganId && (
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
            )}

            {/* Riwayat Pemeriksaan Awal */}
            {formPemeriksaanAwal.kunjunganId && (
                <div className="mt-4">
                    <h5 className="mb-3">📋 Riwayat Pemeriksaan Awal</h5>
                    {loading && riwayatPemeriksaanAwal.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            Memuat riwayat pemeriksaan...
                        </div>
                    ) : riwayatPemeriksaanAwal.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Tekanan Darah</th>
                                        <th>Denyut Nadi</th>
                                        <th>Suhu Tubuh</th>
                                        <th>Tinggi Badan</th>
                                        <th>Berat Badan</th>
                                        <th>BMI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riwayatPemeriksaanAwal.map((riwayat) => {
                                        const bmi = calculateBMI(
                                            riwayat.tinggiBadan,
                                            riwayat.beratBadan
                                        );
                                        return (
                                            <tr key={riwayat.id}>
                                                <td>
                                                    {formatTanggal(riwayat.tanggal || riwayat.createdAt)}
                                                </td>
                                                <td>
                                                    {riwayat.tekananDarahSistolik || "-"} /{" "}
                                                    {riwayat.tekananDarahDiastolik || "-"}
                                                </td>
                                                <td>
                                                    {riwayat.denyutNadi ? `${riwayat.denyutNadi} bpm` : "-"}
                                                </td>
                                                <td>
                                                    {riwayat.suhuTubuh ? `${riwayat.suhuTubuh} °C` : "-"}
                                                </td>
                                                <td>
                                                    {riwayat.tinggiBadan ? `${riwayat.tinggiBadan} cm` : "-"}
                                                </td>
                                                <td>
                                                    {riwayat.beratBadan ? `${riwayat.beratBadan} kg` : "-"}
                                                </td>
                                                <td>
                                                    {bmi ? bmi.toFixed(1) : "-"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            Belum ada riwayat pemeriksaan awal untuk kunjungan ini.
                        </div>
                    )}
                </div>
            )}
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

    // Render form anamnesis
    const renderAnamnesis = () => (
        <div>
            <h4 className="mb-3">📋 Anamnesis</h4>
            <p className="text-muted">
                Pilih pasien dari tab Data Pasien, lalu isi data anamnesis.
            </p>

            {!formAnamnesis.kunjunganId && (
                <div className="alert alert-info">
                    Silakan pilih pasien dari tab Data Pasien terlebih dahulu.
                </div>
            )}

            {/* Form hanya ditampilkan jika belum ada riwayat */}
            {riwayatAnamnesis.length === 0 && formAnamnesis.kunjunganId && (
                <form
                    onSubmit={handleSubmitAnamnesis}
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
                                Riwayat Hipertensi
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formAnamnesis.riwayatHipertensi}
                                    onChange={(e) =>
                                        updateFormAnamnesis(
                                            "riwayatHipertensi",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading || !formAnamnesis.kunjunganId}
                                    required
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="Ya">Ya</option>
                                    <option value="Tidak">Tidak</option>
                                </select>
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Riwayat Diabetes
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formAnamnesis.riwayatDiabetes}
                                    onChange={(e) =>
                                        updateFormAnamnesis(
                                            "riwayatDiabetes",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading || !formAnamnesis.kunjunganId}
                                    required
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="Ya">Ya</option>
                                    <option value="Tidak">Tidak</option>
                                </select>
                            </td>
                        </tr>

                        <tr>
                            <td className="fw-bold" style={styles.tableCell}>
                                Riwayat Merokok
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formAnamnesis.riwayatMerokok}
                                    onChange={(e) =>
                                        updateFormAnamnesis(
                                            "riwayatMerokok",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading || !formAnamnesis.kunjunganId}
                                    required
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="Ya">Ya</option>
                                    <option value="Tidak">Tidak</option>
                                </select>
                            </td>

                            <td className="fw-bold" style={styles.tableCell}>
                                Riwayat Jantung Keluarga
                            </td>
                            <td style={styles.tableCellInput}>
                                <select
                                    className="form-select border-0"
                                    value={formAnamnesis.riwayatJantungKeluarga}
                                    onChange={(e) =>
                                        updateFormAnamnesis(
                                            "riwayatJantungKeluarga",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading || !formAnamnesis.kunjunganId}
                                    required
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="Ya">Ya</option>
                                    <option value="Tidak">Tidak</option>
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
                        disabled={loading || !formAnamnesis.kunjunganId}
                        onMouseEnter={(e) => {
                            if (!loading && formAnamnesis.kunjunganId) {
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
            )}

            {/* Riwayat Anamnesis */}
            {formAnamnesis.kunjunganId && (
                <div className="mt-4">
                    <h5 className="mb-3">📋 Riwayat Anamnesis</h5>
                    {loading && riwayatAnamnesis.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            Memuat riwayat anamnesis...
                        </div>
                    ) : riwayatAnamnesis.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Riwayat Hipertensi</th>
                                        <th>Riwayat Diabetes</th>
                                        <th>Riwayat Merokok</th>
                                        <th>Riwayat Jantung Keluarga</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riwayatAnamnesis.map((riwayat) => (
                                        <tr key={riwayat.id}>
                                            <td>
                                                {formatTanggal(riwayat.tanggal || riwayat.createdAt)}
                                            </td>
                                            <td>
                                                {riwayat.riwayatHipertensi === 1 || riwayat.riwayatHipertensi === "1" 
                                                    ? "Ya" 
                                                    : riwayat.riwayatHipertensi === 0 || riwayat.riwayatHipertensi === "0"
                                                    ? "Tidak"
                                                    : "-"}
                                            </td>
                                            <td>
                                                {riwayat.riwayatDiabetes === 1 || riwayat.riwayatDiabetes === "1" 
                                                    ? "Ya" 
                                                    : riwayat.riwayatDiabetes === 0 || riwayat.riwayatDiabetes === "0"
                                                    ? "Tidak"
                                                    : "-"}
                                            </td>
                                            <td>
                                                {riwayat.riwayatMerokok === 1 || riwayat.riwayatMerokok === "1" 
                                                    ? "Ya" 
                                                    : riwayat.riwayatMerokok === 0 || riwayat.riwayatMerokok === "0"
                                                    ? "Tidak"
                                                    : "-"}
                                            </td>
                                            <td>
                                                {riwayat.riwayatJantungKeluarga === 1 || riwayat.riwayatJantungKeluarga === "1" 
                                                    ? "Ya" 
                                                    : riwayat.riwayatJantungKeluarga === 0 || riwayat.riwayatJantungKeluarga === "0"
                                                    ? "Tidak"
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            Belum ada riwayat anamnesis untuk kunjungan ini.
                        </div>
                    )}
                </div>
            )}
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

            {!formData.kunjunganId && (
                <div className="alert alert-info">
                    Silakan pilih pasien dari tab Data Pasien terlebih dahulu.
                </div>
            )}

            {/* Form hanya ditampilkan jika belum ada riwayat */}
            {riwayatOrderLab.length === 0 && formData.kunjunganId && (
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
            )}

            {/* Riwayat Order Lab */}
            {formData.kunjunganId && (
                <div className="mt-4">
                    <h5 className="mb-3">📋 Riwayat Order Lab</h5>
                    {loading && riwayatOrderLab.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            Memuat riwayat order lab...
                        </div>
                    ) : riwayatOrderLab.length > 0 ? (
                        riwayatOrderLab.map((orderLab) => (
                            <div
                                key={orderLab.id}
                                className="rounded mb-3"
                                style={styles.formContainer}
                            >
                                <div className="p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">
                                            Order Lab #{orderLab.id}
                                        </h6>
                                        <small className="text-muted">
                                            Tanggal: {formatTanggal(orderLab.tanggal || orderLab.createdAt)}
                                        </small>
                                    </div>
                                    {orderLab.orderLabDetail && orderLab.orderLabDetail.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Nama Pemeriksaan</th>
                                                        <th>Nilai Rujukan</th>
                                                        <th>Satuan</th>
                                                        <th>Tarif</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderLab.orderLabDetail.map((detail) => (
                                                        <tr key={detail.id}>
                                                            <td>
                                                                {detail.pemeriksaanLab?.nama || "-"}
                                                            </td>
                                                            <td>
                                                                {detail.pemeriksaanLab?.nilaiRujukanBawah || "-"} -{" "}
                                                                {detail.pemeriksaanLab?.nilaiRujukanAtas || "-"}
                                                            </td>
                                                            <td>
                                                                {detail.pemeriksaanLab?.satuan || "-"}
                                                            </td>
                                                            <td>
                                                                {detail.pemeriksaanLab?.tarif
                                                                    ? `Rp ${parseInt(detail.pemeriksaanLab.tarif).toLocaleString("id-ID")}`
                                                                    : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-2">
                                            Tidak ada detail order lab.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="alert alert-info">
                            Belum ada riwayat order lab untuk kunjungan ini.
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Render prediksi penyakit
    const renderPrediksiPenyakit = () => {
        // Helper function untuk render toggle
        const renderToggle = (label, isOn, onToggle) => (
            <div
                onClick={onToggle}
                style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: "4px",
                }}
            >
                <div style={styles.toggleSwitch}>
                    <div
                        style={{
                            ...styles.toggleSlider,
                            ...(isOn ? styles.toggleSliderOn : {}),
                        }}
                    />
                    <div
                        style={{
                            ...styles.toggleCircle,
                            ...(isOn ? styles.toggleCircleOn : {}),
                        }}
                    />
                </div>
                <span className="fw-bold small">
                    {isOn ? "ON" : "OFF"} - {label}
                </span>
            </div>
        );

        // Get data pasien dari kunjungan
        const kunjungan = kunjunganHariIni.find(k => k.id === formData.kunjunganId);
        const pasien = kunjungan?.pasien || null;

        // Get data pemeriksaan awal terbaru (prioritaskan data yang digunakan untuk prediksi)
        const pemeriksaanAwalData = dataPemeriksaanAwalPrediksi || 
            (riwayatPemeriksaanAwal.length > 0 ? riwayatPemeriksaanAwal[0] : null);

        // Get data anamnesis terbaru (prioritaskan data yang digunakan untuk prediksi)
        const anamnesisData = dataAnamnesisPrediksi || 
            (riwayatAnamnesis.length > 0 ? riwayatAnamnesis[0] : null);

        return (
            <div>
                <h4 className="mb-3">🔮 Prediksi Penyakit Jantung</h4>
                <p className="text-muted">
                    Pilih pasien dari tab Data Pasien, pastikan data pemeriksaan awal,
                    anamnesis, dan hasil lab sudah tersedia. Prediksi akan dilakukan secara otomatis.
                </p>
        
                {formData.kunjunganId ? (
                    <div>
                        {/* Loading */}
                        {loading && !prediksiResult && (
                            <div className="text-center text-muted py-3">
                                <div
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Memproses prediksi...
                            </div>
                        )}

                        {/* ================================
                            TOGGLE INFORMASI PENDUKUNG (DI ATAS)
                           ================================ */}
                        <div className="rounded p-2 mb-3" style={styles.formContainer}>
                            <h6 className="mb-2">📋 Informasi Pendukung</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {renderToggle("Data Pasien", showDataPasien, () => setShowDataPasien(!showDataPasien))}
                                {renderToggle("Pemeriksaan Awal", showPemeriksaanAwal, () => setShowPemeriksaanAwal(!showPemeriksaanAwal))}
                                {renderToggle("Anamnesis", showAnamnesis, () => setShowAnamnesis(!showAnamnesis))}
                                {renderToggle("Hasil Lab", showHasilLab, () => setShowHasilLab(!showHasilLab))}
                            </div>
                        </div>

                        {/* ================================
                            INFORMASI PENDUKUNG - RINGKAS
                           ================================ */}
                        {(showDataPasien || showPemeriksaanAwal || showAnamnesis || showHasilLab) && (
                            <div className="row g-2 mb-3">
                                {/* DATA PASIEN - NARASI */}
                                {showDataPasien && pasien && (
                                    <div className="col-md-6 d-flex">
                                        <div className="rounded p-2 border w-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
                                            <h6 className="mb-1 small">👤 Data Pasien</h6>
                                            <p className="mb-0 small" style={{ lineHeight: "1.4" }}>
                                                <strong>NIK:</strong> {pasien.nik || formData.NIK || "-"} | 
                                                <strong> Nama:</strong> {pasien.nama || formData.nama || "-"} | 
                                                <strong> JK:</strong> {pasien.jenisKelamin || formData.jenisKelamin || "-"} | 
                                                <strong> Tgl Lahir:</strong> {pasien.tanggal_lahir || pasien.tanggalLahir || formData.tanggalLahir
                                                    ? formatTanggal(pasien.tanggal_lahir || pasien.tanggalLahir || formData.tanggalLahir)
                                                    : "-"} | 
                                                <strong> Poliklinik:</strong> {kunjungan?.poliklinik?.nama || formData.poliklinik || "-"} | 
                                                <strong> Dokter:</strong> {kunjungan?.dokter?.nama || formData.dokter || "-"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* PEMERIKSAAN AWAL - NARASI */}
                                {showPemeriksaanAwal && pemeriksaanAwalData && (
                                    <div className="col-md-6 d-flex">
                                        <div className="rounded p-2 border w-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
                                            <h6 className="mb-1 small">🩺 Pemeriksaan Awal</h6>
                                            <p className="mb-0 small" style={{ lineHeight: "1.4" }}>
                                                <strong>Tekanan Darah:</strong> {pemeriksaanAwalData.tekananDarahSistolik || "-"} /{" "}
                                                {pemeriksaanAwalData.tekananDarahDiastolik || "-"} mmHg | 
                                                <strong> Denyut Nadi:</strong> {pemeriksaanAwalData.denyutNadi ? `${pemeriksaanAwalData.denyutNadi} bpm` : "-"} | 
                                                <strong> Suhu:</strong> {pemeriksaanAwalData.suhuTubuh ? `${pemeriksaanAwalData.suhuTubuh} °C` : "-"} | 
                                                <strong> Tinggi:</strong> {pemeriksaanAwalData.tinggiBadan ? `${pemeriksaanAwalData.tinggiBadan} cm` : "-"} | 
                                                <strong> Berat:</strong> {pemeriksaanAwalData.beratBadan ? `${pemeriksaanAwalData.beratBadan} kg` : "-"} | 
                                                <strong> BMI:</strong> {calculateBMI(pemeriksaanAwalData.tinggiBadan, pemeriksaanAwalData.beratBadan)
                                                    ? calculateBMI(pemeriksaanAwalData.tinggiBadan, pemeriksaanAwalData.beratBadan).toFixed(1)
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ANAMNESIS - NARASI */}
                                {showAnamnesis && anamnesisData && (
                                    <div className="col-md-6 d-flex">
                                        <div className="rounded p-2 border w-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
                                            <h6 className="mb-1 small">📝 Anamnesis</h6>
                                            <p className="mb-0 small" style={{ lineHeight: "1.4" }}>
                                                <strong>Hipertensi:</strong> {anamnesisData.riwayatHipertensi === 1 ? "Ya" : anamnesisData.riwayatHipertensi === 0 ? "Tidak" : "-"} | 
                                                <strong> Diabetes:</strong> {anamnesisData.riwayatDiabetes === 1 ? "Ya" : anamnesisData.riwayatDiabetes === 0 ? "Tidak" : "-"} | 
                                                <strong> Merokok:</strong> {anamnesisData.riwayatMerokok === 1 ? "Ya" : anamnesisData.riwayatMerokok === 0 ? "Tidak" : "-"} | 
                                                <strong> Jantung Keluarga:</strong> {anamnesisData.riwayatJantungKeluarga === 1 ? "Ya" : anamnesisData.riwayatJantungKeluarga === 0 ? "Tidak" : "-"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* HASIL LAB - NARASI */}
                                {showHasilLab && hasilLabList.length > 0 && (
                                    <div className="col-md-6 d-flex">
                                        <div className="rounded p-2 border w-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
                                            <h6 className="mb-1 small">🔬 Hasil Lab</h6>
                                            <div className="small" style={{ lineHeight: "1.5", maxHeight: "120px", overflowY: "auto" }}>
                                                {hasilLabList.map((hasilLab, idx) => (
                                                    <div key={hasilLab.id} className={idx > 0 ? "mt-1" : ""}>
                                                        {hasilLab.hasilLabDetail && hasilLab.hasilLabDetail.length > 0 ? (
                                                            hasilLab.hasilLabDetail.map((detail, detailIdx) => {
                                                                const nilai = parseFloat(detail.nilai);
                                                                const nilaiBawah = parseFloat(
                                                                    detail.pemeriksaanLab?.nilaiRujukanBawah || 0
                                                                );
                                                                const nilaiAtas = parseFloat(
                                                                    detail.pemeriksaanLab?.nilaiRujukanAtas || 0
                                                                );
                                                                const isNormal = nilai >= nilaiBawah && nilai <= nilaiAtas;

                                                                return (
                                                                    <span key={detail.id}>
                                                                        <strong>{detail.pemeriksaanLab?.nama || "-"}:</strong> {detail.nilai || "-"}{detail.pemeriksaanLab?.satuan ? ` ${detail.pemeriksaanLab.satuan}` : ""} 
                                                                        <span className={`badge ms-1 ${isNormal ? "bg-success" : "bg-danger"}`} style={{ fontSize: "0.65rem" }}>
                                                                            {isNormal ? "N" : "TN"}
                                                                        </span>
                                                                        {detailIdx < hasilLab.hasilLabDetail.length - 1 ? " | " : ""}
                                                                    </span>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-muted">Tidak ada detail hasil lab.</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pesan jika tidak ada data */}
                                {showPemeriksaanAwal && !pemeriksaanAwalData && (
                                    <div className="col-12">
                                        <div className="alert alert-info py-2 mb-0 small">
                                            Data pemeriksaan awal belum tersedia.
                                        </div>
                                    </div>
                                )}
                                {showAnamnesis && !anamnesisData && (
                                    <div className="col-12">
                                        <div className="alert alert-info py-2 mb-0 small">
                                            Data anamnesis belum tersedia.
                                        </div>
                                    </div>
                                )}
                                {showHasilLab && hasilLabList.length === 0 && (
                                    <div className="col-12">
                                        <div className="alert alert-info py-2 mb-0 small">
                                            Data hasil lab belum tersedia.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
        
                        {/* ================================
                            HASIL PREDIKSI (DI BAWAH)
                           ================================ */}
                        {prediksiResult && (
                            <div className="rounded p-3 mt-3" style={styles.formContainer}>
                                <h6 className="mb-2 small">Hasil Prediksi</h6>
        
                                {/* ===========================
                                    TABEL STATUS & PROBABILITAS
                                   =========================== */}
                                <table className="table table-sm table-bordered bg-white mb-0 small">
                                    <tbody>
                                        <tr>
                                            <th className="w-25" style={{ padding: "2px" }}>Status Prediksi</th>
                                            <td style={{ padding: "2px" }}>
                                                <span
                                                    className={`fw-bold ${
                                                        Number(prediksiResult.prediction) === 1
                                                            ? "text-danger"
                                                            : "text-success"
                                                    }`}
                                                >
                                                    {prediksiResult.label || "N/A"}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "2px" }}>Probabilitas</th>
                                            <td style={{ padding: "2px" }}>
                                                {prediksiResult.probability || "0%"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Interpretasi Klinis */}
                                {prediksiResult.interpretasi_klinis && (
                                    <div className="mt-3 p-3 border rounded bg-light">
                                        <h6 className="fw-bold mb-2 small">Interpretasi Klinis</h6>
                                        <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: 0 }}>
                                            {prediksiResult.interpretasi_klinis}
                                        </p>
                                    </div>
                                )}
        
                                {/* ================================
                                    SWITCH TOGGLE DETAIL MANUAL
                                   ================================ */}
                                {prediksiResult.probabilityCalculation && (
                                    <div
                                        onClick={() => setShowManualCalc(!showManualCalc)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            marginTop: "12px",
                                        }}
                                    >
                                        <div style={styles.toggleSwitch}>
                                            <div
                                                style={{
                                                    ...styles.toggleSlider,
                                                    ...(showManualCalc ? styles.toggleSliderOn : {}),
                                                }}
                                            />
                                            <div
                                                style={{
                                                    ...styles.toggleCircle,
                                                    ...(showManualCalc ? styles.toggleCircleOn : {}),
                                                }}
                                            />
                                        </div>
                                        <span className="fw-bold small">
                                            {showManualCalc
                                                ? "ON - Detail Probabilitas"
                                                : "OFF - Detail Probabilitas"}
                                        </span>
                                    </div>
                                )}
        
                                {/* ================================
                                    TABEL DETAIL PERHITUNGAN MANUAL
                                   ================================ */}
                                {showManualCalc && prediksiResult.probabilityCalculation && (
                                    <div className="mt-4 p-3 border rounded bg-light">
                                        <h6 className="fw-bold mb-2 small">Detail Perhitungan (KNN)</h6>
        
                                        <table className="table table-sm table-bordered mb-0 small">
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: "2px" }}><strong>k</strong></td>
                                                    <td style={{ padding: "2px" }}>{prediksiResult.probabilityCalculation.k}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: "2px" }}><strong>Neighbor Labels</strong></td>
                                                    <td style={{ padding: "2px" }}>
                                                        {prediksiResult.probabilityCalculation.neighborLabels.join(", ")}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: "2px" }}><strong>Class 0</strong></td>
                                                    <td style={{ padding: "2px" }}>{prediksiResult.probabilityCalculation.countClass0}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: "2px" }}><strong>Class 1</strong></td>
                                                    <td style={{ padding: "2px" }}>{prediksiResult.probabilityCalculation.countClass1}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: "2px" }}><strong>Probabilitas</strong></td>
                                                    <td style={{ padding: "2px" }}>
                                                        {(prediksiResult.probabilityCalculation.manualProbability * 100).toFixed(2)}%
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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
    };
    
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
            case "anamnesis":
                return renderAnamnesis();
            case "orderLab":
                return renderOrderLab();
            case "hasilLab":
                return renderHasilLab();
            case "prediksiPenyakit":
                return renderPrediksiPenyakit();
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
                            activeTab === "anamnesis" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("anamnesis")}
                        type="button"
                    >
                        Anamnesis
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
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${
                            activeTab === "prediksiPenyakit" ? "active" : ""
                        }`}
                        onClick={() => {
                            setActiveTab("prediksiPenyakit");
                        }}
                        type="button"
                    >
                        Prediksi Penyakit
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


import React, { useEffect, useState } from "react";
import { getPeringkatFitur } from "../../api/peringkat-fitur";

const PeringkatFitur = () => {
    const [mi, setMi] = useState([]);
    const [relieff, setRelieff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPeringkatFitur();

                if (response?.data) {
                    setMi(response.data.peringkat_mutual_information);
                    setRelieff(response.data.peringkat_relieff);
                }
            } catch (error) {
                console.error("Gagal memuat peringkat fitur:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /* === LOADING === */
    if (loading) {
        return (
            <p className="text-muted" style={{ fontStyle: "italic" }}>
                Memuat data...
            </p>
        );
    }

    return (
        <div className="container" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

            <h3 className="mb-3">📊 Peringkat Fitur</h3>

            {/* ================== TABEL MI ================== */}
            <h5 className="mt-4">🔹 Peringkat Mutual Information</h5>
            <div
                className="table-responsive mb-4"
                style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                }}
            >
                <table className="table table-striped table-bordered align-middle text-center mb-0">
                    <thead
                        className="table-light"
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            backgroundColor: "#f8f9fa",
                            boxShadow: "0 2px 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <tr>
                            <th>No</th>
                            <th>Nama Fitur</th>
                            <th>Nilai MI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mi.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="text-start">{item.fitur.replaceAll("_", " ")}</td>
                                <td>{item.nilai_mi.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ================== TABEL RELIEFF ================== */}
            <h5 className="mt-4">🔹 Peringkat ReliefF</h5>
            <div
                className="table-responsive mb-4"
                style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                }}
            >
                <table className="table table-striped table-bordered align-middle text-center mb-0">
                    <thead
                        className="table-light"
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            backgroundColor: "#f8f9fa",
                            boxShadow: "0 2px 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <tr>
                            <th>No</th>
                            <th>Nama Fitur</th>
                            <th>Nilai ReliefF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {relieff.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="text-start">{item.fitur.replaceAll("_", " ")}</td>
                                <td>{item.nilai_relieff.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default PeringkatFitur;

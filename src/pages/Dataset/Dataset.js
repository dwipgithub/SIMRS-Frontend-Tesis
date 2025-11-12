import React, { useEffect, useState } from "react";
import { getDataset } from "../../api/dataset";
import { toast } from "react-toastify";

const Dataset = () => {
    const [datasetList, setDatasetList] = useState([]);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        try {
            const response = await getDataset();
            console.log(response.data)
            if (response.data && Array.isArray(response.data)) {
                setDatasetList(response.data);
            } else {
                setDatasetList([]);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div
            className="container"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-3" style={{ gap: "8px" }}>
                
                <h3 className="mb-0">📋 Dataset Pemodelan</h3>
            </div>

            {/* Kondisi Loading */}
            {loading && (
                <p className="text-muted" style={{ fontStyle: "italic" }}>
                    Memuat data...
                </p>
            )}

            {/* Hanya tampilkan tabel jika ada data */}
            {!loading && datasetList.length > 0 && (
                <div
                    className="table-responsive"
                    style={{
                        maxHeight: "70vh",
                        overflowY: "auto",
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
                                {Object.keys(datasetList[0]).map((key, index) => (
                                    <th key={index}>{key.replaceAll("_", " ")}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datasetList.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    {Object.values(item).map((val, i) => (
                                        <td key={i}>
                                            {typeof val === "number" ? val.toFixed(2) : String(val)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pesan jika tidak ada data */}
            {!loading && datasetList.length === 0 && (
                <p className="text-muted" style={{ fontStyle: "italic" }}>
                    Data belum tersedia.
                </p>
            )}
        </div>
    );
};

export default Dataset;

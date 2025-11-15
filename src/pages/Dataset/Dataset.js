import React, { useEffect, useState } from "react";
import { getDataset, getDatasetStatistic } from "../../api/dataset";
import { toast } from "react-toastify";

const Dataset = () => {
    const [datasetList, setDatasetList] = useState([]);
    const [datasetStatistic, setDatasetStatistic] = useState([]);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        try {
            const response = await getDataset();
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

    const getDatasetStatisticData = async () => {
        try {
            const response = await getDatasetStatistic();
            setDatasetStatistic(response.data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
        getDatasetStatisticData();
    }, []);

    const selectedFeatures = [
        "Usia",
        "Tekanan_Darah_Sistolik",
        "Tekanan_Darah_Diastolik",
        "Kadar_LDL",
        "Kadar_HDL",
        "Kolesterol_Total",
        "Gula_Darah_Puasa",
        "BMI",
        "Denyut_Nadi"
    ];

    return (
        <div
            className="container"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-3" style={{ gap: "8px" }}>

                <h3 className="mb-0">📋 Dataset Statistik</h3>
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
                    <div>
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
                                    <th>Fitur</th>
                                    <th>Mean</th>
                                    <th>Std</th>
                                    <th>Min</th>
                                    <th>Max</th>
                                </tr>
                            </thead>

                            <tbody>
                                {selectedFeatures.map((feature) => {
                                    const item = datasetStatistic[feature];
                                    const formatNumber = (value) =>
                                        typeof value === "number" ? value.toFixed(2) : value;
                                    return (
                                        <tr key={feature}>
                                            <td className="text-start">{feature.replaceAll("_", " ")}</td>
                                            <td>{formatNumber(item?.mean)}</td>
                                            <td>{formatNumber(item?.std)}</td>
                                            <td>{formatNumber(item?.min)}</td>
                                            <td>{formatNumber(item?.max)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* <div className="mt-5">
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
                    </div> */}

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

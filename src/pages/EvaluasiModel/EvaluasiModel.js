import React, { useEffect, useState } from "react";
import { getEvaluasiModel } from "../../api/evaluasi-model";
import { toast } from "react-toastify";
import { BarChart3 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

const EvaluasiModel = () => {
    const [datasetList, setDatasetList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxValues, setMaxValues] = useState({});

    const getData = async () => {
        try {
            const response = await getEvaluasiModel();
            if (response.data && Array.isArray(response.data)) {
                const data = response.data;
                setDatasetList(data);

                // Cari nilai tertinggi untuk setiap metrik
                const metrics = ["Accuracy", "Precision", "Recall", "F1-Score"];
                const maxVals = {};
                metrics.forEach((metric) => {
                    maxVals[metric] = Math.max(
                        ...data.map((item) => Number(item[metric]) || 0)
                    );
                });
                setMaxValues(maxVals);
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

    // 🔹 Transformasi data untuk Radar Chart
    const radarData =
        datasetList.length > 0
            ? ["Accuracy", "Precision", "Recall", "F1-Score"].map((metric) => {
                const obj = { metric };
                datasetList.forEach((item) => {
                    obj[item.Model] = item[metric];
                });
                return obj;
            })
            : [];

    return (
        <div
            className="container"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-3" style={{ gap: "8px" }}>
                <BarChart3 className="text-primary" size={22} />
                <h3 className="mb-0">Evaluasi Model</h3>
            </div>

            {/* Loading */}
            {loading && (
                <p className="text-muted" style={{ fontStyle: "italic" }}>
                    Memuat data evaluasi model...
                </p>
            )}

            {/* === TABEL === */}
            {!loading && datasetList.length > 0 && (
                <>
                    <h5 className="text-center mb-3">
                        📋 Ringkasan Performa Model
                    </h5>
                    <div
                        className="table-responsive mb-5"
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
                                    <th>Model</th>
                                    <th>Accuracy</th>
                                    <th>Precision</th>
                                    <th>Recall</th>
                                    <th>F1-Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasetList.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.Model || "-"}</td>

                                        <td
                                            style={
                                                Number(item.Accuracy) === maxValues["Accuracy"]
                                                    ? { color: "#ff6600", fontWeight: "bold" }
                                                    : {}
                                            }
                                        >
                                            {item.Accuracy ?? "-"}
                                        </td>

                                        <td
                                            style={
                                                Number(item.Precision) === maxValues["Precision"]
                                                    ? { color: "#ff6600", fontWeight: "bold" }
                                                    : {}
                                            }
                                        >
                                            {item.Precision ?? "-"}
                                        </td>

                                        <td
                                            style={
                                                Number(item.Recall) === maxValues["Recall"]
                                                    ? { color: "#ff6600", fontWeight: "bold" }
                                                    : {}
                                            }
                                        >
                                            {item.Recall ?? "-"}
                                        </td>

                                        <td
                                            style={
                                                Number(item["F1-Score"]) === maxValues["F1-Score"]
                                                    ? { color: "#ff6600", fontWeight: "bold" }
                                                    : {}
                                            }
                                        >
                                            {item["F1-Score"] ?? "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* === BAR CHART === */}
                    <div className="mb-5">
                        <h5 className="text-center mb-3">
                            📊 Perbandingan Performa Model (Bar Chart)
                        </h5>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={datasetList}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Model" tick={{ fontSize: 12 }} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Accuracy" fill="#007bff" />
                                <Bar dataKey="Precision" fill="#ff6600" />
                                <Bar dataKey="Recall" fill="#28a745" />
                                <Bar dataKey="F1-Score" fill="#6f42c1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* === RADAR (SPIDER) CHART === */}
                    <div className="mb-5">
                        <h5 className="text-center mb-3">
                            🕸️ Visualisasi Spider Chart (Radar Chart)
                        </h5>
                        <ResponsiveContainer width="100%" height={450}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" />
                                <PolarRadiusAxis />
                                <Tooltip />
                                <Legend />
                                {datasetList.map((item, i) => (
                                    <Radar
                                        key={i}
                                        name={item.Model}
                                        dataKey={item.Model}
                                        stroke={`hsl(${i * 50}, 70%, 45%)`}
                                        fill={`hsl(${i * 50}, 70%, 60%)`}
                                        fillOpacity={0.3}
                                    />
                                ))}
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* Tidak ada data */}
            {!loading && datasetList.length === 0 && (
                <p className="text-muted" style={{ fontStyle: "italic" }}>
                    Data evaluasi model belum tersedia.
                </p>
            )}
        </div>
    );
};

export default EvaluasiModel;

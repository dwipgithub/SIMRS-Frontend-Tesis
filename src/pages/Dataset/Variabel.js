import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Database } from "lucide-react";
import TypingText from "../../components/TypingText";

const Variabel = () => {
    const data = [
        { name: "Numerik", count: 9, fill: "#3b82f6" },
        { name: "Biner", count: 4, fill: "#10b981" },
        { name: "Target", count: 1, fill: "#f59e0b" },
    ];

    return (
        <div
            className="container"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-4" style={{ gap: "8px" }}>
                <Database className="text-primary" size={24} />
                <h3 className="mb-0">Struktur Variabel</h3>
            </div>

            {/* Bar Chart */}
            <div className="row">
                <div className="col-md-8">
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: "Jumlah Variabel", angle: -90, position: "insideLeft" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "4px",
                                    }}
                                    formatter={(value) => `${value} variabel`}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Info */}
                <div className="col-md-4">
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            padding: "20px",
                            borderRadius: "8px",
                            border: "1px solid #dee2e6",
                        }}
                    >
                        <h5 className="mb-4" style={{ fontWeight: "600" }}>
                            📊 <TypingText text="Ringkasan Variabel" charDelay={40} startDelay={200} />
                        </h5>
                        <div className="mb-3">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "8px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: "#3b82f6",
                                        borderRadius: "4px",
                                    }}
                                />
                                <span><TypingText text="Numerik: 9 variabel" charDelay={40} startDelay={400} /></span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#6c757d", marginLeft: "30px" }}>
                                <TypingText text="Variabel dengan tipe data numerik/kontinyu" charDelay={30} startDelay={600} />
                            </p>
                        </div>

                        <div className="mb-3">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "8px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: "#10b981",
                                        borderRadius: "4px",
                                    }}
                                />
                                <span><TypingText text="Biner: 4 variabel" charDelay={40} startDelay={1000} /></span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#6c757d", marginLeft: "30px" }}>
                                <TypingText text="Variabel kategori dengan 2 nilai (0/1)" charDelay={30} startDelay={1300} />
                            </p>
                        </div>

                        <div className="mb-3">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "8px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: "#f59e0b",
                                        borderRadius: "4px",
                                    }}
                                />
                                <span><TypingText text="Target: 1 variabel" charDelay={40} startDelay={1700} /></span>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#6c757d", marginLeft: "30px" }}>
                                <TypingText text="Variabel target prediksi (Status Penyakit Jantung)" charDelay={30} startDelay={2000} />
                            </p>
                        </div>

                        <hr />
                        <div
                            style={{
                                marginTop: "15px",
                                padding: "10px",
                                backgroundColor: "#e7f3ff",
                                borderRadius: "4px",
                                textAlign: "center",
                            }}
                        >
                            <strong><TypingText text="Total: 14 variabel" charDelay={40} startDelay={2500} /></strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Variabel;

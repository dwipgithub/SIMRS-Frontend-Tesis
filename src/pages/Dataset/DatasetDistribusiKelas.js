import React, { useEffect, useState } from "react";
import { getDatasetClassDistribution } from "../../api/dataset";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import TypingText from "../../components/TypingText";

const DatasetDistribusiKelas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getDatasetClassDistribution();
            if (response.status) {
                setData(response.data);
            } else {
                toast.error(response.message || "Gagal mengambil data distribusi kelas");
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ["#10b981", "#ef4444"];

    if (loading) {
        return <div className="text-center p-5">Loading...</div>;
    }

    return (
        <div className="container"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            {/* Header */}
            <div className="d-flex align-items-center mb-3" style={{ gap: "8px" }}>
                <BarChart3 className="text-primary" size={22} />
                <h3 className="mb-0">Distribusi Kelas</h3>
            </div>

            {/* Loading */}
            {loading && (
                <p className="text-muted" style={{ fontStyle: "italic" }}>
                    Memuat data distribusi kelas...
                </p>
            )}

            {data.length > 0 ? (
                <div className="row">
                    <div className="col-md-6">
                        <div
                            style={{
                                backgroundColor: "#fff",
                                padding: "10px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ label, persentase, cx, cy, midAngle, innerRadius, outerRadius, nilai }) => {
                                            // Custom label dengan dua bagian: nilai di dalam, label di luar
                                            const RADIAN = Math.PI / 180;
                                            
                                            // Posisi untuk label di luar
                                            const radiusOuter = outerRadius + 30;
                                            const xOuter = cx + radiusOuter * Math.cos(-midAngle * RADIAN);
                                            const yOuter = cy + radiusOuter * Math.sin(-midAngle * RADIAN);    
                                            return (
                                                <>
                                                    <text
                                                        x={xOuter}
                                                        y={yOuter}
                                                        fill="#333"
                                                        textAnchor={xOuter > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        fontSize="18"
                                                        fontWeight="600"
                                                    >
                                                        {`${label}`}
                                                    </text>
                                                </>
                                            );
                                        }}
                                        outerRadius={"80%"}
                                        fill="#8884d8"
                                        dataKey="nilai"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} sampel`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="col-md-6">
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
                                        <th>Kelas</th>
                                        <th>Jumlah</th>
                                        <th>Persentase</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-start">
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: 8,
                                                        height: 28,
                                                        backgroundColor: COLORS[index % COLORS.length],
                                                        marginRight: 12,
                                                        verticalAlign: "middle",
                                                        borderRadius: 3,
                                                    }}
                                                />
                                                <TypingText text={item.label} startDelay={index * 120} charDelay={28} />
                                            </td>
                                            <td><TypingText text={`${item.nilai}`} startDelay={index * 160 + 120} charDelay={30} /></td>
                                            <td><TypingText text={`${item.persentase}%`} startDelay={index * 190 + 220} charDelay={30} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">Tidak ada data tersedia</div>
            )}
        </div>
    );
};

export default DatasetDistribusiKelas;

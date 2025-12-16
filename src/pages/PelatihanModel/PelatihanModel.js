import React, { useState } from "react";
import {
    insertPelatihanKNN,
    insertPelatihanLR,
    insertPelatihanNB
} from "../../api/model-klasifikasi";
import "./PelatihanModel.css";

const PelatihanModel = () => {
    const [responses, setResponses] = useState({
        knn: null,
        lr: null,
        nb: null
    });

    const [loading, setLoading] = useState({
        knn: false,
        lr: false,
        nb: false
    });

    const [errors, setErrors] = useState({
        knn: null,
        lr: null,
        nb: null
    });

    const handleRunTraining = async (modelType) => {
        setLoading(prev => ({ ...prev, [modelType]: true }));
        setErrors(prev => ({ ...prev, [modelType]: null }));
        
        try {
            let response;
            if (modelType === "knn") {
                response = await insertPelatihanKNN();
            } else if (modelType === "lr") {
                response = await insertPelatihanLR();
            } else if (modelType === "nb") {
                response = await insertPelatihanNB();
            }
            
            setResponses(prev => ({ ...prev, [modelType]: response }));
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                [modelType]: error.message || "Terjadi kesalahan"
            }));
        } finally {
            setLoading(prev => ({ ...prev, [modelType]: false }));
        }
    };

    const renderResponse = (data) => {
        if (!data) return "-";
        
        if (typeof data === "string") {
            return data;
        }
        
        return JSON.stringify(data, null, 2);
    };

    const trainingModels = [
        {
            id: "knn",
            name: "Model KNN",
            description: "K-Nearest Neighbors"
        },
        {
            id: "lr",
            name: "Model LR",
            description: "Logistic Regression"
        },
        {
            id: "nb",
            name: "Model NB",
            description: "Naive Bayes"
        }
    ];

    return (
        <div className="container" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <h3 className="mb-3">🛠️ Pelatihan Model</h3>

            <div className="table-wrapper">
                <table className="training-table">
                    <thead>
                        <tr>
                            <th>Model Pelatihan</th>
                            <th>Aksi</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainingModels.map((model) => (
                            <tr key={model.id}>
                                <td className="model-name">
                                    <div className="model-info">
                                        <strong>{model.name}</strong>
                                        <small>{model.description}</small>
                                    </div>
                                </td>
                                <td className="action-cell">
                                    <button
                                        className={`btn-run ${loading[model.id] ? "loading" : ""}`}
                                        onClick={() => handleRunTraining(model.id)}
                                        disabled={loading[model.id]}
                                    >
                                        {loading[model.id] ? (
                                            <>
                                                <span className="spinner"></span>
                                                Sedang Berjalan...
                                            </>
                                        ) : (
                                            <>
                                                <span className="btn-icon" aria-hidden>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19.14 12.936c.036-.3.06-.604.06-.936s-.024-.636-.07-.936l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14.5 2h-4a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.68 8.8a.5.5 0 0 0 .12.63l2.03 1.58c-.05.3-.07.62-.07.94 0 .32.02.636.07.94L2.8 15.5a.5.5 0 0 0-.12.63l1.92 3.32c.13.22.4.32.62.24l2.39-.96c.5.4 1.04.72 1.62.96l.36 2.54c.05.28.28.5.5.5h4c.22 0 .45-.22.5-.5l.36-2.54c.58-.24 1.12-.56 1.62-.96l2.39.96c.22.08.49-.02.62-.24l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" fill="white" />
                                                    </svg>
                                                </span>
                                                Jalankan
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="response-cell">
                                    {errors[model.id] ? (
                                        <div className="response-error">
                                            <strong>Error:</strong>
                                            <pre>{errors[model.id]}</pre>
                                        </div>
                                    ) : responses[model.id] ? (
                                        <div className="response-success">
                                            <strong>Sukses:</strong>
                                            <pre>{renderResponse(responses[model.id])}</pre>
                                        </div>
                                    ) : (
                                        <span className="response-empty">Belum dijalankan</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PelatihanModel;

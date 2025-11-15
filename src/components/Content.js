import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Kunjungan from "../pages/Kunjungan/Kunjungan";
import Pemeriksaan from "../pages/Pemeriksaan/Pemeriksaan";
import Laboratorium from "../pages/Laboratorium/Laboratorium";
import Dataset from "../pages/Dataset/Dataset"
import EvaluasiModel from "../pages/EvaluasiModel/EvaluasiModel"

const Content = () => {
    return (
        <div style={{ marginLeft: "340px", marginTop: "80px", padding: "20px" }}>
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/kunjungan" element={<Kunjungan />} />
                <Route path="/pemeriksaan" element={<Pemeriksaan />} />
                <Route path="/laboratorium" element={<Laboratorium />} />
                <Route path="/dataset" element={<Dataset/>}/>
                <Route path="/evaluasi-model" element={<EvaluasiModel/>}/>
            </Routes>
        </div>
    )
}

export default Content;
import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Kunjungan from "../pages/Kunjungan/Kunjungan";
import Pemeriksaan from "../pages/Pemeriksaan/Pemeriksaan";
import Laboratorium from "../pages/Laboratorium/Laboratorium";
import DatasetDistribusiKelas from "../pages/Dataset/DatasetDistribusiKelas" 
import Dataset from "../pages/Dataset/Dataset"
import DatasetVariabel from "../pages/Dataset/Variabel"
import EvaluasiModel from "../pages/EvaluasiModel/EvaluasiModel"
import PelatihanModel from "../pages/PelatihanModel/PelatihanModel"
import PeringkatFitur from "../pages/PeringkatFitur/PeringkatFitur";

const Content = () => {
    return (
        <div style={{ marginLeft: "340px", marginTop: "80px", padding: "20px" }}>
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/kunjungan" element={<Kunjungan />} />
                <Route path="/pemeriksaan" element={<Pemeriksaan />} />
                <Route path="/laboratorium" element={<Laboratorium />} />
                <Route path="/dataset/variabel" element={<DatasetVariabel/>}/>
                <Route path="/dataset/distribusi-kelas" element={<DatasetDistribusiKelas/>}/>
                <Route path="/dataset/statistik" element={<Dataset/>}/>
                <Route path="/model-klasifikasi/evaluasi-model" element={<EvaluasiModel/>}/>
                <Route path="/model-klasifikasi/pelatihan-model" element={<PelatihanModel/>}/>
                <Route path="/model-klasifikasi/peringkat-fitur" element={<PeringkatFitur/>}/>
            </Routes>
        </div>
    )
}

export default Content;
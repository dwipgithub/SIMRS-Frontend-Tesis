import React from "react";
import { Routes, Route } from "react-router-dom";
import Beranda from '../pages/Beranda/Beranda'
import Kunjungan from "../pages/Kunjungan/Kunjungan";
import Pemeriksaan from "../pages/Pemeriksaan/Pemeriksaan";
import HasilLab from "../pages/HasilLab/HasilLab";

const Content = () => {
    return (
        <div style={{ marginLeft: "340px", marginTop: "80px", padding: "20px" }}>
            <Routes>
                <Route path="/beranda" element={<Beranda />} />
                <Route path="/kunjungan" element={<Kunjungan />} />
                <Route path="/pemeriksaan" element={<Pemeriksaan />} />
                <Route path="/hasil-lab" element={<HasilLab />} />
            </Routes>
        </div>
    )
}

export default Content;
import { useEffect } from "react";
import { tokenUser } from "../../api/auth"
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

const Beranda = () => {
    const navigate = useNavigate()

    useEffect(() => {
        refreshToken();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const refreshToken = async () => {
        try {
            await tokenUser()
        } catch (err) {
            navigate("/")
        }
    }

    const profileData = [
        { label: "NIM", value: "2311601245" },
        { label: "Nama", value: "Dwi Prihantono" },
        { label: "Program Studi", value: "Magister Ilmu Komputer" },
        { label: "Pembimbing", value: "Dr. Anton Satria Prabuwono, S.T, S.Si, M.M." },
        { label: "Judul Tesis", value: "Mutual Information dan ReliefF pada Model Klasifikasi untuk Prediksi Penyakit Jantung" }
    ];

    return (
        <div style={{ padding: 0 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Tagesschrift&display=swap');
                .welcome-hero{ display:flex; align-items:center; gap:18px; padding:0; margin-top:-12px; }
                .welcome-icon{ font-size:80px; color:#ff7a18; transform:translateY(-4px); }
                .welcome-text{ position:relative; font-family: 'Tagesschrift', 'Courier New', monospace; font-size:52px; letter-spacing:1px; background: linear-gradient(180deg,#000,#222); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; text-shadow: 0 2px 6px rgba(0,0,0,0.6); }
                /* three short highlighter strokes */
                .welcome-text .hl{ position:absolute; height:12px; background: linear-gradient(90deg, rgba(255,122,24,0) 0%, rgba(255,122,24,0.62) 20%, rgba(255,122,24,0.62) 80%, rgba(255,122,24,0) 100%); transform: rotate(-2deg); border-radius:6px; z-index:1; pointer-events:none; }
                .welcome-text .hl1{ left:4%; width:34%; top:56%; }
                .welcome-text .hl2{ left:38%; width:30%; top:60%; }
                .welcome-text .hl3{ left:70%; width:24%; top:54%; }
                .char{ display:inline-block; position:relative; z-index:2; opacity:1; }
                .welcome-sub{ margin-top:6px; color:#b7f6c6; opacity:0; transform:translateY(6px); animation: fadeIn .9s ease .9s forwards; font-size:14px; }

                @keyframes popIn{ from{ opacity:0; transform:scale(.86) translateY(-6px)} to{ opacity:1; transform:scale(1) translateY(0)} }
                @keyframes charIn{ from{ transform:translateY(14px) } to{ transform:translateY(0) } }
                @keyframes fadeIn{ from{ opacity:0; transform:translateY(6px)} to{ opacity:1; transform:translateY(0)} }

                .profile-section{ padding:24px 0; margin-top:8px; }
                .profile-table{ border-collapse:collapse; font-family: 'Times New Roman', Times, serif; width:auto; }
                .profile-table tr{ border-bottom:2px dotted #ff7a18; }
                .profile-table tr:last-child{ border-bottom:none; }
                .profile-label{ color:#000; font-size:14px; text-transform:uppercase; letter-spacing:0.8px; padding:12px 16px; width:auto; text-align:left; vertical-align:top; font-weight:600; border-right:2px dotted #ff7a18; animation: none !important; position:relative; box-shadow: inset -8px 0 0 -6px white; }
                .profile-value{ color:#000; font-size:15px; line-height:1.5; padding:12px 16px; text-align:left; }
                .profile-char{ display:inline; opacity:1; }
                .typing-text{ color:#000; font-size:15px; }

                .university-header{ display:flex; align-items:center; gap:12px; margin-bottom:2px; }
                .university-icon{ font-size:48px; color:#000; }
                .university-title{ font-size:28px; font-weight:600; color:#000; margin:0; }
            `}</style>

            
            <div className="university-header">
                <GraduationCap className="university-icon" />
                <h2 className="university-title">Universitas Budi Luhur</h2>
            </div>

            <div className="profile-section">
                <table className="profile-table">
                    <tbody>
                        {profileData.map((item, index) => (
                            <tr key={index}>
                                <td className="profile-label" data-typing-done="true">{item.label}</td>
                                <td className="profile-value" data-typing-done="true">{item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Beranda
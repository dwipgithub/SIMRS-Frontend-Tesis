import { useEffect } from "react";
import { tokenUser } from "../../api/auth"
import { useNavigate } from 'react-router-dom'

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

    return (
        <div>
        
        </div>
    )
}

export default Beranda
import { BrowserRouter, Route, Routes } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import LayoutAuth from "./components/LayoutAuth"
import LayoutMain from "./components/LayoutMain"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <BrowserRouter basename="">
            <Routes>
                <Route path="/" element={<LayoutAuth/>} />
                <Route path="/*" element={<LayoutMain/>}/>
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </BrowserRouter>
    )
}

export default App;
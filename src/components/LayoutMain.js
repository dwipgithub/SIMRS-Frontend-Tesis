import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Content from "./Content";

const LayoutMain = () => {
    return (
        <>
            <Navbar />
            <Sidebar />
            <Content />
        </>
    );
};

export default LayoutMain;

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const RootLayout = () => {
    return (
        <div>
            <nav>
                <Navbar />
            </nav>
            <div className="min-h-screen">
                <Outlet />
            </div>
        </div>
    );
}

export default RootLayout;
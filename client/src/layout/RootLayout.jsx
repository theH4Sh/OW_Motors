import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RootLayout = () => {
    return (
        <div className="public-shell">
            <Navbar />
            <main className="public-main">
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;

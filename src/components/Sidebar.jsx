import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    QrCode,
    BarChart,
    LogOut,
    ShieldAlert,
    CheckSquare,
    AlertOctagon,
    FileUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/assets', icon: <Package size={20} />, label: 'Assets' },
        { to: '/procurement', icon: <ShoppingCart size={20} />, label: 'Procurement' },
        { to: '/smart-import', icon: <FileUp size={20} />, label: 'Smart Import' },
        { to: '/verification', icon: <ShieldAlert size={20} />, label: 'Verification' },
        { to: '/defect-detection', icon: <AlertOctagon size={20} />, label: 'Defect Detection' },
        { to: '/approvals', icon: <CheckSquare size={20} />, label: 'Approvals' },
        { to: '/audit', icon: <FileText size={20} />, label: 'Audit Log' },
        { to: '/scanner', icon: <QrCode size={20} />, label: 'QR Scanner' },
        { to: '/reports', icon: <BarChart size={20} />, label: 'Reports' },
    ];

    return (
        <div className="w-64 bg-primary text-white flex flex-col h-screen shrink-0 shadow-lg relative z-20">
            <div className="p-6 flex flex-col items-center border-b border-blue-800/50 mb-2">
                <div className="mb-3 w-full max-w-[160px] flex justify-center hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.png" alt="CIT Logo" className="h-16 object-contain" />
                </div>
                <h1 className="text-2xl font-black tracking-widest text-white text-center font-sans tracking-tight">AssetFlow</h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-1 font-semibold opacity-75">Management System</p>
            </div>
            <nav className="flex-1 mt-6">
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.to} className="mb-2">
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    `flex items-center px-6 py-3 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-accent text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                    }`
                                }
                            >
                                <span className="mr-3">{link.icon}</span>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            {
                user && (
                    <div className="p-6 border-t border-blue-800">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{user.name}</p>
                                <p className="text-xs text-blue-300">{user.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-sm text-blue-300 hover:text-white transition-colors w-full"
                        >
                            <LogOut size={16} className="mr-2" /> Logout
                        </button>
                    </div>
                )
            }
        </div >
    );
}

export default Sidebar;

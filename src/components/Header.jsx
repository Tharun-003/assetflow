import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname.substring(1);
        return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';
    };

    return (
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 border-b border-borderContent">
            <div className="text-xl font-semibold text-primaryText">
                {getPageTitle()}
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex flex-col items-end mr-3">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Guest'}</span>
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide leading-tight">{user?.role || 'User'}</span>
                        </div>
                        <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <ChevronDown size={14} className={`ml-2 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-[fadeIn_0.15s_ease-out_forwards]">
                            <div className="px-4 py-2 border-b border-gray-100 flex flex-col mb-1">
                                <span className="text-xs text-gray-500 font-medium">Signed in as</span>
                                <span className="text-sm font-bold text-gray-900 truncate">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center transition-colors"
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;

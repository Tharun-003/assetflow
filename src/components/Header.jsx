import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

function Header() {
    const { user } = useAuth();
    const location = useLocation();

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
                <div className="flex items-center cursor-pointer">
                    <span className="text-sm font-medium text-primaryText mr-2">{user?.name || 'Guest'}</span>
                    <ChevronDown size={16} className="text-secondaryText" />
                </div>
            </div>
        </header>
    );
}

export default Header;

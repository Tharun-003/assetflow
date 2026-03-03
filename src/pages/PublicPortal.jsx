import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Globe, Building, DollarSign, LogIn, TrendingUp } from 'lucide-react';

function PublicPortal() {
    const { assets, procurements } = useData();
    const navigate = useNavigate();

    // Aggregate Data
    const totalAssetValue = useMemo(() => {
        return assets.reduce((sum, asset) => sum + asset.cost, 0);
    }, [assets]);

    const deptSpendingData = useMemo(() => {
        const spend = {};
        procurements.forEach(p => {
            spend[p.department] = (spend[p.department] || 0) + p.amount;
        });
        return Object.keys(spend).map(dept => ({ name: dept, value: spend[dept] }));
    }, [procurements]);

    // Safe subset of procurements
    const publicProcurements = procurements.map(p => ({
        id: p.id,
        item: p.item,
        department: p.department,
        amount: p.amount,
        date: p.date
    })).slice(0, 10); // Show only recent 10

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <header className="bg-primary text-white p-6 shadow-md flex justify-between items-center sm:px-12 sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <Globe size={28} className="text-accent" />
                    <h1 className="text-2xl font-bold italic tracking-wider">AssetFlow <span className="text-sm font-normal not-italic text-blue-200">Public Portal</span></h1>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-accent text-primary px-4 py-2 flex items-center rounded-md font-medium hover:bg-yellow-500 transition shadow-sm"
                >
                    <LogIn size={18} className="mr-2" /> Staff Login
                </button>
            </header>

            <main className="flex-1 p-6 sm:p-12 max-w-7xl mx-auto w-full space-y-8">

                <div className="text-center py-8">
                    <h2 className="text-4xl font-extrabold text-primaryText mb-4">Transparency in Institutional Spending</h2>
                    <p className="text-xl text-secondaryText max-w-3xl mx-auto">Providing clear, accessible insights into the allocation and management of resources across all departments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Total Value Banner */}
                    <div className="bg-primary text-white rounded-2xl p-8 flex flex-col justify-center items-center shadow-lg transform hover:scale-105 transition duration-300">
                        <DollarSign size={48} className="text-accent mb-4" />
                        <span className="text-blue-200 text-lg uppercase tracking-widest font-semibold mb-2">Total Institutional Value Managed</span>
                        <p className="text-5xl md:text-6xl font-black">₹{totalAssetValue.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-borderContent flex flex-col justify-center items-center text-center">
                            <Building size={32} className="text-blue-600 mb-3" />
                            <span className="text-secondaryText text-sm font-medium">Departments Active</span>
                            <p className="text-3xl font-bold text-primaryText mt-2">{deptSpendingData.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-borderContent flex flex-col justify-center items-center text-center">
                            <TrendingUp size={32} className="text-green-600 mb-3" />
                            <span className="text-secondaryText text-sm font-medium">Recorded Procurements</span>
                            <p className="text-3xl font-bold text-primaryText mt-2">{procurements.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-borderContent">
                        <h3 className="text-lg font-bold text-primaryText mb-6 tracking-wide">Department Spending Allocation</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={deptSpendingData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} width={80} />
                                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Public Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-borderContent overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-borderContent bg-gray-50">
                            <h3 className="text-lg font-bold text-primaryText tracking-wide">Recent Procurements</h3>
                            <p className="text-sm text-secondaryText">A read-only view of recent approved budgetary spending</p>
                        </div>
                        <div className="overflow-x-auto flex-1 p-0 m-0 w-full">
                            <table className="min-w-full text-left border-collapse w-full">
                                <thead className="bg-white text-gray-500 font-bold border-b border-borderContent">
                                    <tr>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {publicProcurements.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primaryText font-medium">{req.item}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{req.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold">₹{req.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{req.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-primaryText p-8 border-t-4 border-accent mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                    <p className="mb-4 md:mb-0">Powered by AssetFlow – Promoting Transparency under SDG 16</p>
                    <div className="flex space-x-6">
                        <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
                        <span className="hover:text-white cursor-pointer transition">Open Data License</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PublicPortal;

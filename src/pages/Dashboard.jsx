import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, AlertTriangle, Activity, Wrench, Plus, FileText, ClipboardList } from 'lucide-react';

const COLORS = ['#1E3A5F', '#F59E0B', '#EF4444', '#10B981'];

function Dashboard() {
    const { assets, procurements, auditLogs } = useData();
    const navigate = useNavigate();

    // Calculate Stats
    const totalAssets = assets.length;
    const pendingApprovals = procurements.filter(p => !['Approved', 'Purchased', 'Delivered'].includes(p.status)).length;
    const activeProcurements = procurements.filter(p => ['Requested', 'Reviewing', 'Approved', 'Purchased'].includes(p.status)).length;
    const maintenanceAssets = assets.filter(a => a.status === 'In Repair').length;

    // Department Bar Chart Data
    const deptData = useMemo(() => {
        const counts = {};
        assets.forEach(a => {
            counts[a.department] = (counts[a.department] || 0) + 1;
        });
        return Object.keys(counts).map(dept => ({ name: dept, value: counts[dept] }));
    }, [assets]);

    // Asset Status Pie Chart Data
    const statusData = useMemo(() => {
        const counts = { Active: 0, 'In Repair': 0, Disposed: 0 };
        assets.forEach(a => {
            if (counts[a.status] !== undefined) counts[a.status]++;
        });
        return Object.keys(counts).map(status => ({ name: status, value: counts[status] }));
    }, [assets]);

    // Monthly Spending Line Chart Data
    const monthlyData = useMemo(() => {
        const spend = { 'Aug': 0, 'Sep': 0, 'Oct': 0 };
        procurements.forEach(p => {
            const monthIndex = new Date(p.date).getMonth();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const m = monthNames[monthIndex];
            if (spend[m] !== undefined) spend[m] += p.amount;
        });
        return Object.keys(spend).map(month => ({ name: month, amount: spend[month] }));
    }, [procurements]);

    return (
        <div className="relative min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 z-0 overflow-hidden">
            {/* Blurred Background */}
            <div
                className="absolute inset-0 z-[-2] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/cit main image.jpg')",
                    filter: "blur(4px)",
                    transform: "scale(1.05)" // prevents white edges from blurring
                }}
            />
            {/* Clear content overlay for readability */}
            <div className="absolute inset-0 z-[-1] bg-white/70" />

            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primaryText">Admin Dashboard</h2>
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/assets')} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm">
                            <Plus size={16} className="mr-2" /> Add Asset
                        </button>
                        <button onClick={() => navigate('/procurement')} className="bg-accent text-primary px-4 py-2 rounded-lg flex items-center font-medium hover:bg-yellow-500 transition shadow-sm">
                            <ClipboardList size={16} className="mr-2" /> New Procurement
                        </button>
                        <button onClick={() => navigate('/audit')} className="bg-white border border-borderContent text-primaryText px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition shadow-sm">
                            <FileText size={16} className="mr-2" /> Audit Log
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Assets" value={totalAssets} icon={<Activity />} color="bg-blue-100 text-blue-800" />
                    <StatCard title="Pending Approvals" value={pendingApprovals} icon={<AlertTriangle />} color="bg-yellow-100 text-yellow-800" />
                    <StatCard title="Active Procurements" value={activeProcurements} icon={<ClipboardList />} color="bg-green-100 text-green-800" />
                    <StatCard title="Due for Maintenance" value={maintenanceAssets} icon={<Wrench />} color="bg-red-100 text-red-800" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Column */}
                    <div className="col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard title="Asset Distribution">
                                <ResponsiveContainer width="100%" height={250}>
                                    <ReBarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} barSize={40} />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Asset Status">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <ChartCard title="Monthly Procurement Spending">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* Activity Feed Column */}
                    <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-primaryText mb-4">Recent Activity</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {auditLogs.slice(0, 8).map(log => (
                                <div key={log.id} className="flex border-b border-gray-100 pb-3 last:border-0">
                                    <div className={`mt-1 mr-3 w-2 h-2 rounded-full flex-shrink-0 ${log.action === 'Create' ? 'bg-blue-500' :
                                        log.action === 'Edit' ? 'bg-yellow-500' :
                                            log.action === 'Delete' ? 'bg-red-500' : 'bg-green-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-primaryText">{log.user}</p>
                                        <p className="text-xs text-secondaryText truncate" title={log.details}>{log.details}</p>
                                        <p className="text-xs text-gray-400 mt-1">{log.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/audit')} className="w-full mt-4 text-sm text-primary font-medium hover:text-blue-800 transition pt-3 border-t border-gray-100">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6 flex items-center">
            <div className={`p-4 rounded-lg mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-secondaryText font-medium">{title}</p>
                <p className="text-2xl font-bold text-primaryText">{value}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6">
            <h3 className="text-base font-semibold text-primaryText mb-4">{title}</h3>
            {children}
        </div>
    );
}

export default Dashboard;

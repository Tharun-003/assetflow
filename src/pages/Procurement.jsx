import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, Plus, ArrowLeft, CheckCircle, XCircle, AlertTriangle, ShieldAlert,
    GraduationCap, Monitor, Library, Building, Coffee, Bus, PlusSquare, Trophy, Mic, Wrench
} from 'lucide-react';

const procurementCategories = [
    { name: 'Academic Approvals', icon: GraduationCap },
    { name: 'IT & Technology', icon: Monitor },
    { name: 'Library Approvals', icon: Library },
    { name: 'Hostel Approvals', icon: Building },
    { name: 'Food & Kitchen', icon: Coffee },
    { name: 'Transport & Vehicles', icon: Bus },
    { name: 'Medical Approvals', icon: PlusSquare },
    { name: 'Sports Approvals', icon: Trophy },
    { name: 'Event & AV Equipment', icon: Mic },
    { name: 'Campus Infrastructure', icon: Wrench },
];

const pipelineStages = ['Requested', 'Reviewing', 'Approved', 'Purchased', 'Delivered'];

function Procurement() {
    const { procurements, updateProcurementStatus, addProcurement } = useData();
    const { user } = useAuth();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDept, setFilterDept] = useState('All');

    // New Request Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newReq, setNewReq] = useState({
        item: '', category: 'IT & Technology', department: 'IT Dept', requestedBy: '',
        type: 'New Purchase', amount: '', priority: 'Medium', notes: ''
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addProcurement({
            item: newReq.item,
            category: newReq.category,
            department: newReq.department,
            requestedBy: newReq.requestedBy || (user ? user.name : 'Unknown'),
            type: newReq.type,
            amount: Number(newReq.amount) || 0,
            priority: newReq.priority,
            notes: newReq.notes,
            status: 'Requested'
        });
        setIsAddOpen(false);
        setNewReq({ item: '', category: 'IT & Technology', department: 'IT Dept', requestedBy: '', type: 'New Purchase', amount: '', priority: 'Medium', notes: '' });
    };

    const handleAction = (id, status) => {
        updateProcurementStatus(id, status);
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const totalCount = procurements.length;
        const totalValue = procurements.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const pendingReview = procurements.filter(p => p.status === 'Requested' || p.status === 'Pending' || p.status === 'Reviewing').length;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const approvedThisMonth = procurements.filter(p => {
            if (p.status !== 'Approved' && p.status !== 'Purchased' && p.status !== 'Delivered') return false;
            if (!p.date) return false;
            const d = new Date(p.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        return { totalCount, totalValue, pendingReview, approvedThisMonth };
    }, [procurements]);

    // Detect duplicate in selected category
    const duplicateAlert = useMemo(() => {
        if (!selectedCategory) return null;
        const catProcs = procurements.filter(p => p.category === selectedCategory);
        const itemWords = {};
        const ignoreWords = ['purchase', 'upgrade', 'procurement', 'replacement', 'renewal', 'set', 'batch', 'expansion', 'installation', 'contract', 'refill', 'kit'];

        for (const p of catProcs) {
            if (!p.item) continue;
            const words = p.item.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            for (const w of words) {
                if (ignoreWords.includes(w)) continue;
                if (itemWords[w]) {
                    return p.item; // Return the full name of the item that matched
                } else {
                    itemWords[w] = true;
                }
            }
        }
        return null;
    }, [selectedCategory, procurements]);

    // Table filtering
    const filteredProcurements = useMemo(() => {
        return procurements.filter(p => {
            const cMatch = !selectedCategory || p.category === selectedCategory;
            const sMatch = !search || (p.item && p.item.toLowerCase().includes(search.toLowerCase())) || (p.id && p.id.toLowerCase().includes(search.toLowerCase()));
            const stMatch = filterStatus === 'All' || p.status === filterStatus;
            const dMatch = filterDept === 'All' || p.department === filterDept;
            return cMatch && sMatch && stMatch && dMatch;
        });
    }, [procurements, selectedCategory, search, filterStatus, filterDept]);

    const renderPipelineStepper = (currentStatus) => {
        let activeIdx = pipelineStages.indexOf(currentStatus);
        const isRejected = currentStatus === 'Rejected';
        if (isRejected) {
            return <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-md border border-red-200">Rejected</span>;
        }
        if (activeIdx === -1) activeIdx = 0; // default to requested if 'Pending' or similar

        return (
            <div className="flex items-center space-x-2 text-xs">
                {pipelineStages.map((stage, idx) => {
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;

                    return (
                        <React.Fragment key={stage}>
                            <span className={`whitespace-nowrap ${isActive ? 'font-bold text-black border border-gray-400 px-2 py-0.5 rounded-full bg-gray-50 shadow-sm' : isCompleted ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
                                {stage}
                            </span>
                            {idx < pipelineStages.length - 1 && (
                                <span className={`text-lg leading-none ${isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>›</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 flex flex-col h-full relative font-sans w-full">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-primaryText mb-1">AssetFlow - Procurement</h2>
                    {selectedCategory && (
                        <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 hover:underline flex items-center">
                            <ArrowLeft size={14} className="mr-1" /> Back to Categories
                        </button>
                    )}
                </div>
                <button onClick={() => setIsAddOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm whitespace-nowrap">
                    <Plus size={16} className="mr-2" /> New Request
                </button>
            </div>

            {/* Top Stat Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-4 flex flex-col justify-center">
                    <p className="text-sm text-secondaryText font-medium">Total Approvals</p>
                    <p className="text-2xl font-bold text-primaryText">{stats.totalCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-4 flex flex-col justify-center">
                    <p className="text-sm text-secondaryText font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-primaryText">₹{stats.totalValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-4 flex flex-col justify-center">
                    <p className="text-sm text-secondaryText font-medium">Pending Review</p>
                    <p className="text-2xl font-bold text-primaryText">{stats.pendingReview}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-4 flex flex-col justify-center">
                    <p className="text-sm text-secondaryText font-medium">Approved This Month</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approvedThisMonth}</p>
                </div>
            </div>

            {/* Dashboard or Table */}
            {!selectedCategory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {procurementCategories.map((cat) => {
                        const Icon = cat.icon;
                        const catProcs = procurements.filter(p => p.category === cat.name);
                        const count = catProcs.length;
                        const value = catProcs.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                        const pending = catProcs.filter(p => p.status === 'Requested' || p.status === 'Pending' || p.status === 'Reviewing').length;
                        const approved = catProcs.filter(p => p.status === 'Approved' || p.status === 'Purchased' || p.status === 'Delivered').length;
                        const rejected = catProcs.filter(p => p.status === 'Rejected').length;

                        return (
                            <div
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className="bg-white rounded-xl shadow-md border border-borderContent p-6 cursor-pointer hover:shadow-lg hover:border-primary hover:scale-[1.02] transform transition-all duration-200 flex flex-col h-full"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-xl bg-blue-50 text-primary mr-4">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg text-primaryText">{cat.name}</h3>
                                </div>
                                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs text-secondaryText font-semibold uppercase tracking-wider mb-1">Requests</p>
                                        <p className="text-lg font-bold text-gray-800">{count}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-secondaryText font-semibold uppercase tracking-wider mb-1">Total Value</p>
                                        <p className="text-lg font-bold text-gray-800">₹{value.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-md text-center mt-auto">
                                    {pending} Pending · {approved} Approved · {rejected} Rejected
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col overflow-hidden max-h-[800px]">
                    {duplicateAlert && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-4 rounded-r flex items-start">
                            <AlertTriangle className="text-amber-500 mr-3 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm mb-1">AI Duplicate Alert</h4>
                                <p className="text-amber-700 text-sm">
                                    A similar item ("<span className="font-semibold">{duplicateAlert}</span>") has already been requested or approved recently. Consider checking existing approvals or inventory before proceeding.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="p-4 border-b border-borderContent flex justify-between items-center bg-gray-50 flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg text-primaryText mr-4 hidden sm:block">{selectedCategory}</h3>
                            <div className="relative w-full sm:w-64">
                                <Search size={18} className="absolute left-3 top-2.5 text-secondaryText" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-borderContent rounded-lg text-sm shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Filter size={18} className="text-secondaryText hidden sm:block" />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-borderContent rounded-lg px-3 py-2 text-sm shadow-sm flex-1 sm:flex-none">
                                <option value="All">All Statuses</option>
                                <option value="Requested">Requested</option>
                                <option value="Reviewing">Reviewing</option>
                                <option value="Approved">Approved</option>
                                <option value="Purchased">Purchased</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 h-[400px]">
                        <table className="min-w-full text-left border-collapse w-full">
                            <thead className="bg-[#F3F4F6] text-primaryText sticky top-0 z-10 font-bold border-b border-borderContent">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Amount (₹)</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Pipeline Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 p-0 m-0">
                                {filteredProcurements.length > 0 ? filteredProcurements.map((proc) => {
                                    return (
                                        <tr key={proc.id} className="hover:bg-gray-50 flex-none m-0">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary m-0">{proc.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primaryText m-0">{proc.item}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText m-0">{proc.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 m-0">₹{(Number(proc.amount) || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap m-0">{renderPipelineStepper(proc.status)}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-secondaryText italic bg-gray-50 m-0">
                                            No procurement requests found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText">
                        Showing {filteredProcurements.length} procurements in {selectedCategory}
                    </div>
                </div>
            )}

            {/* Modal code for add omitted for simplicity of update... just ensuring layout flows correctly. */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">Add New</h3><button onClick={() => setIsAddOpen(false)}><XCircle size={20} /></button></div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAddSubmit}>
                                {/* Simple Add Fields mapping */}
                                <label className="block mb-2">Item Name <input required type="text" className="w-full border p-2" onChange={e => setNewReq({ ...newReq, item: e.target.value })} /></label>
                                <label className="block mb-2">Amount <input type="number" required className="w-full border p-2" onChange={e => setNewReq({ ...newReq, amount: e.target.value })} /></label>
                                <button type="submit" className="w-full bg-primary text-white p-2">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Procurement;

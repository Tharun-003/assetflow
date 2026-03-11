import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
    Search, Filter, Plus, ArrowLeft, CheckCircle, XCircle, AlertTriangle, ShieldAlert,
    GraduationCap, Monitor, Library, Building, Coffee, Bus, PlusSquare, Trophy, Mic, Wrench
} from 'lucide-react';

const approvalCategories = [
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

function Approvals() {
    const { procurements, updateProcurementStatus, addProcurement } = useData();
    const { user } = useAuth();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDept, setFilterDept] = useState('All');

    const [selectedReq, setSelectedReq] = useState(null);
    const [comment, setComment] = useState('');

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

    const handleAction = (status) => {
        if (selectedReq) {
            updateProcurementStatus(selectedReq.id, status);
            setSelectedReq(null);
            setComment('');
        }
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
            // Map out rejected so kanban leftovers don't break pipeline? Pipeline handles it, but rejected is rejected
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
        <div className="space-y-6 flex flex-col h-full relative font-sans">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primaryText mb-1 flex items-center">
                        AssetFlow - Approvals
                    </h2>
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

            {!selectedCategory ? (
                // Dashboard View
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-6" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                    {approvalCategories.map((cat) => {
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
                                    <div>
                                        <h3 className="font-bold text-lg text-primaryText">{cat.name}</h3>
                                    </div>
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
                                <div className="mt-auto text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-md text-center">
                                    {pending} Pending · {approved} Approved · {rejected} Rejected
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Table View
                <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col h-full max-h-[calc(100vh-240px)]">
                    {/* Duplicate Alert Banner */}
                    {duplicateAlert && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-4 rounded-r flex items-start">
                            <AlertTriangle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm mb-1">AI Duplicate Alert</h4>
                                <p className="text-amber-700 text-sm">
                                    A similar item ("<span className="font-semibold">{duplicateAlert}</span>") has already been requested or approved recently. Consider checking existing approvals or inventory before proceeding.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Table Toolbar */}
                    <div className="p-4 border-b border-borderContent flex justify-between items-center bg-gray-50 rounded-t-xl flex-wrap gap-4">
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            <h3 className="font-bold text-lg text-primaryText mr-4 whitespace-nowrap hidden sm:block">{selectedCategory}</h3>
                            <div className="relative flex-1 md:w-64">
                                <Search size={18} className="absolute left-3 top-2.5 text-secondaryText" />
                                <input
                                    type="text"
                                    placeholder="Search approvals..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-borderContent rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-sm shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter size={18} className="text-secondaryText" />
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Requested">Requested</option>
                                <option value="Reviewing">Reviewing</option>
                                <option value="Approved">Approved</option>
                                <option value="Purchased">Purchased</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <select
                                value={filterDept}
                                onChange={e => setFilterDept(e.target.value)}
                                className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm hidden sm:block"
                            >
                                <option value="All">All Departments</option>
                                <option value="IT Dept">IT Dept</option>
                                <option value="Admin">Admin</option>
                                <option value="Library Dept">Library Dept</option>
                                <option value="Sports Dept">Sports Dept</option>
                                <option value="Hostel Admin">Hostel Admin</option>
                                <option value="Medical Center">Medical Center</option>
                                <option value="Transport Dept">Transport Dept</option>
                                <option value="Event Committee">Event Committee</option>
                                <option value="Campus Security">Campus Security</option>
                                <option value="Academic Block">Academic Block</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto overflow-y-auto flex-1 h-[400px]">
                        <table className="min-w-full text-left border-collapse w-full">
                            <thead className="bg-[#F3F4F6] text-primaryText sticky top-0 z-10 font-bold border-b border-borderContent shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Approval ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Amount (₹)</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Pipeline Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredProcurements.length > 0 ? filteredProcurements.map((proc) => {
                                    return (
                                        <tr
                                            key={proc.id}
                                            onClick={() => setSelectedReq(proc)}
                                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{proc.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primaryText font-medium">{proc.item}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{proc.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{proc.requestedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{(Number(proc.amount) || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{proc.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderPipelineStepper(proc.status)}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-sm text-secondaryText italic bg-gray-50">
                                            No approval requests found in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText rounded-b-xl flex justify-between items-center">
                        <span>Showing {filteredProcurements.length} approvals</span>
                    </div>
                </div>
            )}

            {/* Action Modal (Row Click) */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg font-sans relative flex flex-col max-h-full">
                        <div className="flex justify-between items-center p-6 border-b border-borderContent">
                            <h3 className="text-xl font-bold text-primaryText">Review Request: {selectedReq.id}</h3>
                            <button onClick={() => setSelectedReq(null)} className="text-secondaryText hover:text-primaryText"><XCircle size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="bg-gray-50 p-4 rounded-lg border border-borderContent mb-6 space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-secondaryText">Item</span>
                                        <p className="font-medium text-primaryText">{selectedReq.item}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-secondaryText">Amount</span>
                                        <p className="font-medium text-primaryText">₹{(Number(selectedReq.amount) || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-secondaryText">Department</span>
                                        <p className="font-medium text-primaryText">{selectedReq.department}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-secondaryText">Requested By</span>
                                        <p className="font-medium text-primaryText">{selectedReq.requestedBy}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-secondaryText">Date</span>
                                        <p className="font-medium text-primaryText">{selectedReq.date}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-secondaryText">Current Status</span>
                                        <p className="font-medium text-primaryText">{selectedReq.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mb-6 pl-2">
                                <h4 className="text-sm font-semibold text-primaryText mb-3">Approval Timeline</h4>
                                <div className="space-y-4 border-l-2 border-gray-200 pl-4 relative">
                                    <div className="relative">
                                        <span className="absolute -left-5 bg-primary rounded-full p-1 border-2 border-white"><CheckCircle size={10} className="text-white" /></span>
                                        <p className="text-xs font-medium text-primaryText">Requested</p>
                                        <p className="text-xs text-secondaryText">{selectedReq.date} by {selectedReq.requestedBy}</p>
                                    </div>
                                    {selectedReq.status === 'Reviewing' && (
                                        <div className="relative">
                                            <span className="absolute -left-5 bg-blue-500 rounded-full p-1 border-2 border-white"><CheckCircle size={10} className="text-white" /></span>
                                            <p className="text-xs font-medium text-primaryText">Under Review</p>
                                            <p className="text-xs text-secondaryText">Status updated to Reviewing</p>
                                        </div>
                                    )}
                                    {selectedReq.status === 'Pending Verification' && (
                                        <div className="relative">
                                            <span className="absolute -left-5 bg-orange-500 rounded-full p-1 border-2 border-white"><AlertTriangle size={10} className="text-white" /></span>
                                            <p className="text-xs font-medium text-primaryText">Pending Verification</p>
                                            <p className="text-xs text-secondaryText">Requires verification before approval</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comment Box */}
                            {(['Requested', 'Pending', 'Pending Verification', 'Reviewing'].includes(selectedReq.status)) && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-primaryText mb-1 flex items-center">
                                        Add Comment
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm"
                                        placeholder="Enter your justification or notes here..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-borderContent bg-gray-50 rounded-b-xl flex justify-between space-x-3 items-center">
                            <button
                                onClick={() => setSelectedReq(null)}
                                className="px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-100 font-medium"
                            >
                                Close
                            </button>

                            {(['Requested', 'Pending', 'Pending Verification', 'Reviewing'].includes(selectedReq.status)) && (
                                <div className="flex space-x-3 items-center">
                                    {/* Role check for action buttons */}
                                    {(!user || (user.role !== 'chairman' && user.role !== 'principle')) ? (
                                        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 flex items-center shadow-sm">
                                            <ShieldAlert size={14} className="mr-1.5" />
                                            Only chairman or principle can approve/reject.
                                        </div>
                                    ) : (
                                        <>
                                            {selectedReq.status !== 'Reviewing' && (
                                                <button
                                                    onClick={() => handleAction('Reviewing')}
                                                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md shadow-sm hover:bg-blue-200 font-medium flex items-center"
                                                >
                                                    Mark Reviewing
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleAction('Rejected')}
                                                className="px-4 py-2 bg-red-100 text-red-800 rounded-md shadow-sm hover:bg-red-200 font-medium flex items-center"
                                            >
                                                <XCircle size={16} className="mr-1" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction('Approved')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 font-medium flex items-center"
                                            >
                                                <CheckCircle size={16} className="mr-1" /> Approve
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Request Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-sans">
                        <div className="flex justify-between items-center p-6 border-b border-borderContent">
                            <h3 className="text-xl font-bold text-primaryText">Add New Approval Request</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-secondaryText hover:text-primaryText"><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Item Name</label>
                                    <input required type="text" value={newReq.item} onChange={e => setNewReq({ ...newReq, item: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Category</label>
                                    <select required value={newReq.category} onChange={e => setNewReq({ ...newReq, category: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        {approvalCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Department</label>
                                    <select required value={newReq.department} onChange={e => setNewReq({ ...newReq, department: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        <option value="IT Dept">IT Dept</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Library Dept">Library Dept</option>
                                        <option value="Sports Dept">Sports Dept</option>
                                        <option value="Hostel Admin">Hostel Admin</option>
                                        <option value="Medical Center">Medical Center</option>
                                        <option value="Transport Dept">Transport Dept</option>
                                        <option value="Event Committee">Event Committee</option>
                                        <option value="Campus Security">Campus Security</option>
                                        <option value="Academic Block">Academic Block</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Requested By</label>
                                    <input type="text" value={newReq.requestedBy} onChange={e => setNewReq({ ...newReq, requestedBy: e.target.value })} placeholder="e.g. John Doe" className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Estimated Amount (₹)</label>
                                    <input required type="number" min="0" value={newReq.amount} onChange={e => setNewReq({ ...newReq, amount: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Approval Type</label>
                                    <select value={newReq.type} onChange={e => setNewReq({ ...newReq, type: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        <option value="New Purchase">New Purchase</option>
                                        <option value="Disposal">Disposal</option>
                                        <option value="Transfer">Transfer</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Priority</label>
                                    <select value={newReq.priority} onChange={e => setNewReq({ ...newReq, priority: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-primaryText mb-1">Justification / Notes</label>
                                <textarea rows="3" value={newReq.notes} onChange={e => setNewReq({ ...newReq, notes: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-blue-800">Submit for Approval</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Approvals;

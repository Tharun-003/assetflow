import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Filter, Plus, AlertCircle, X, ChevronRight } from 'lucide-react';

function Procurement() {
    const { procurements, addProcurement } = useData();
    const { user } = useAuth();

    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDept, setFilterDept] = useState('All');

    const [isNewOpen, setIsNewOpen] = useState(false);
    const [newReq, setNewReq] = useState({ item: '', department: 'IT', amount: '' });

    // Mock Duplicate Detection
    const hasDuplicate = procurements.some(p => p.item.toLowerCase().includes('macbook') && p.status !== 'Delivered') && user;

    const filteredData = procurements.filter(p => {
        const sMatch = filterStatus === 'All' || p.status === filterStatus;
        const dMatch = filterDept === 'All' || p.department === filterDept;
        return sMatch && dMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Requested': return 'bg-gray-100 text-gray-800';
            case 'Reviewing': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-purple-100 text-purple-800';
            case 'Purchased': return 'bg-yellow-100 text-yellow-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-orange-100 text-orange-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addProcurement({ ...newReq, amount: Number(newReq.amount) || 0, requestedBy: user?.name || 'Guest' });
        setIsNewOpen(false);
        setNewReq({ item: '', department: 'IT', amount: '' });
    };

    const PipelineViz = ({ currentStatus }) => {
        const steps = ['Requested', 'Reviewing', 'Approved', 'Purchased', 'Delivered'];
        const currentIndex = steps.indexOf(currentStatus) === -1 ? 0 : steps.indexOf(currentStatus);

        return (
            <div className="flex items-center space-x-2 text-xs font-medium">
                {steps.map((step, idx) => (
                    <React.Fragment key={step}>
                        <span className={`px-2 py-1 rounded-full ${idx <= currentIndex ? getStatusColor(step) : 'bg-gray-50 text-gray-400'}`}>
                            {step}
                        </span>
                        {idx < steps.length - 1 && <ChevronRight size={12} className={idx < currentIndex ? "text-primary" : "text-gray-300"} />}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primaryText">Procurement Monitoring</h2>
                <button onClick={() => setIsNewOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm">
                    <Plus size={16} className="mr-2" /> New Request
                </button>
            </div>

            {hasDuplicate && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm flex items-start">
                    <AlertCircle className="text-amber-500 mr-3 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-semibold text-amber-800">AI Duplicate Alert</h3>
                        <p className="text-sm text-amber-700 mt-1">A similar item ("MacBook") has already been requested or procured recently. Consider checking existing inventory or pending requests.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col flex-1">
                {/* Filters */}
                <div className="p-4 border-b border-borderContent flex space-x-4 bg-gray-50 rounded-t-xl">
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-secondaryText" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm">
                            <option value="All">All Statuses</option>
                            <option value="Requested">Requested</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Approved">Approved</option>
                            <option value="Purchased">Purchased</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm">
                        <option value="All">All Departments</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Management">Management</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Facilities">Facilities</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1 h-full max-h-[calc(100vh-280px)]" style={{ scrollbarWidth: 'thin' }}>
                    <table className="min-w-full text-left border-collapse w-full relative">
                        <thead className="bg-[#F3F4F6] text-primaryText sticky top-0 z-10 font-bold border-b border-borderContent">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Requested By</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Pipeline Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredData.length > 0 ? filteredData.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{req.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primaryText font-medium">{req.item}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{req.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{req.requestedBy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">₹{req.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{req.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <PipelineViz currentStatus={req.status} />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-secondaryText italic bg-gray-50">
                                        No procurement requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Request Modal */}
            {isNewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md font-sans p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primaryText">New Procurement Request</h3>
                            <button onClick={() => setIsNewOpen(false)} className="text-secondaryText hover:text-primaryText"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-primaryText mb-1">Item Description</label>
                                <input required type="text" value={newReq.item} onChange={e => setNewReq({ ...newReq, item: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" placeholder="e.g. 5x Office Chairs" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primaryText mb-1">Department</label>
                                <select required value={newReq.department} onChange={e => setNewReq({ ...newReq, department: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Management">Management</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Facilities">Facilities</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primaryText mb-1">Estimated Amount (₹)</label>
                                <input required type="number" min="0" value={newReq.amount} onChange={e => setNewReq({ ...newReq, amount: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsNewOpen(false)} className="px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-blue-800">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Procurement;

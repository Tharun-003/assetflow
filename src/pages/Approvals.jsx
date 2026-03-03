import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, XCircle, MessageSquare, Clock, X } from 'lucide-react';

function Approvals() {
    const { procurements, updateProcurementStatus } = useData();
    const { user } = useAuth();
    const [selectedReq, setSelectedReq] = useState(null);
    const [comment, setComment] = useState('');

    // Kanban Columns
    const columns = ['Pending', 'Reviewing', 'Approved', 'Rejected'];

    const getDaysPending = (dateStr) => {
        const d1 = new Date(dateStr);
        const d2 = new Date();
        const diff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : 0; // fallback
    };

    const handleAction = (status) => {
        if (selectedReq) {
            updateProcurementStatus(selectedReq.id, status);
            // In a real app we'd save the comment too
            setSelectedReq(null);
            setComment('');
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primaryText">Approval Workflow</h2>
                <p className="text-secondaryText text-sm">Kanban Board for Procurement Requests</p>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex space-x-6 h-full min-w-max pb-4">
                    {columns.map(col => {
                        // "Pending" is mapped to "Requested" in the data, or actual "Pending"
                        const colData = procurements.filter(p => {
                            if (col === 'Pending') return p.status === 'Requested' || p.status === 'Pending';
                            return p.status === col;
                        });

                        return (
                            <div key={col} className="w-80 flex flex-col bg-gray-50 rounded-xl border border-borderContent">
                                <div className="p-4 border-b border-borderContent flex justify-between items-center bg-white rounded-t-xl shadow-sm">
                                    <h3 className="font-semibold text-primaryText">{col}</h3>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {colData.length}
                                    </span>
                                </div>
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)', scrollbarWidth: 'none' }}>
                                    {colData.map(req => {
                                        const days = getDaysPending(req.date);
                                        const isEscalated = col !== 'Approved' && col !== 'Rejected' && days > 3;

                                        return (
                                            <div
                                                key={req.id}
                                                onClick={() => setSelectedReq(req)}
                                                className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:border-primary transition-colors hover:shadow-md ${isEscalated ? 'border-red-200' : 'border-borderContent'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-medium text-gray-500">{req.id}</span>
                                                    {isEscalated && (
                                                        <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                            <AlertCircle size={10} className="mr-1" /> Escalated
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-primaryText mb-1">{req.item}</h4>
                                                <div className="text-xs text-secondaryText mb-3 space-y-1">
                                                    <p>Dept: {req.department}</p>
                                                    <p>By: {req.requestedBy}</p>
                                                    <p className="font-medium text-gray-800">₹{req.amount.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                    <div className="flex items-center">
                                                        <Clock size={12} className="mr-1" /> {days} days
                                                    </div>
                                                    {(col === 'Pending' || col === 'Reviewing') && (
                                                        <button className="text-primary hover:underline font-medium">Review</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Modal */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg font-sans relative flex flex-col max-h-full">
                        <div className="flex justify-between items-center p-6 border-b border-borderContent">
                            <h3 className="text-xl font-bold text-primaryText">Review Request: {selectedReq.id}</h3>
                            <button onClick={() => setSelectedReq(null)} className="text-secondaryText hover:text-primaryText"><X size={20} /></button>
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
                                        <p className="font-medium text-primaryText">₹{selectedReq.amount.toLocaleString('en-IN')}</p>
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
                                </div>
                            </div>

                            {/* Comment Box */}
                            {(selectedReq.status === 'Requested' || selectedReq.status === 'Pending' || selectedReq.status === 'Reviewing') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-primaryText mb-1 flex items-center">
                                        <MessageSquare size={14} className="mr-1" /> Add Comment
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

                        <div className="p-6 border-t border-borderContent bg-gray-50 rounded-b-xl flex justify-between space-x-3">
                            <button
                                onClick={() => setSelectedReq(null)}
                                className="px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-100 font-medium"
                            >
                                Close
                            </button>
                            {(selectedReq.status === 'Requested' || selectedReq.status === 'Pending' || selectedReq.status === 'Reviewing') && (
                                <div className="flex space-x-3">
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Approvals;

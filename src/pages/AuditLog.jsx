import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Download, FileText, Calendar } from 'lucide-react';

function AuditLog() {
    const { auditLogs } = useData();
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredLogs = auditLogs.filter(log => {
        const sMatch = log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.details.toLowerCase().includes(search.toLowerCase()) ||
            log.module.toLowerCase().includes(search.toLowerCase());

        const dMatch = dateFilter ? log.timestamp.startsWith(dateFilter) : true;
        return sMatch && dMatch;
    });

    const getActionBadge = (action) => {
        switch (action) {
            case 'Create': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">Create</span>;
            case 'Edit': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">Edit</span>;
            case 'Delete': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">Delete</span>;
            case 'Approve': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">Approve</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">{action}</span>;
        }
    };

    const handleExportCSV = () => {
        alert('Exporting to CSV is mocked in this prototype!');
    };

    const handleExportPDF = () => {
        alert('Exporting to PDF is mocked in this prototype!');
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primaryText">Audit Log</h2>
                    <p className="text-secondaryText text-sm mt-1">System activity and security trail</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleExportCSV} className="bg-white border border-borderContent text-primaryText px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition shadow-sm">
                        <Download size={16} className="mr-2" /> Export CSV
                    </button>
                    <button onClick={handleExportPDF} className="bg-white border border-borderContent text-primaryText px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition shadow-sm">
                        <FileText size={16} className="mr-2" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col h-full max-h-[calc(100vh-160px)]">
                {/* Toolbar */}
                <div className="p-4 border-b border-borderContent flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="relative w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-secondaryText" />
                        <input
                            type="text"
                            placeholder="Search user, module, details..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-borderContent rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar size={18} className="text-secondaryText" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                        />
                        {dateFilter && (
                            <button onClick={() => setDateFilter('')} className="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Clear Date</button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto flex-1 p-0 m-0 w-full" style={{ scrollbarWidth: 'thin' }}>
                    <table className="min-w-full text-left border-collapse w-full relative">
                        <thead className="bg-[#F3F4F6] text-primaryText sticky top-0 z-10 font-bold border-b border-borderContent">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Module</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider w-1/3">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText font-mono text-xs">{log.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primaryText">{log.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getActionBadge(log.action)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText font-medium">{log.module}</td>
                                    <td className="px-6 py-4 text-sm text-secondaryText">{log.details}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono text-xs">{log.ip}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-secondaryText italic bg-gray-50">
                                        No logs found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText rounded-b-xl flex justify-between items-center">
                    <span>Showing {filteredLogs.length} of {auditLogs.length} logs</span>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-borderContent bg-white text-gray-500 rounded hover:bg-gray-100 cursor-not-allowed opacity-50">Previous</button>
                        <button className="px-3 py-1 border border-borderContent bg-white text-gray-700 rounded hover:bg-gray-100">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuditLog;

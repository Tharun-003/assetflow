import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FileText, Download, TrendingUp, PieChart, Activity, ShoppingCart } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function Reports() {
    const { assets, procurements, auditLogs } = useData();
    const [reportType, setReportType] = useState('Asset');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Summary Metrics (mock calculations mimicking "this month")
    const totalSpend = useMemo(() => {
        return procurements.filter(p => ['Approved', 'Purchased', 'Delivered'].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);
    }, [procurements]);

    // Enhancing to accurate counts based on complete datasets
    const totalAssetsCount = assets.length;
    const totalProcurementsCount = procurements.length;

    const disposedAssets = useMemo(() => {
        return assets.filter(a => a.status === 'Disposed').length;
    }, [assets]);

    // Preview Data Selection
    const getPreviewData = () => {
        switch (reportType) {
            case 'Asset': return assets;
            case 'Procurement': return procurements;
            case 'Audit': return auditLogs;
            default: return [];
        }
    };

    const previewData = getPreviewData();

    // --- EXPORT FUNCTIONS ---
    const handleExportPDF = () => {
        if (previewData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const doc = new jsPDF();
        doc.text(`AssetFlow - ${reportType} Report`, 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableColumn = Object.keys(previewData[0]);
        const tableRows = [];

        previewData.forEach(row => {
            const rowData = Object.keys(row).map(key => String(row[key] || ""));
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [30, 58, 95] }, // Deep Blue theme color
        });

        doc.save(`AssetFlow_${reportType}_Report.pdf`);
    };

    const handleExportExcel = () => {
        if (previewData.length === 0) {
            alert("No data available to export.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(previewData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
        XLSX.writeFile(workbook, `AssetFlow_${reportType}_Report.xlsx`);
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primaryText">Reports & Analytics</h2>
                    <p className="text-secondaryText text-sm mt-1">Generate comprehensive system reports</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6 flex flex-col lg:flex-row items-center justify-between">
                    <div className="mb-4 lg:mb-0">
                        <span className="text-xs text-secondaryText font-medium uppercase tracking-wider block mb-1">Total Spend (YTD)</span>
                        <p className="text-3xl font-bold text-primaryText">₹{totalSpend.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-800 rounded-lg"><DollarSignIcon size={24} /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6 flex flex-col lg:flex-row items-center justify-between">
                    <div className="mb-4 lg:mb-0">
                        <span className="text-xs text-secondaryText font-medium uppercase tracking-wider block mb-1">Total Assets Owned</span>
                        <p className="text-3xl font-bold text-primaryText">{totalAssetsCount}</p>
                    </div>
                    <div className="p-3 bg-green-100 text-green-800 rounded-lg"><TrendingUp size={24} /></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-borderContent p-6 flex flex-col lg:flex-row items-center justify-between">
                    <div className="mb-4 lg:mb-0">
                        <span className="text-xs text-secondaryText font-medium uppercase tracking-wider block mb-1">Total Procurements</span>
                        <p className="text-3xl font-bold text-primaryText">{totalProcurementsCount}</p>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-800 rounded-lg"><ShoppingCart size={24} /></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col flex-1 h-full max-h-[calc(100vh-280px)]">
                {/* Report Generator Controls */}
                <div className="p-6 border-b border-borderContent bg-gray-50 flex flex-col md:flex-row justify-between items-center rounded-t-xl gap-4">
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
                        <div>
                            <label className="block text-xs font-semibold text-primaryText mb-1 tracking-wider uppercase">Report Type</label>
                            <select
                                value={reportType}
                                onChange={e => setReportType(e.target.value)}
                                className="w-full md:w-auto border border-borderContent rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                            >
                                <option value="Asset">Asset Report</option>
                                <option value="Procurement">Procurement Report</option>
                                <option value="Audit">Audit Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-primaryText mb-1 tracking-wider uppercase">Date Range</label>
                            <div className="flex items-center space-x-2">
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" />
                                <span className="text-gray-400">-</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 w-full md:w-auto mt-4 md:mt-0 items-end">
                        <button onClick={handleExportPDF} className="flex-1 md:flex-none bg-primary text-white border border-primary px-4 py-2 rounded-lg flex justify-center items-center hover:bg-blue-800 transition shadow-sm font-medium">
                            <FileText size={16} className="mr-2" /> Build PDF
                        </button>
                        <button onClick={handleExportExcel} className="flex-1 md:flex-none bg-accent text-primary px-4 py-2 rounded-lg flex justify-center items-center font-medium hover:bg-yellow-500 transition shadow-sm">
                            <Download size={16} className="mr-2" /> Excel Export
                        </button>
                    </div>
                </div>

                {/* Data Preview */}
                <div className="p-6 pb-2">
                    <h3 className="text-sm font-semibold text-primaryText mb-4 flex items-center">
                        <PieChart size={16} className="mr-2 text-secondaryText" /> Report Preview <span className="text-xs font-normal text-gray-400 ml-2">(Showing first 10 records)</span>
                    </h3>
                </div>
                <div className="overflow-x-auto pb-4 px-6 flex-1">
                    <table className="min-w-full text-left border-collapse w-full border border-gray-100 rounded-lg">
                        <thead className="bg-[#F3F4F6] text-primaryText text-xs uppercase tracking-wider font-bold">
                            <tr>
                                {Object.keys(previewData[0] || {}).slice(0, 6).map(key => (
                                    <th key={key} className="px-6 py-3">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {previewData.slice(0, 10).map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    {Object.keys(row).slice(0, 6).map(key => (
                                        <td key={key} className="px-6 py-3 text-sm text-secondaryText truncate max-w-[200px]" title={String(row[key])}>
                                            {String(row[key])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {previewData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-secondaryText italic">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

// Quick inline icon component to avoid missing import
function DollarSignIcon({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );
}

export default Reports;

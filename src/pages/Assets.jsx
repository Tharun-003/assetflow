import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Filter, Plus, Eye, Edit, Repeat, QrCode as QrCodeIcon, X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function Assets() {
    const { assets, addAsset } = useData();
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [qrModalData, setQrModalData] = useState(null);

    // New Asset State
    const [newAsset, setNewAsset] = useState({
        name: '', category: '', department: 'IT', purchaseDate: '', vendor: '', cost: '', serialNumber: '', description: '', status: 'Active'
    });

    const filteredAssets = assets.filter(a => {
        const sMatch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const dMatch = filterDept === 'All' || a.department === filterDept;
        return sMatch && dMatch;
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addAsset({ ...newAsset, cost: Number(newAsset.cost) || 0 });
        setIsAddOpen(false);
        setNewAsset({ name: '', category: '', department: 'IT', purchaseDate: '', vendor: '', cost: '', serialNumber: '', description: '', status: 'Active' });
    };

    const downloadQR = () => {
        const svg = document.getElementById(`qr-svg-${qrModalData.id}`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${qrModalData.id}-QR.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>;
            case 'In Repair': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">In Repair</span>;
            case 'Disposed': return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">Disposed</span>;
            default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-full relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primaryText">Asset Management</h2>
                <button onClick={() => setIsAddOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm">
                    <Plus size={16} className="mr-2" /> New Asset
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col h-full max-h-[calc(100vh-160px)]">
                {/* Table Toolbar */}
                <div className="p-4 border-b border-borderContent flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="relative w-64">
                        <Search size={18} className="absolute left-3 top-2.5 text-secondaryText" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-borderContent rounded-lg focus:outline-none focus:ring-1 focus:ring-accent text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-secondaryText" />
                        <select
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            className="border border-borderContent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
                        >
                            <option value="All">All Departments</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Management">Management</option>
                            <option value="Logistics">Logistics</option>
                            <option value="Facilities">Facilities</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto flex-1 p-0 m-0 w-full" style={{ scrollbarWidth: 'thin' }}>
                    <table className="min-w-full text-left border-collapse w-full relative">
                        <thead className="bg-[#F3F4F6] text-primaryText sticky top-0 z-10 font-bold border-b border-borderContent">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Asset ID</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Purchase Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Value</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{asset.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primaryText font-medium">{asset.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{asset.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(asset.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">{asset.purchaseDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondaryText">₹{asset.cost.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button className="text-blue-500 hover:text-blue-700" title="View"><Eye size={16} /></button>
                                            <button className="text-yellow-600 hover:text-yellow-800" title="Edit"><Edit size={16} /></button>
                                            <button className="text-purple-500 hover:text-purple-700" title="Transfer"><Repeat size={16} /></button>
                                            <button className="text-gray-600 hover:text-primary" title="Generate QR" onClick={() => setQrModalData(asset)}><QrCodeIcon size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-secondaryText italic bg-gray-50">
                                        No assets found. Try adjusting your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText rounded-b-xl flex justify-between items-center">
                    <span>Showing {filteredAssets.length} of {assets.length} assets</span>
                </div>
            </div>

            {/* Add Asset Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-sans">
                        <div className="flex justify-between items-center p-6 border-b border-borderContent">
                            <h3 className="text-xl font-bold text-primaryText">Add New Asset</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-secondaryText hover:text-primaryText"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Asset Name</label>
                                    <input required type="text" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Category</label>
                                    <input required type="text" value={newAsset.category} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Department</label>
                                    <select required value={newAsset.department} onChange={e => setNewAsset({ ...newAsset, department: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Management">Management</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Facilities">Facilities</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Status</label>
                                    <select required value={newAsset.status} onChange={e => setNewAsset({ ...newAsset, status: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm">
                                        <option value="Active">Active</option>
                                        <option value="In Repair">In Repair</option>
                                        <option value="Disposed">Disposed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Purchase Date</label>
                                    <input required type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Vendor</label>
                                    <input type="text" value={newAsset.vendor} onChange={e => setNewAsset({ ...newAsset, vendor: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Cost (₹)</label>
                                    <input required type="number" min="0" value={newAsset.cost} onChange={e => setNewAsset({ ...newAsset, cost: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primaryText mb-1">Serial Number</label>
                                    <input type="text" value={newAsset.serialNumber} onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-primaryText mb-1">Description</label>
                                <textarea rows="3" value={newAsset.description} onChange={e => setNewAsset({ ...newAsset, description: e.target.value })} className="w-full px-3 py-2 border border-borderContent rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm" />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-blue-800">Add Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {qrModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm font-sans flex flex-col items-center p-8">
                        <h3 className="text-xl font-bold text-primaryText mb-2">{qrModalData.name} QR Code</h3>
                        <p className="text-sm text-secondaryText mb-6">{qrModalData.id}</p>

                        {/* Real QR visual */}
                        <div className="mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center">
                            <QRCodeSVG id={`qr-svg-${qrModalData.id}`} value={qrModalData.id} size={180} level="H" fgColor="#1E3A5F" includeMargin={false} />
                        </div>

                        <div className="flex justify-between w-full space-x-3">
                            <button onClick={() => setQrModalData(null)} className="flex-1 px-4 py-2 border border-borderContent text-primaryText rounded-md shadow-sm hover:bg-gray-50 text-center">Close</button>
                            <button onClick={downloadQR} className="flex-1 px-4 py-2 bg-accent text-primary font-medium rounded-md shadow-sm hover:bg-yellow-500 text-center flex items-center justify-center"><Download size={16} className="mr-2" /> Download</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Assets;

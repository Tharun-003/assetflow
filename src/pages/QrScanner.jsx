import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { QrCode, ScanLine, Camera, Activity, FileText, XCircle, Upload } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';

function QrScanner() {
    const { assets, auditLogs } = useData();
    const [isScanning, setIsScanning] = useState(false);
    const [scannedAsset, setScannedAsset] = useState(null);
    const [history, setHistory] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const handleScan = (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;

            const found = assets.find(a => a.id === result);
            if (found) {
                setScannedAsset(found);
                setErrorMsg('');
                setIsScanning(false);

                // Mock history lookup based on the scanned ID
                const assetHistory = auditLogs.filter(log => log.module === 'Asset' && log.details.includes(found.id)).slice(0, 3);
                setHistory(assetHistory.length > 0 ? assetHistory : [{ id: 'fake1', timestamp: found.purchaseDate, action: 'Create', details: 'Added to inventory database', user: 'System Admin' }]);
            } else {
                setErrorMsg(`Scanned code "${result}" not found in institutional database.`);
                setScannedAsset(null);
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    handleScan([{ rawValue: code.data }]);
                } else {
                    setErrorMsg("No QR code found in the uploaded image.");
                    setScannedAsset(null);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleError = (error) => {
        console.warn('QR Reader Warning/Error:', error);
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h2 className="text-2xl font-bold text-primaryText">QR Code Scanner</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-borderContent">
                {/* Camera Scanner Container */}
                <div className="relative bg-gray-900 h-64 sm:h-80 md:h-[400px] w-full rounded-t-xl overflow-hidden flex flex-col items-center justify-center">

                    {isScanning ? (
                        <div className="w-full h-full relative">
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                components={{
                                    audio: false,
                                    finder: false,
                                }}
                                styles={{
                                    container: { width: '100%', height: '100%' }
                                }}
                            />

                            {/* Overlay styling for the scanner */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]">
                                <div className="w-56 h-56 border-2 border-white/20 relative">
                                    <div className="w-10 h-10 border-t-4 border-l-4 border-accent absolute -top-1 -left-1"></div>
                                    <div className="w-10 h-10 border-t-4 border-r-4 border-accent absolute -top-1 -right-1"></div>
                                    <div className="w-10 h-10 border-b-4 border-l-4 border-accent absolute -bottom-1 -left-1"></div>
                                    <div className="w-10 h-10 border-b-4 border-r-4 border-accent absolute -bottom-1 -right-1"></div>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="px-6 py-2 bg-red-600/80 text-white rounded-full font-medium hover:bg-red-700 transition flex items-center backdrop-blur-sm"
                                >
                                    Cancel Scan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center z-20 p-8">
                            <Camera size={56} className="mx-auto mb-4 text-gray-400 opacity-60" />
                            <p className="text-white font-medium mb-6 text-lg tracking-wide">
                                Institutional QR Scanner
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={() => setIsScanning(true)}
                                    className="px-8 py-3 bg-primary text-white rounded-lg font-semibold tracking-wide hover:bg-blue-800 transition shadow-lg flex items-center"
                                >
                                    <ScanLine size={20} className="mr-3" /> Enable Live Camera
                                </button>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold tracking-wide hover:bg-gray-700 transition shadow-lg flex items-center border border-gray-700 hover:border-gray-500"
                                >
                                    <Upload size={20} className="mr-3" /> Upload QR Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scan Results Result Card */}
                <div className="p-6">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start shadow-sm">
                            <XCircle className="text-red-500 mr-3 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Scan Failed</h4>
                                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    {!scannedAsset ? (
                        <div className="text-center py-8 text-secondaryText">
                            <QrCode size={32} className="mx-auto text-gray-300 mb-3" />
                            <p>No asset scanned yet.</p>
                            <p className="text-sm">Click the scan button above to simulate scanning an asset.</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-primaryText flex items-center">
                                        {scannedAsset.name}
                                        <span className={`ml-3 px-2 py-0.5 text-xs rounded-full border ${scannedAsset.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                                            scannedAsset.status === 'In Repair' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-red-100 text-red-800 border-red-200'
                                            }`}>
                                            {scannedAsset.status}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-secondaryText font-mono mt-1">{scannedAsset.id} • {scannedAsset.category}</p>
                                </div>
                                <div className="bg-blue-50 text-primary p-3 rounded-lg border border-blue-100 shadow-sm text-center">
                                    <p className="text-xs font-semibold uppercase font-mono tracking-wider">Value</p>
                                    <p className="text-lg font-bold">₹{scannedAsset.cost.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg border border-borderContent">
                                    <span className="text-xs text-secondaryText">Department</span>
                                    <p className="font-medium text-primaryText text-sm">{scannedAsset.department}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-borderContent">
                                    <span className="text-xs text-secondaryText">Purchase Date</span>
                                    <p className="font-medium text-primaryText text-sm">{scannedAsset.purchaseDate}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-borderContent">
                                    <span className="text-xs text-secondaryText">Vendor</span>
                                    <p className="font-medium text-primaryText text-sm">{scannedAsset.vendor || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-borderContent">
                                    <span className="text-xs text-secondaryText">Serial Number</span>
                                    <p className="font-medium text-primaryText text-sm font-mono">{scannedAsset.serialNumber || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-borderContent col-span-2">
                                    <span className="text-xs text-secondaryText">Description</span>
                                    <p className="font-medium text-primaryText text-sm">{scannedAsset.description || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Asset History Timeline */}
                            <div className="mt-8 border-t border-borderContent pt-6">
                                <h4 className="text-sm font-bold text-primaryText mb-4 flex items-center uppercase tracking-wider">
                                    <Activity size={16} className="mr-2 text-secondaryText" /> Activity History
                                </h4>
                                <div className="space-y-4 relative pl-3 before:content-[''] before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-200 before:z-0">
                                    {history.map((log, idx) => (
                                        <div key={idx} className="relative z-10 pl-6">
                                            <div className="absolute left-[-4px] top-1 w-3 h-3 rounded-full bg-white border-2 border-primary"></div>
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">{log.timestamp}</p>
                                            <p className="text-sm font-semibold text-primaryText">{log.action}</p>
                                            <p className="text-sm text-secondaryText">{log.details}</p>
                                            <p className="text-xs text-gray-400 mt-1">by {log.user}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QrScanner;

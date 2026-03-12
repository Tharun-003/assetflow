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

    const calculateResaleValue = (asset) => {
        if (!asset || !asset.purchaseDate || !asset.cost) return null;
        
        const purchase = new Date(asset.purchaseDate);
        const now = new Date();
        const ageInYears = Math.max(0, (now - purchase) / (1000 * 60 * 60 * 24 * 365.25));
        
        // Base depreciation rate & Lifespan per category
        let rate = 0.20; // 20% default
        let baseLifespanYears = 5; 
        let warrantyYears = 1;
        
        if (asset.category?.includes('IT') || asset.category?.includes('Computer')) {
            rate = 0.33; 
            baseLifespanYears = 4;
            warrantyYears = 3;
        }
        if (asset.category?.includes('Furniture')) {
            rate = 0.10; 
            baseLifespanYears = 10;
            warrantyYears = 5;
        }
        if (asset.category?.includes('Vehicles') || asset.category?.includes('Transport') || asset.category?.includes('Vehicle')) {
            rate = 0.15; 
            baseLifespanYears = 8;
            warrantyYears = 3;
        }

        // Calculate key dates
        const warrantyEnd = new Date(purchase);
        warrantyEnd.setFullYear(warrantyEnd.getFullYear() + warrantyYears);
        
        const endOfLife = new Date(purchase);
        endOfLife.setFullYear(endOfLife.getFullYear() + baseLifespanYears);
        
        // Optimal resale is typically 6 months before warranty expires (to retain maximum secondary market value)
        const optimalResale = new Date(warrantyEnd);
        optimalResale.setMonth(optimalResale.getMonth() - 6);

        // Condition multiplier based on usage/status
        let conditionMult = 1.0;
        let conditionText = 'Fair / Standard';
        if (asset.status === 'Active') { conditionMult = 1.1; conditionText = 'Good (Active)'; }
        if (asset.status === 'In Repair') { conditionMult = 0.7; conditionText = 'Poor (In Repair)'; }
        if (asset.status === 'Disposed') { conditionMult = 0.1; conditionText = 'Scrap (Disposed)'; }
        
        // Value = Cost * (1 - rate)^age * condition
        const depreciated = asset.cost * Math.pow(1 - rate, ageInYears) * conditionMult;
        
        // Salvage value is 5% minimum
        const salvage = asset.cost * 0.05;
        const currentVal = Math.round(Math.max(depreciated, salvage));
        
        const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];

        // Determine timeline status
        const isWarrantyActive = now < warrantyEnd;
        const isPastOptimal = now > optimalResale;
        const isEOL = now >= endOfLife;

        // Actionable Recommendation Logic
        let recommendation = 'Keep';
        let reasoning = `Asset is in good condition and continues to provide value.`;
        let recColor = 'text-green-700 bg-green-50 border-green-200';
        let iconColor = 'text-green-500';
        
        if (asset.status === 'Disposed') {
            recommendation = 'Disposed';
            reasoning = 'Asset has already been retired/disposed.';
            recColor = 'text-gray-700 bg-gray-100 border-gray-300';
            iconColor = 'text-gray-500';
        } else if (isEOL || currentVal <= salvage) {
            recommendation = 'Dispose / Recycle';
            reasoning = `Asset has reached End-Of-Life or its value has depreciated to scrap levels (₹${currentVal.toLocaleString('en-IN')}). Maintenance costs likely exceed remaining value.`;
            recColor = 'text-red-700 bg-red-50 border-red-200';
            iconColor = 'text-red-500';
        } else if (isPastOptimal && isWarrantyActive) {
            recommendation = 'Resell Immediately';
            reasoning = `Optimal resale window has passed, but warranty is still active. Sell now to recover maximum remaining value (₹${currentVal.toLocaleString('en-IN')}) before warranty expires.`;
            recColor = 'text-amber-700 bg-amber-50 border-amber-200';
            iconColor = 'text-amber-500';
        } else if (!isPastOptimal && ageInYears > 0.5 && conditionMult >= 1.0) {
            recommendation = 'Hold / Monitor';
            reasoning = `Approaching optimal resale window (${formatDate(optimalResale)}). Monitor market conditions to prepare for liquidation.`;
            recColor = 'text-blue-700 bg-blue-50 border-blue-200';
            iconColor = 'text-blue-500';
        } else if (asset.status === 'In Repair' && currentVal < (asset.cost * 0.2)) {
            recommendation = 'Dispose (Cost Inefficient)';
            reasoning = `Asset is in repair but holds less than 20% of original value. It may be more cost-effective to replace rather than fix.`;
            recColor = 'text-red-700 bg-red-50 border-red-200';
            iconColor = 'text-red-500';
        }

        return {
            current: currentVal,
            age: ageInYears.toFixed(1),
            rate: Math.round(rate * 100),
            loss: Math.round(asset.cost - currentVal),
            warrantyDate: formatDate(warrantyEnd),
            isWarrantyActive,
            eolDate: formatDate(endOfLife),
            isEOL,
            optimalResaleDate: formatDate(optimalResale),
            isPastOptimal,
            conditionText,
            recommendation,
            reasoning,
            recColor,
            iconColor
        };
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
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b border-borderContent pb-6">
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
                                
                                {(() => {
                                    const metrics = calculateResaleValue(scannedAsset);
                                    return (
                                        <div className="bg-white p-5 rounded-2xl border border-borderContent shadow-md mt-6 sm:mt-0 min-w-[280px] self-stretch flex flex-col justify-between hover:border-blue-300 hover:shadow-lg transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3 flex items-center">
                                                    <Activity size={12} className="mr-1.5" /> Est. Market Value
                                                </p>
                                                <div className="flex items-baseline mb-4">
                                                    <span className="text-4xl font-black text-gray-900 tracking-tight">₹{metrics.current.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm">
                                                    <span className="text-gray-500 font-medium">Original Cost</span>
                                                    <span className="font-bold text-gray-700">₹{scannedAsset.cost.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-lg text-sm border border-red-100">
                                                    <span className="text-red-600 font-medium drop-shadow-sm flex items-center">
                                                        Value Lost <span className="text-[10px] ml-1.5 bg-red-100 px-1.5 py-0.5 rounded text-red-700">-{metrics.age}y</span>
                                                    </span>
                                                    <span className="font-bold text-red-700 tracking-wide">-₹{metrics.loss.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                
                                {(() => {
                                    const metrics = calculateResaleValue(scannedAsset);
                                    if (!metrics) return null;
                                    return (
                                        <>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-borderContent">
                                                <span className="text-xs text-secondaryText">Condition / Status</span>
                                                <p className="font-medium text-primaryText text-sm">{metrics.conditionText}</p>
                                            </div>
                                            <div className={`p-3 rounded-lg border ${metrics.isWarrantyActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <span className={`text-xs ${metrics.isWarrantyActive ? 'text-green-700' : 'text-red-700'}`}>Warranty Status</span>
                                                <p className={`font-bold text-sm ${metrics.isWarrantyActive ? 'text-green-800' : 'text-red-800'}`}>
                                                    {metrics.isWarrantyActive ? `Active until ${metrics.warrantyDate}` : `Expired on ${metrics.warrantyDate}`}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-lg border ${metrics.isPastOptimal ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                                                <span className={`text-xs ${metrics.isPastOptimal ? 'text-amber-700' : 'text-blue-700'}`}>Optimal Resale Window</span>
                                                <p className={`font-bold text-sm ${metrics.isPastOptimal ? 'text-amber-800' : 'text-blue-800'}`}>
                                                    {metrics.isPastOptimal ? `Passed (${metrics.optimalResaleDate})` : `Before ${metrics.optimalResaleDate}`}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-lg border ${metrics.isEOL ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-borderContent'}`}>
                                                <span className="text-xs text-secondaryText">Est. End of Life</span>
                                                <p className={`font-bold text-sm ${metrics.isEOL ? 'text-gray-500' : 'text-primaryText'}`}>
                                                    {metrics.isEOL ? `Reached (${metrics.eolDate})` : metrics.eolDate}
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                                
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

                            {/* AI Recommendation Banner */}
                            {(() => {
                                const metrics = calculateResaleValue(scannedAsset);
                                if (!metrics) return null;
                                return (
                                    <div className={`mt-2 mb-6 p-5 rounded-xl border ${metrics.recColor} flex flex-col sm:flex-row items-start sm:items-center shadow-sm`}>
                                        <div className={`p-3 bg-white rounded-full shadow-sm mr-4 mb-3 sm:mb-0 border ${metrics.recColor}`}>
                                            <Activity size={24} className={metrics.iconColor} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">AI Recommendation</p>
                                            <h4 className="text-lg font-bold mb-1">{metrics.recommendation}</h4>
                                            <p className="text-sm opacity-90">{metrics.reasoning}</p>
                                        </div>
                                    </div>
                                );
                            })()}

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

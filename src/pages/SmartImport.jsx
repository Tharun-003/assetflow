import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    FileUp, UploadCloud, BrainCircuit, CheckCircle2, CircleDashed, FileBarChart,
    AlertTriangle, Bot, FileSpreadsheet, Download, Send, CheckSquare, Trash2,
    IndianRupee, Copy, RefreshCw, Plus, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import * as XLSX from 'xlsx';

const DEPARTMENTS = [
    "Mech", "CSE", "Civil", "ECE", "COE", "IT", "AI&DS", "AIML", "CSBS", "Cybersecurity", "BME", "EEE", "CDC",
    "Academic", "IT Infrastructure", "Library", "Hostel", "Food Facility", "Transport", "Medical",
    "Sports", "Event Infrastructure", "Campus Utilities", "Computer Science",
    "Mechanical Engineering", "Administration", "IT Support"
];

const EDU_DEPARTMENTS = [
    "Mech", "CSE", "Civil", "ECE", "COE", "IT", "AI&DS", "AIML", "CSBS", "Cybersecurity", "BME", "EEE", "CDC"
];

const ITEM_CATEGORIES = ["IT Equipment", "Furniture", "Peripherals", "Other"];

const CustomSelect = ({ value, onChange, options, className = "", triggerClassName = "bg-white border text-gray-700 font-medium border-gray-300 rounded-xl p-3" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            <div
                className={`flex items-center justify-between w-full cursor-pointer hover:border-blue-500 transition-colors select-none ${triggerClassName}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm truncate mr-2">{value || 'Select option'}</span>
                {isOpen ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />}
            </div>
            {isOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            className={`px-3 py-2 text-sm cursor-pointer select-none transition-colors ${value === opt ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Dynamic Extraction Generator
const generateMockExtraction = (dept, fileName = "") => {
    const fn = fileName.toLowerCase();
    let items = [];

    if (fn.includes('laptop') || fn.includes('computer') || fn.includes('macbook') || fn.includes('pc')) {
        items = [
            { id: '1', name: 'Dell Latitude 7420 Laptop', cat: 'IT Equipment', qty: 5, unitCost: 85000, conf: 98, priority: 'High' },
            { id: '2', name: 'MacBook Pro 14" M3', cat: 'IT Equipment', qty: 2, unitCost: 185000, conf: 99, priority: 'High' },
            { id: '3', name: 'Lenovo ThinkPad T14', cat: 'IT Equipment', qty: 8, unitCost: 95000, conf: 95, priority: 'Medium' },
            { id: '4', name: 'Logitech Wireless Mouse', cat: 'Peripherals', qty: 15, unitCost: 1500, conf: 92, priority: 'Low' },
        ];
    } else if (fn.includes('furniture') || fn.includes('chair') || fn.includes('desk') || fn.includes('table')) {
        items = [
            { id: '1', name: 'Ergonomic Office Chair', cat: 'Furniture', qty: 12, unitCost: 12000, conf: 95, priority: 'Medium' },
            { id: '2', name: 'Standing Desk Converter', cat: 'Furniture', qty: 4, unitCost: 15000, conf: 98, priority: 'Low' },
            { id: '3', name: 'Conference Room Table', cat: 'Furniture', qty: 1, unitCost: 45000, conf: 92, priority: 'High' },
            { id: '4', name: 'Padded Reception Chairs', cat: 'Furniture', qty: 6, unitCost: 8500, conf: 89, priority: 'Medium' },
        ];
    } else if (fn.includes('printer') || fn.includes('scanner') || fn.includes('copier')) {
        items = [
            { id: '1', name: 'Epson POS Receipt Printer', cat: 'IT Equipment', qty: 2, unitCost: 15000, conf: 92, priority: 'High' },
            { id: '2', name: 'HP LaserJet Enterprise', cat: 'IT Equipment', qty: 1, unitCost: 65000, conf: 96, priority: 'Medium' },
            { id: '3', name: 'Brother Document Scanner', cat: 'IT Equipment', qty: 3, unitCost: 28000, conf: 94, priority: 'Low' },
            { id: '4', name: 'Color Toner Cartridge Set', cat: 'Other', qty: 5, unitCost: 12000, conf: 85, priority: 'Low' },
        ];
    } else if (fn.includes('network') || fn.includes('router') || fn.includes('switch') || fn.includes('wifi')) {
        items = [
            { id: '1', name: 'Cisco 48-Port Switch', cat: 'IT Equipment', qty: 2, unitCost: 120000, conf: 98, priority: 'High' },
            { id: '2', name: 'Ubiquiti Wi-Fi 6 Access Point', cat: 'IT Equipment', qty: 10, unitCost: 15000, conf: 95, priority: 'Medium' },
            { id: '3', name: 'Cat6 Ethernet Spool (1000ft)', cat: 'Other', qty: 5, unitCost: 12000, conf: 85, priority: 'Low' },
            { id: '4', name: 'Server Rack Cabinet (42U)', cat: 'Furniture', qty: 1, unitCost: 55000, conf: 91, priority: 'Medium' }
        ];
    } else {
        // Generic Fallback
        items = [
            { id: '1', name: 'Dell Latitude 7420 Laptop', cat: 'IT Equipment', qty: 5, unitCost: 85000, conf: 98, priority: 'High' },
            { id: '2', name: 'Ergonomic Office Chair', cat: 'Furniture', qty: 12, unitCost: 12000, conf: 95, priority: 'Medium' },
            { id: '3', name: 'Logitech MX Master 3S', cat: 'Peripherals', qty: 5, unitCost: 8500, conf: 89, priority: 'Low' },
            { id: '4', name: 'Unclear Item (Part #XZ99)', cat: 'Other', qty: 1, unitCost: 45000, conf: 45, priority: 'Medium' },
            { id: '5', name: 'Epson POS Receipt Printer', cat: 'IT Equipment', qty: 2, unitCost: 15000, conf: 92, priority: 'High' },
        ];
    }
    return items.map(item => ({ ...item, dept, selected: true }));
};

function SmartImport() {
    const { user } = useAuth();
    const { addBulkAuditLogs, addBulkProcurements } = useData();
    const navigate = useNavigate();
    const [department, setDepartment] = useState('Academic Approvals');
    const [eduDepartment, setEduDepartment] = useState('CSE');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Flow states: 'idle' -> 'processing' -> 'review'
    const [flowState, setFlowState] = useState('idle');
    const [processingStep, setProcessingStep] = useState(0);
    const [extractedData, setExtractedData] = useState([]);

    const handleRowEdit = (id, field, value) => {
        setExtractedData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const toggleRowSelect = (id) => {
        setExtractedData(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const toggleSelectAll = () => {
        const allSelected = extractedData.every(item => item.selected);
        setExtractedData(prev => prev.map(item => ({ ...item, selected: !allSelected })));
    };

    const removeSelected = () => {
        setExtractedData(prev => prev.filter(item => !item.selected));
    };

    const addNewRow = () => {
        setExtractedData(prev => [...prev, {
            id: `manual-${Date.now()}`,
            name: '',
            cat: 'IT Equipment',
            qty: 1,
            unitCost: 0,
            conf: 100,
            priority: 'Medium',
            dept: department === 'Academic Approvals' ? eduDepartment : department,
            selected: true
        }]);
    };

    const getConfidenceColor = (score) => {
        if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
        if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const handleSendToAudit = () => {
        const selected = extractedData.filter(i => i.selected);
        if (selected.length === 0) return alert("Select items to send");

        // Push as verified assets to Audit Log
        addBulkAuditLogs(selected.map(item => ({
            action: 'Smart Import',
            module: 'Asset Review',
            details: `Imported ${item.qty}x ${item.name} from ${file?.name || 'Manual Entry'} (Conf: ${item.conf}%)`
        })));
        navigate('/audit');
    };

    const handleSendToApprovals = () => {
        const selected = extractedData.filter(i => i.selected);
        if (selected.length === 0) return alert("Select items to send");

        // Push directly to Approvals queue
        const procurements = selected.map(item => ({
            item: item.name,
            category: department, // Approvals groups tabs by this high-level 'category' state
            department: item.dept,
            requestedBy: user?.name || 'System Import',
            amount: item.qty * item.unitCost,
            status: 'Requested',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            signals: []
        }));

        addBulkProcurements(procurements);
        navigate('/approvals');
    };

    // Calculate dynamic values for Smart Alerts
    const totalSelectedValue = extractedData.filter(i => i.selected).reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
    const mockBudget = 350000;
    const budgetExceeded = totalSelectedValue > mockBudget;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) setFile(uploadedFile);
    };

    const triggerAI = () => {
        if (!file) return alert("Please select a file first.");
        setFlowState('processing');
        setProcessingStep(0);

        // Simulate AI sequence steps for UI feedback while setting up the reader
        const sequence = [
            { step: 1, delay: 500 },  // Uploading
            { step: 2, delay: 1500 }, // Reading Structure
            { step: 3, delay: 2500 }, // Extracting Details
            { step: 4, delay: 3500 }, // Validating
        ];

        sequence.forEach(({ step, delay }) => {
            setTimeout(() => setProcessingStep(step), delay);
        });

        // Actual File Processing after a slight delay to let "AI UI" finish playing
        setTimeout(() => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    if (workbook.SheetNames.length === 0) {
                        throw new Error("No sheets found in the file.");
                    }

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                    if (jsonData.length === 0) {
                        alert("The uploaded Excel file appears to be empty.");
                        setFlowState('idle');
                        return;
                    }

                    // Map Excel columns to our internal state structure
                    const mappedData = jsonData.map((row, index) => {
                        // Attempt to find fields regardless of exact casing/spacing
                        const getField = (keys) => {
                            const exactKey = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
                            return exactKey ? row[exactKey] : null;
                        };

                        const extractedName = getField(['item name', 'item', 'asset name', 'product', 'description', 'name']) || `Extracted Item ${index + 1}`;
                        
                        let extractedAmount = getField(['unit price', 'unit price (₹)', 'price', 'cost', 'amount', 'unit cost']);
                        extractedAmount = typeof extractedAmount === 'string' ? parseFloat(extractedAmount.replace(/[^0-9.-]+/g,"")) : Number(extractedAmount);
                        extractedAmount = isNaN(extractedAmount) ? 0 : extractedAmount;

                        let extractedQty = getField(['qty', 'quantity', 'count']);
                        extractedQty = typeof extractedQty === 'string' ? parseInt(extractedQty.replace(/[^0-9-]+/g,"")) : Number(extractedQty);
                        extractedQty = isNaN(extractedQty) ? 1 : extractedQty;

                        const extractedDept = getField(['department', 'dept', 'requesting department']) || (department === 'Academic Approvals' ? eduDepartment : department);

                        return {
                            id: `ai-extracted-${Date.now()}-${index}`,
                            name: String(extractedName).trim(),
                            cat: 'IT Equipment', // Default fallback
                            qty: extractedQty || 1,
                            unitCost: extractedAmount || 0,
                            conf: Math.floor(Math.random() * (99 - 85 + 1)) + 85, // Fake high confidence since we exact matched
                            priority: 'Medium',
                            dept: extractedDept,
                            selected: true
                        };
                    });

                    setExtractedData(mappedData);
                    setProcessingStep(5);
                    setFlowState('review');

                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                    alert("Failed to read the Excel file. Please ensure it is a valid .xlsx format.");
                    setFlowState('idle');
                }
            };

            reader.onerror = () => {
                alert("Failed to read the file.");
                setFlowState('idle');
            };

            reader.readAsArrayBuffer(file);
        }, 4000); // Wait 4 seconds for "processing" UI to finish
    };

    const renderUploadZone = () => (
        <div className="max-w-4xl mx-auto mt-12 space-y-8 animate-[slideUp_0.3s_ease-out_forwards]">
            <div className="text-center space-y-4 mb-8">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                    <Bot size={40} />
                </div>
                <h1 className="text-4xl font-extrabold text-primaryText tracking-tight">AI Requisition Importer</h1>
                <p className="text-secondaryText text-lg max-w-2xl mx-auto">
                    Upload unstructured PDFs or Excel sheets. Our vision model will automatically extract line items, categorize them, and flag inventory conflicts.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-borderContent">
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Requesting Category</label>
                        <CustomSelect
                            value={department}
                            onChange={(val) => setDepartment(val)}
                            options={['Academic Approvals', 'IT & Technology', 'Library Approvals', 'Hostel Approvals', 'Food & Kitchen', 'Transport & Vehicles', 'Medical Approvals', 'Sports Approvals', 'Event & AV Equipment', 'Campus Infrastructure']}
                        />
                    </div>
                    {department === 'Academic Approvals' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Educational Dept</label>
                            <CustomSelect
                                value={eduDepartment}
                                onChange={(val) => setEduDepartment(val)}
                                options={EDU_DEPARTMENTS}
                            />
                        </div>
                    )}
                    <div className={department === 'Academic Approvals' ? 'col-span-2 md:col-span-1' : ''}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Uploaded By</label>
                        <input
                            type="text"
                            disabled
                            value={`${user?.name || 'Admin'} (${new Date().toLocaleDateString()})`}
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.xlsx,.csv" className="hidden" />
                    {file ? (
                        <>
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-green-200 text-green-600">
                                <FileSpreadsheet size={40} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{file.name}</h3>
                            <p className="text-sm font-medium text-green-700">Ready for extraction</p>
                        </>
                    ) : (
                        <>
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-blue-500 border border-gray-100">
                                <UploadCloud size={40} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">Select Requisition File</h3>
                            <p className="text-gray-500 mb-4">Drag and drop or click to browse</p>
                            <div className="flex space-x-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">.PDF</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-1 rounded">.XLSX</span>
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">.CSV</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={() => {
                            setExtractedData([]);
                            setFlowState('review');
                        }}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-xl font-bold flex items-center shadow-sm transition-all cursor-pointer"
                    >
                        Manual Entry Option
                    </button>
                    <button
                        onClick={triggerAI}
                        disabled={!file}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold flex items-center shadow-md transition-all cursor-pointer"
                    >
                        <BrainCircuit size={20} className="mr-2" /> Start AI Extraction
                    </button>
                </div>
            </div>
        </div>
    );

    const steps = [
        "File uploaded & encrypted",
        "Reading document structure & tables",
        "Extracting line items & specifications",
        "Validating catalog & calculating costs"
    ];

    const renderProcessingOverlay = () => (
        <div className="max-w-xl mx-auto mt-24 bg-white p-10 rounded-2xl shadow-lg border border-borderContent">
            <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin"></div>
                    <div className="w-20 h-20 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                    <Bot size={32} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI Engine Working</h2>
                <p className="text-gray-500 text-sm mt-2">Extracting tabular data from {file?.name}</p>
            </div>

            <div className="space-y-4">
                {steps.map((text, idx) => {
                    const isDone = processingStep > idx;
                    const isActive = processingStep === idx;
                    const isPending = processingStep < idx;

                    return (
                        <div key={idx} className={`flex items-center p-3 rounded-lg transition-colors duration-500 ${isActive ? 'bg-blue-50 border border-blue-100' : isDone ? 'bg-green-50/50' : 'opacity-40'}`}>
                            {isDone ? (
                                <CheckCircle2 size={24} className="text-green-500 mr-4 shrink-0 transition-transform hover:scale-110" />
                            ) : isActive ? (
                                <CircleDashed size={24} className="text-blue-500 mr-4 shrink-0 animate-spin" />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 shrink-0" />
                            )}
                            <span className={`font-medium ${isActive ? 'text-blue-800' : isDone ? 'text-gray-700' : 'text-gray-500'}`}>{text}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-[2000ms] ease-out" style={{ width: `${(processingStep / 4) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );

    const renderReviewBoard = () => (
        <div className="h-full flex flex-col pt-2 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        {file ? <Bot className="text-blue-600 mr-2" size={28} /> : <FileSpreadsheet className="text-blue-600 mr-2" size={28} />}
                        {file ? 'AI Extracted Requisition' : 'Manual Requisition Entry'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {file ? <>Successfully extracted {extractedData.length} items from <strong>{file.name}</strong>.</> : "Enter requisition line items manually into the grid below."}
                    </p>
                </div>
            </div>

            <div className="flex-1 flex space-x-6 min-h-0 pl-2">
                {/* Left Panel: Grid Layout */}
                <div className="flex-1 bg-white border border-borderContent rounded-xl shadow-sm flex flex-col relative">
                    <div className="overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-3 text-center w-10">
                                        <input
                                            type="checkbox"
                                            checked={extractedData.length > 0 && extractedData.every(i => i.selected)}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                    </th>
                                    <th className="p-3 whitespace-nowrap">Item Name (Editable)</th>
                                    <th className="p-3 text-center w-24">QTY</th>
                                    <th className="p-3 text-right w-32">Unit Price (₹)</th>
                                    <th className="p-3 text-right bg-blue-50/50 w-32">Total (₹)</th>
                                    <th className="p-3 w-40">Category</th>
                                    <th className="p-3 w-40">Department</th>
                                    <th className="p-3 text-center">AI Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {extractedData.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium italic">No items available. You may have deleted them all.</td></tr>
                                ) : extractedData.map(item => (
                                    <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors ${!item.selected ? 'opacity-50 bg-gray-50' : ''}`}>
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={item.selected}
                                                onChange={() => toggleRowSelect(item.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleRowEdit(item.id, 'name', e.target.value)}
                                                placeholder="Enter Item Name"
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-semibold text-gray-800 transition-colors py-1"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.qty === 0 ? '' : item.qty}
                                                onChange={(e) => handleRowEdit(item.id, 'qty', e.target.value === '' ? 0 : Number(e.target.value))}
                                                className="w-16 mx-auto block text-center bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.unitCost === 0 ? '' : item.unitCost}
                                                onChange={(e) => handleRowEdit(item.id, 'unitCost', e.target.value === '' ? 0 : Number(e.target.value))}
                                                className="w-full text-right bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </td>
                                        <td className="p-3 text-right bg-blue-50/30 font-bold text-gray-900 text-sm">
                                            ₹{(item.qty * item.unitCost).toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-3">
                                            <CustomSelect
                                                value={item.cat}
                                                onChange={(val) => handleRowEdit(item.id, 'cat', val)}
                                                options={ITEM_CATEGORIES}
                                                triggerClassName="w-full bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer p-0"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <CustomSelect
                                                value={item.dept}
                                                onChange={(val) => handleRowEdit(item.id, 'dept', val)}
                                                options={DEPARTMENTS}
                                                triggerClassName="w-full bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer p-0"
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border flex items-center justify-center w-max mx-auto ${getConfidenceColor(item.conf)}`}>
                                                {item.conf}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="bg-white border-t border-borderContent p-4 mt-6 rounded-t-xl shrink-0 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex space-x-3">
                    <button onClick={addNewRow} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-sm rounded-lg flex items-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <Plus size={16} className="mr-2" /> Add Row
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg flex items-center hover:bg-gray-200 transition-colors cursor-pointer">
                        <Download size={16} className="mr-2" /> Export XLS
                    </button>
                    <button onClick={removeSelected} disabled={!extractedData.some(i => i.selected)} className="px-4 py-2 border border-red-200 text-red-600 font-semibold text-sm rounded-lg flex items-center hover:bg-red-50 disabled:opacity-50 transition-colors">
                        <Trash2 size={16} className="mr-2" /> Remove Selected
                    </button>
                    <button onClick={() => setFlowState('idle')} className="px-4 py-2 border border-blue-200 text-blue-600 font-semibold text-sm rounded-lg flex items-center hover:bg-blue-50 transition-colors">
                        Start Over
                    </button>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleSendToApprovals} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                        <Send size={16} className="mr-2" /> Submit to Approvals
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 text-gray-900 rounded-xl shadow-sm border border-borderContent">
            <div className="h-16 border-b border-borderContent flex items-center px-6 shrink-0 bg-white z-10 justify-between">
                <div className="flex items-center">
                    <FileUp className="text-blue-600 mr-3" size={24} />
                    <h2 className="text-xl font-bold tracking-tight text-primaryText">Smart Requisition Import</h2>
                </div>
                {flowState === 'review' && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 flex items-center">
                        <CheckCircle2 size={14} className="mr-1" /> Active Session
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-visible p-6 relative">
                {flowState === 'idle' && renderUploadZone()}
                {flowState === 'processing' && renderProcessingOverlay()}
                {flowState === 'review' && renderReviewBoard()}
            </div>
        </div>
    );
}

export default SmartImport;

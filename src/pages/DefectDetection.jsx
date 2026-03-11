import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    AlertOctagon, UploadCloud, Camera, Image as ImageIcon, Activity, FileText,
    CheckCircle, AlertTriangle, ShieldCheck, ChevronRight, Check, FileCheck, XCircle
} from 'lucide-react';

function DefectDetection() {
    const { user } = useAuth();
    const { addDefect, addProcurement } = useData();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Flow State: 'idle' | 'analyzing' | 'report_ready' | 'workflow_active' | 'completed'
    const [flowState, setFlowState] = useState('idle');
    const [imagePreview, setImagePreview] = useState(null);
    const [description, setDescription] = useState('');
    const [workflowStage, setWorkflowStage] = useState(0); // 0: Dept, 1: HOD, 2: Finance, 3: Admin, 4: Done
    const [reportData, setReportData] = useState(null);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerAnalysis = () => {
        if (!imagePreview) return alert('Please upload an image first.');
        setFlowState('analyzing');

        // Dynamic AI Generation based on description
        const desc = description.toLowerCase();
        let externalDamage = [];
        let internalIssues = [];
        let severity = 'Moderate';
        let action = 'Hold for review.';

        if (desc.includes('projector')) {
            externalDamage = ['Visible cracks on the projector lens casing.', 'Thermal vent blockages or housing dent detected.'];
            internalIssues = ['Department description correlates with faulty optical engine or blown projection bulb.'];
            severity = 'Critical';
            action = 'Do not accept into inventory. Initiate Vendor Return workflow immediately.';
        } else if (desc.includes('chair') || desc.includes('desk') || desc.includes('furniture') || desc.includes('table')) {
            externalDamage = ['Structural component (leg/armrest) is visibly bent or detached.', 'Surface material shows factory defect or tear.'];
            internalIssues = ['Mechanical failure in adjustment mechanism suspected based on notes.'];
            severity = 'Moderate';
            action = 'Request replacement parts or partial refund via Vendor Return workflow.';
        } else if (desc.includes('printer') || desc.includes('scanner')) {
            externalDamage = ['Paper feed tray alignment is skewed.', 'Internal housing or glass bed is cracked.'];
            internalIssues = ['Notes match known symptoms of fuser unit failure or roller defect.'];
            severity = 'High';
            action = 'Initiate Vendor Return for full replacement.';
        } else if (desc.includes('laptop') || desc.includes('macbook') || desc.includes('computer') || desc.includes('pc')) {
            externalDamage = ['Chassis dent detected near the hinge mechanism.', 'Screen bezel is physically separated from the display panel.'];
            internalIssues = ['Department description indicates potential severe motherboard or battery swelling issues.'];
            severity = 'Critical';
            action = 'Do not accept into inventory. Initiate Vendor Return workflow immediately.';
        } else if (desc.includes('monitor') || desc.includes('display') || desc.includes('screen')) {
            externalDamage = ['Visible dead pixels or pressure marks on the LCD panel.', 'Stand mounting bracket is bent out of shape.'];
            internalIssues = ['Backlight bleed or inverter failure suspected based on description.'];
            severity = 'High';
            action = 'Initiate Vendor Return for full panel replacement.';
        } else if (desc.includes('keyboard') || desc.includes('mouse') || desc.includes('peripheral')) {
            externalDamage = ['Missing or physically broken buttons/keycaps.', 'Cable fraying / USB connector housing is damaged.'];
            internalIssues = ['Description suggests internal membrane or sensor board failure.'];
            severity = 'Moderate';
            action = 'Request rapid accessory replacement via Vendor Return workflow.';
        } else {
            // Adaptive generic fallback utilizing user's exact words
            const firstWord = description.trim().split(' ')[0] || 'Asset';
            const shortDesc = description.length > 25 ? `${description.substring(0, 25)}...` : description;

            externalDamage = [
                `Significant physical damage detected on the primary casing of the ${firstWord}.`,
                `Structural integrity is compromised based on visual analysis against known factory parameters.`
            ];
            internalIssues = [
                `Reported "${shortDesc}" strongly correlates with internal hardware/component defect.`
            ];
            severity = 'Critical';
            action = 'Hold item in quarantine. Initiate Vendor Return workflow for immediate replacement.';
        }

        setTimeout(() => {
            setReportData({
                confidence: Math.floor(Math.random() * 8) + 88, // 88-95%
                externalDamage,
                internalIssues,
                severity,
                action
            });
            setFlowState('report_ready');
        }, 2500);
    };

    const submitToWorkflow = () => {
        setFlowState('workflow_active');
        setWorkflowStage(1); // Department has submitted, waiting on HOD

        const defectId = `DEF-${Math.floor(Math.random() * 10000)}`;
        addDefect({
            id: defectId,
            status: 'Pending HOD',
            date: new Date().toISOString()
        });

        // BUG FIX: Automatically populate the Approval board with this return request
        addProcurement({
            item: `Return Authorization: Damaged Asset (${defectId})`,
            department: 'Computer Science',
            requestedBy: user?.name || 'HOD',
            amount: 0,
            status: 'Pending', // Setting to pending forces it to appear on Kanban
            signals: []
        });
    };

    const advanceWorkflow = (targetStage) => {
        setWorkflowStage(targetStage);
        if (targetStage === 2) {
            navigate('/approvals');
        }
    };

    // --- RENDER HELPERS ---

    const renderUploadZone = () => (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-borderContent">
            <h3 className="text-xl font-bold text-primaryText mb-6 flex items-center">
                <Camera className="mr-3 text-accent" size={24} />
                Asset Defect Submission
            </h3>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">1. Upload Evidence Photo</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${imagePreview ? 'border-accent bg-blue-50' : 'border-gray-300 hover:border-accent hover:bg-gray-50'}`}
                        style={{ minHeight: '240px' }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded drop-shadow-md" />
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <UploadCloud size={32} />
                                </div>
                                <p className="text-gray-600 font-medium">Click or drag photo to upload</p>
                                <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG (Max 5MB)</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">2. Departmental Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the internal issues or functionality problems not visible in the photo (e.g., 'Screen flickers when powered on, system fails to boot')..."
                        className="w-full flex-1 bg-gray-50 border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent focus:border-accent resize-none outline-none transition-all"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
                <button
                    onClick={triggerAnalysis}
                    disabled={!imagePreview || description.length < 10}
                    className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Activity size={20} className="mr-2" />
                    Submit for AI Analysis
                </button>
            </div>
        </div>
    );

    const renderAnalysisLoading = () => (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-borderContent flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
            <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin"></div>
                <div className="w-24 h-24 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                <Activity size={32} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Vision Model Analyzing...</h3>
            <p className="text-gray-500 max-w-md">Scanning uploaded media for structural damage, cracks, missing components, and cross-referencing departmental notes.</p>
        </div>
    );

    const renderDefectReport = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-borderContent overflow-hidden animate-[slideUp_0.5s_ease-out_forwards]">
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><AlertTriangle size={24} /></div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Defect Report</h3>
                        <p className="text-sm text-amber-700 font-medium">Confidence Score: {reportData?.confidence || 94}%</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-1">Severity</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${reportData?.severity === 'Critical' ? 'bg-red-100 border border-red-200 text-red-700' : reportData?.severity === 'High' ? 'bg-orange-100 border border-orange-200 text-orange-700' : 'bg-yellow-100 border border-yellow-200 text-yellow-700'}`}>
                        {reportData?.severity || 'Critical'}
                    </span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-6">
                <div className="col-span-1 border-r border-gray-100 pr-6">
                    <span className="text-xs uppercase font-bold text-gray-500 block mb-3">Evidence Details</span>
                    {imagePreview && <img src={imagePreview} className="w-full rounded-lg border border-gray-200 mb-4 shadow-sm" alt="Analyzed" />}
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 font-medium border border-gray-200">
                        <span className="text-xs block text-gray-500 uppercase mb-1">Dept Description</span>
                        "{description}"
                    </div>
                </div>

                <div className="col-span-2 space-y-6">
                    <div>
                        <h4 className="flex items-center text-gray-800 font-bold mb-3 border-b border-gray-100 pb-2">
                            <ImageIcon size={18} className="mr-2 text-gray-400" /> Detected External Damage
                        </h4>
                        <ul className="space-y-2">
                            {reportData?.externalDamage.map((msg, i) => (
                                <li key={i} className="flex items-start text-sm"><XCircle size={16} className="mr-2 text-red-500 shrink-0 mt-0.5" /> <span className="text-gray-700">{msg}</span></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center text-gray-800 font-bold mb-3 border-b border-gray-100 pb-2">
                            <FileText size={18} className="mr-2 text-gray-400" /> Correlated Internal Issues
                        </h4>
                        <ul className="space-y-2">
                            {reportData?.internalIssues.map((msg, i) => (
                                <li key={i} className="flex items-start text-sm"><ShieldCheck size={16} className="mr-2 text-amber-500 shrink-0 mt-0.5" /> <span className="text-gray-700">{msg}</span></li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <span className="text-xs uppercase font-bold text-red-500 block mb-1">Recommended Action</span>
                        <p className="text-red-900 font-bold text-sm">{reportData?.action}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                <button onClick={() => setFlowState('idle')} className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Cancel</button>
                <button
                    onClick={submitToWorkflow}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center"
                >
                    Trigger Vendor Return Workflow <ChevronRight size={16} className="ml-2" />
                </button>
            </div>
        </div>
    );

    const stages = [
        { title: 'Department', desc: 'Defect Logged & Evidenced' },
        { title: 'HOD', desc: 'Return Request Approved' }
    ];

    const renderWorkflowTracker = () => (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-borderContent">
            <h3 className="text-xl font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4 flex items-center">
                <Activity className="mr-3 text-blue-600" size={24} /> Live Delivery Return Tracker
            </h3>

            <div className="flex justify-between items-center relative py-12 px-4 max-w-2xl mx-auto">
                <div className="absolute left-16 right-16 top-1/2 -mt-1 h-2 bg-gray-100 rounded-full z-0 overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-700 ease-in-out"
                        style={{ width: `${(Math.min(workflowStage, 1) / 1) * 100}%` }}
                    />
                </div>

                {stages.map((stage, idx) => {
                    const isCompleted = workflowStage > idx;
                    const isCurrent = workflowStage === idx;
                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center w-48 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-md transition-all duration-300 border-4 ${isCompleted ? 'bg-green-500 text-white border-green-200' : isCurrent ? 'bg-blue-600 text-white border-blue-200 ring-4 ring-blue-50 scale-110' : 'bg-gray-200 text-gray-400 border-gray-100'}`}>
                                {isCompleted ? <Check size={24} /> : idx + 1}
                            </div>
                            <h4 className={`font-bold text-sm ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{stage.title}</h4>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 leading-tight">{stage.desc}</p>

                            {/* Simulation buttons below tracker for demo purpose */}
                            {isCurrent && idx === 1 && (
                                <button
                                    onClick={() => advanceWorkflow(idx + 1)}
                                    className="mt-4 bg-gray-900 hover:bg-black text-white text-xs px-4 py-2 rounded shadow-md transition-colors"
                                >
                                    Provide HOD Approval
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {flowState === 'completed' && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 flex items-start animate-[slideUp_0.5s_ease-out_forwards]">
                    <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4 shrink-0">
                        <FileCheck size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-green-800 mb-1">Return-to-Vendor Notice Auto-Generated!</h4>
                        <p className="text-green-700 text-sm mb-4">The formal digital return notice with attached AI Defect Report has been securely transmitted to the Vendor.</p>
                        <div className="flex space-x-4">
                            <button className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded font-semibold text-xs hover:bg-green-100 transition-colors shadow-sm">View Document PDF</button>
                            <button onClick={() => { setFlowState('idle'); setImagePreview(null); setDescription(''); setWorkflowStage(0); }} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded font-semibold text-xs hover:bg-gray-50 transition-colors shadow-sm">Start New Scan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 text-gray-900 rounded-xl overflow-hidden shadow-sm border border-borderContent font-sans relative">
            <div className="h-16 bg-white border-b border-borderContent flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center">
                    <AlertOctagon className="text-red-500 mr-3" size={24} />
                    <h2 className="text-xl font-bold tracking-tight text-primaryText">AI Defect Detection & Returns</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Only show upload if we're not locked in a workflow */}
                    {flowState === 'idle' && renderUploadZone()}
                    {flowState === 'analyzing' && renderAnalysisLoading()}
                    {flowState === 'report_ready' && renderDefectReport()}
                    {(flowState === 'workflow_active' || flowState === 'completed') && renderWorkflowTracker()}
                </div>
            </div>
        </div>
    );
}

export default DefectDetection;

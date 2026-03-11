import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    ShieldAlert, Search, RefreshCw,
    AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

function VerificationWorkbench() {
    const { user } = useAuth();
    const { procurements, updateProcurementStatus, auditLogs, addAuditLog } = useData();
    const navigate = useNavigate();

    // UI State
    const [selectedReq, setSelectedReq] = useState(null);
    const [timer, setTimer] = useState(0);

    // Resolution State
    const [signalResolutions, setSignalResolutions] = useState({});
    const [justification, setJustification] = useState('');
    const [rejectConfirm, setRejectConfirm] = useState('');
    const [responsibilityAcknowledged, setResponsibilityAcknowledged] = useState(false);

    // Mock flagged requests
    const flaggedRequests = procurements.filter(p => p.status === 'Pending Verification');

    // Timer logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Reset state on request change
    useEffect(() => {
        setSignalResolutions({});
        setJustification('');
        setRejectConfirm('');
        setResponsibilityAcknowledged(false);
        setTimer(0);
    }, [selectedReq]);

    if (!user || !['chairman', 'principle', 'HOD'].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleResolutionChange = (signalId, val, note) => {
        setSignalResolutions(prev => ({ ...prev, [signalId]: { val, note } }));
    };

    const signals = selectedReq?.signals || [];
    const allSignalsResolved = signals.length === 0 || signals.every(s => signalResolutions[s.id]?.val);
    const resolutionsCount = Object.keys(signalResolutions).filter(k => signalResolutions[k]?.val).length;

    const canSubmit = allSignalsResolved; // Removed strict checks so buttons are clickable right away
    const isEscalated = Object.values(signalResolutions).some(r => r.val === 'Escalate Signal');

    const handleAction = (actionType) => {
        if (!canSubmit && actionType !== 'Reject at Verification') return;

        let targetStatus = '';
        if (actionType === 'Approve for Forwarding') targetStatus = 'Pending';
        if (actionType === 'Conditional Forward') targetStatus = 'Pending';
        if (actionType === 'Return to Requester') targetStatus = 'Returned';
        if (actionType === 'Reject at Verification') {
            targetStatus = 'Rejected';
        }

        // Apply action
        updateProcurementStatus(selectedReq.id, targetStatus);

        // Detailed Audit log
        addAuditLog('Verify Gate', 'Verification', `Action: ${actionType}. Justification: ${justification}`);

        setSelectedReq(null);
        navigate('/approvals');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white text-gray-900 rounded-xl overflow-hidden shadow-sm border border-borderContent font-sans relative">

            {/* Zone 1: Command Header */}
            <div className="h-16 bg-white border-b border-borderContent flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center space-x-4">
                    <ShieldAlert className="text-red-600" size={24} />
                    <h2 className="text-xl font-bold tracking-tight text-primaryText">Verification Workbench</h2>

                    <div className="flex space-x-4 ml-6 text-sm border-l border-borderContent pl-6">
                        <div className="flex flex-col">
                            <span className="text-secondaryText text-xs font-medium">Awaiting</span>
                            <span className="font-bold text-red-600">{flaggedRequests.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-secondaryText text-xs font-medium">In Progress</span>
                            <span className="font-bold text-blue-600">{selectedReq ? '1' : '0'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-secondaryText text-xs font-medium">Cleared Today</span>
                            <span className="font-bold text-green-600">0</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 relative">
                    <span className={`text-sm font-mono px-3 py-1.5 rounded bg-gray-50 border ${timer > 1800 ? 'border-red-500 animate-pulse text-red-600 bg-red-50' : 'border-borderContent text-primaryText'}`}>
                        {formatTime(timer)}
                    </span>
                    <button className="flex items-center text-xs bg-white border border-borderContent hover:bg-gray-50 text-primaryText font-medium px-3 py-1.5 rounded transition-colors shadow-sm">
                        <RefreshCw size={14} className="mr-2 text-gray-500" /> Fresh Scan
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden bg-gray-50">
                {/* Zone 2: Sidebar Queue */}
                <div className="w-80 bg-white border-r border-borderContent flex flex-col shrink-0">
                    <div className="p-4 border-b border-borderContent bg-gray-50">
                        <h3 className="text-sm font-bold text-primaryText uppercase tracking-wider">Flagged Queue</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {flaggedRequests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedReq(req)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${selectedReq?.id === req.id ? 'bg-red-50 border-red-300 shadow-sm' : 'bg-white border-borderContent hover:border-gray-300 hover:shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono font-medium text-gray-500">{req.id}</span>
                                    {req.signals?.some(s => s.severity === 'Critical') ? (
                                        <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Critical</span>
                                    ) : (
                                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">High</span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-sm text-primaryText truncate mb-1">{req.item}</h4>
                                <div className="text-xs text-secondaryText flex justify-between items-center">
                                    <span>{req.department}</span>
                                    <span className="font-semibold text-gray-700">₹{req.amount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area containing Zone 3 and Zone 4 */}
                <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
                    {selectedReq ? (
                        <>
                            {/* Zone 3: Investigation Workspace (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 relative">
                                <div className="space-y-6 max-w-4xl mx-auto pb-4">

                                    {/* Request Header Summary */}
                                    <div className="bg-white p-5 rounded-xl border border-borderContent shadow-sm flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-primaryText">{selectedReq.item}</h3>
                                            <p className="text-sm text-secondaryText mt-1 flex items-center">
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mr-2">{selectedReq.id}</span>
                                                By {selectedReq.requestedBy} • {selectedReq.department}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-secondaryText uppercase tracking-wider font-semibold mb-1">Total Value</span>
                                            <span className="text-2xl font-bold text-red-600">₹{selectedReq.amount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <h3 className="text-lg font-bold text-primaryText flex items-center">
                                            <AlertTriangle className="mr-2 text-amber-500" size={20} />
                                            Detected Signals (Duplicate / Anomaly)
                                        </h3>
                                        <div className="text-sm font-medium text-secondaryText bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                                            <span className={resolutionsCount === signals.length ? 'text-green-600' : 'text-blue-600'}>{resolutionsCount}</span> of {signals.length} Resolved
                                        </div>
                                    </div>

                                    {signals.length === 0 ? (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
                                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
                                                <CheckCircle className="text-green-500" size={32} />
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Clear to Approve</h4>
                                            <p className="text-gray-600 max-w-md mx-auto">No duplicates or anomalies detected for this request. It is safe to proceed with the final verdict.</p>
                                        </div>
                                    ) : (
                                        signals.map((signal, index) => {
                                            const isDuplicate = signal.type === 'Duplicate';
                                            const isCritical = signal.severity === 'Critical';

                                            const evidenceFields = signal.evidence?.fields || [];

                                            return (
                                                <div
                                                    key={signal.id}
                                                    className={`bg-white rounded-xl border ${isCritical ? 'border-red-200 shadow-sm' : 'border-amber-200 shadow-sm'} overflow-hidden relative`}
                                                >
                                                    <div className={`h-1.5 w-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-start mb-5">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold font-mono">{signal.id}</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${isDuplicate ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-orange-100 border-orange-200 text-orange-700'}`}>{signal.type}</span>
                                                                <h4 className="font-bold text-gray-900 text-lg">{signal.name}</h4>
                                                            </div>
                                                            <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</span>
                                                                <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                                    <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${signal.confidence}%` }}></div>
                                                                </div>
                                                                <span className="text-sm font-mono font-bold text-red-600">{signal.confidence}%</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-5">
                                                            <p className="text-sm text-gray-700 mb-4 leading-relaxed font-medium">{signal.description}</p>

                                                            {isDuplicate ? (
                                                                <div className="mt-2 text-sm border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                                    <div className="grid grid-cols-3 bg-gray-100 font-bold p-3 text-gray-700 border-b border-gray-200">
                                                                        <span>Field</span><span>Current Request</span><span>Historical Match</span>
                                                                    </div>
                                                                    {evidenceFields.map((field, i) => (
                                                                        <div key={i} className={`grid grid-cols-3 p-3 border-b last:border-0 border-gray-100 ${field.match ? 'bg-red-50/50 text-red-800' : 'text-gray-600'}`}>
                                                                            <span className="font-medium text-gray-900">{field.name}</span>
                                                                            <span className={field.match ? "font-semibold" : ""}>{field.value1}</span>
                                                                            <span className={field.match ? "font-semibold" : ""}>{field.value2}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="flex space-x-6 text-sm bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
                                                                    <div className="flex-1">
                                                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Expected Avg</span>
                                                                        <span className="font-mono font-semibold text-green-600 text-lg">₹{signal.evidence?.expected?.toLocaleString('en-IN') || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex-1 border-l border-gray-200 pl-6">
                                                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Requested</span>
                                                                        <span className="font-mono font-bold text-red-600 text-lg">₹{signal.evidence?.requested?.toLocaleString('en-IN') || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex-1 border-l border-gray-200 pl-6">
                                                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold block mb-1">Deviation</span>
                                                                        <span className="font-mono font-bold text-red-600 text-lg bg-red-50 px-2 py-0.5 rounded border border-red-100">+{signal.evidence?.deviation || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center pt-5 mt-2">
                                                            <div className="flex space-x-3 w-full max-w-2xl">
                                                                <select
                                                                    value={signalResolutions[signal.id]?.val || ''}
                                                                    onChange={(e) => handleResolutionChange(signal.id, e.target.value, '')}
                                                                    className={`bg-white border ${signalResolutions[signal.id]?.val ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-300'} text-gray-900 text-sm font-medium rounded-lg px-4 py-2.5 focus:border-accent focus:ring-accent focus:outline-none w-56 shadow-sm`}
                                                                >
                                                                    <option value="">-- Select Resolution --</option>
                                                                    <option value="Not a Duplicate">Not a Duplicate</option>
                                                                    <option value="Duplicate">Duplicate</option>
                                                                </select>
                                                            </div>

                                                            {signalResolutions[signal.id]?.val && (
                                                                <div className="flex items-center text-green-600 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                                                    <CheckCircle size={16} className="mr-1.5" /> Resolved
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Zone 4: Resolution Console (Fixed at Bottom) */}
                            <div className={`shrink-0 w-full bg-white border-t ${allSignalsResolved ? 'border-green-500 shadow-[0_-5px_30px_rgba(34,197,94,0.15)]' : 'border-gray-300 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]'} p-5 z-20 relative`}>
                                <div className="max-w-6xl mx-auto flex flex-col space-y-4">
                                    <div className="flex items-center justify-end">
                                        {!allSignalsResolved ? (
                                            <span className="text-sm font-semibold text-red-600 flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-200"><XCircle size={14} className="mr-1.5" /> Please resolve all signals to unlock</span>
                                        ) : (
                                            <span className="text-sm font-semibold text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200"><CheckCircle size={14} className="mr-1.5" /> Ready for final verdict</span>
                                        )}
                                    </div>
                                    <div className="flex items-start space-x-6">
                                        <div className="flex-1 flex flex-col space-y-3">
                                            <textarea
                                                disabled={!allSignalsResolved && signals.length > 0}
                                                value={justification}
                                                onChange={(e) => setJustification(e.target.value)}
                                                placeholder="Optional: Enter justification..."
                                                className={`w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 resize-none transition-all disabled:opacity-50 disabled:bg-gray-100 relative z-20`}
                                                rows="2"
                                            />
                                            <label className={`flex items-center text-sm font-medium ${allSignalsResolved || signals.length === 0 ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'} relative z-20`}>
                                                <input
                                                    type="checkbox"
                                                    disabled={!allSignalsResolved && signals.length > 0}
                                                    checked={responsibilityAcknowledged}
                                                    onChange={(e) => setResponsibilityAcknowledged(e.target.checked)}
                                                    className="mr-2.5 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent disabled:opacity-50"
                                                />
                                                I acknowledge full responsibility for this verification outcome.
                                            </label>
                                        </div>
                                        <div className="flex flex-col space-y-3 w-72 shrink-0">
                                            <div className="flex space-x-3">
                                                <input
                                                    type="text"
                                                    placeholder="Type REJECT (Optional)"
                                                    value={rejectConfirm}
                                                    onChange={e => setRejectConfirm(e.target.value)}
                                                    disabled={!allSignalsResolved && signals.length > 0}
                                                    className="w-28 bg-white border border-gray-300 shadow-sm text-gray-900 rounded-lg px-3 py-2 text-sm text-center focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50 disabled:bg-gray-50 relative z-20"
                                                />
                                                <button
                                                    onClick={() => handleAction('Reject at Verification')}
                                                    disabled={!allSignalsResolved && signals.length > 0}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-200 relative z-20"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                            <div className="flex space-x-3 mt-auto relative z-20">
                                                <button
                                                    onClick={() => handleAction('Approve for Forwarding')}
                                                    disabled={!allSignalsResolved && signals.length > 0}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200 hover:shadow-lg transform active:scale-95 duration-150"
                                                >
                                                    Approve & Forward
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-gray-100">
                                <Search size={48} className="text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-500 mb-2">Select a flagged request</p>
                            <p className="text-sm">Choose an item from the queue to begin investigation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerificationWorkbench;

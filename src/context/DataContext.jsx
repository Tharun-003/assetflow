import React, { createContext, useContext, useState } from 'react';
import { assets as initialAssets, procurements as initialProcurements, auditLogs as initialAuditLogs } from '../data/mockData';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [assets, setAssets] = useState(initialAssets);
    const [procurements, setProcurements] = useState(initialProcurements);
    const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
    const [defects, setDefects] = useState([]);

    const addAsset = (asset) => {
        setAssets(prev => [...prev, { ...asset, id: `AST-${prev.length + 1}`.padStart(7, '0'), qrCode: `qr-AST-${prev.length + 1}` }]);
        addAuditLog('Create', 'Asset', `Added ${asset.name}`);
    };

    const addProcurement = (proc) => {
        setProcurements(prev => [...prev, {
            ...proc,
            id: `REQ-${prev.length + 101}`,
            status: 'Requested',
            date: new Date().toISOString().split('T')[0],
            signals: [] // Default empty signals for new requests
        }]);
        addAuditLog('Create', 'Procurement', `Requested ${proc.item}`);
    };

    const addBulkProcurements = (procArray) => {
        setProcurements(prev => {
            const newProcs = procArray.map((p, index) => ({
                status: 'Pending', // Default if not provided
                signals: [], // Default if not provided
                ...p,
                id: `REQ-${prev.length + 101 + index}`,
                date: new Date().toISOString().split('T')[0],
            }));
            return [...prev, ...newProcs];
        });
        addAuditLog('Import', 'Procurement', `Smart imported ${procArray.length} requisitions`);
    };

    const addAuditLog = (action, module, details) => {
        setAuditLogs(prev => [
            { id: prev.length + 1, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), user: 'Current User', action, module, details, ip: '127.0.0.1' },
            ...prev
        ]);
    };

    const addBulkAuditLogs = (logArray) => {
        setAuditLogs(prev => {
            const newLogs = logArray.map((log, index) => ({
                id: prev.length + 1 + index,
                timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                user: 'Current User',
                ip: '127.0.0.1',
                ...log
            }));
            return [...newLogs, ...prev]; // Prepend so they appear at top
        });
    };

    const updateProcurementStatus = (id, status) => {
        setProcurements(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        addAuditLog('Edit', 'Procurement', `Updated status of ${id} to ${status}`);
    }

    const updateSignalResolution = (reqId, signalId, resolution, note) => {
        setProcurements(prev => prev.map(p => {
            if (p.id === reqId) {
                const updatedSignals = p.signals.map(s =>
                    s.id === signalId ? { ...s, resolution, resolutionNote: note } : s
                );
                return { ...p, signals: updatedSignals };
            }
            return p;
        }));
        addAuditLog('Verify', 'Verification Gate', `Resolved signal ${signalId} on ${reqId} as ${resolution}`);
    };

    const addDefect = (defect) => {
        setDefects(prev => [...prev, defect]);
        addAuditLog('Create', 'Defect Analysis', `New defect report generated: ${defect.id}`);
    };

    return (
        <DataContext.Provider value={{
            assets, addAsset,
            procurements, addProcurement, addBulkProcurements, updateProcurementStatus, updateSignalResolution,
            auditLogs, addAuditLog, addBulkAuditLogs,
            defects, addDefect, setDefects
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}

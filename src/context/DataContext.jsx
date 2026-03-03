import React, { createContext, useContext, useState } from 'react';
import { assets as initialAssets, procurements as initialProcurements, auditLogs as initialAuditLogs } from '../data/mockData';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [assets, setAssets] = useState(initialAssets);
    const [procurements, setProcurements] = useState(initialProcurements);
    const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

    const addAsset = (asset) => {
        setAssets(prev => [...prev, { ...asset, id: `AST-${prev.length + 1}`.padStart(7, '0'), qrCode: `qr-AST-${prev.length + 1}` }]);
        addAuditLog('Create', 'Asset', `Added ${asset.name}`);
    };

    const addProcurement = (proc) => {
        setProcurements(prev => [...prev, { ...proc, id: `REQ-${prev.length + 101}`, status: 'Requested', date: new Date().toISOString().split('T')[0] }]);
        addAuditLog('Create', 'Procurement', `Requested ${proc.item}`);
    };

    const addAuditLog = (action, module, details) => {
        setAuditLogs(prev => [
            { id: prev.length + 1, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), user: 'Current User', action, module, details, ip: '127.0.0.1' },
            ...prev
        ]);
    };

    const updateProcurementStatus = (id, status) => {
        setProcurements(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        addAuditLog('Edit', 'Procurement', `Updated status of ${id} to ${status}`);
    }

    return (
        <DataContext.Provider value={{
            assets, addAsset,
            procurements, addProcurement, updateProcurementStatus,
            auditLogs, addAuditLog
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}

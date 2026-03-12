import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { assets as initialAssets, procurements as initialProcurements, auditLogs as initialAuditLogs } from '../data/mockData';

const DataContext = createContext();

// Connect to the same IP the site was loaded from on port 3001
const socket = io(`http://${window.location.hostname}:3001`);

export function DataProvider({ children }) {
    const [assets, setAssets] = useState(initialAssets);
    const [procurements, setProcurements] = useState(initialProcurements);
    const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
    const [defects, setDefects] = useState([]);
    
    useEffect(() => {
        socket.on('initialState', ({ db, isSeeded }) => {
            if (!isSeeded) {
                socket.emit('seedState', {
                    assets: initialAssets,
                    procurements: initialProcurements,
                    auditLogs: initialAuditLogs,
                    defects: []
                });
            } else {
                setAssets(db.assets);
                setProcurements(db.procurements);
                setAuditLogs(db.auditLogs);
                setDefects(db.defects);
            }
        });

        socket.on('stateUpdate', (db) => {
            // Update react state whenever anyone on the network changes something
            setAssets(db.assets);
            setProcurements(db.procurements);
            setAuditLogs(db.auditLogs);
            setDefects(db.defects);
        });

        return () => {
            socket.off('initialState');
            socket.off('stateUpdate');
        };
    }, []);

    const addAsset = (asset) => {
        setAssets(prev => [...prev, asset]);
        socket.emit('action', { type: 'addAsset', payload: asset });
        addAuditLog('Create', 'Asset', `Added ${asset.name}`);
    };

    const addProcurement = (proc) => {
        setProcurements(prev => [...prev, { ...proc, id: proc.id || `REQ-${Math.floor(Math.random() * 10000)}` }]);
        socket.emit('action', { type: 'addProcurement', payload: proc });
        addAuditLog('Create', 'Procurement', `Requested ${proc.item}`);
    };

    const addBulkProcurements = (procArray) => {
        const enrichedProcs = procArray.map(proc => ({ ...proc, id: proc.id || `REQ-${Math.floor(Math.random() * 10000)}` }));
        setProcurements(prev => [...prev, ...enrichedProcs]);
        socket.emit('action', { type: 'addBulkProcurements', payload: enrichedProcs });
        addAuditLog('Import', 'Procurement', `Smart imported ${enrichedProcs.length} requisitions`);
    };

    const addAuditLog = (action, module, details) => {
        const log = { id: `LOG-${Math.floor(Math.random() * 10000)}`, action, module, details, date: new Date().toISOString() };
        setAuditLogs(prev => [log, ...prev]);
        socket.emit('action', { type: 'addAuditLog', payload: { action, module, details } });
    };

    const addBulkAuditLogs = (logArray) => {
        socket.emit('action', { type: 'addBulkAuditLogs', payload: logArray });
    };

    const updateProcurementStatus = (id, status) => {
        setProcurements(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        socket.emit('action', { type: 'updateProcurementStatus', payload: { id, status } });
        addAuditLog('Edit', 'Procurement', `Updated status of ${id} to ${status}`);
    }

    const updateSignalResolution = (reqId, signalId, resolution, note) => {
        socket.emit('action', { type: 'updateSignalResolution', payload: { reqId, signalId, resolution, note } });
        addAuditLog('Verify', 'Verification Gate', `Resolved signal ${signalId} on ${reqId} as ${resolution}`);
    };

    const addDefect = (defect) => {
        setDefects(prev => [...prev, defect]);
        socket.emit('action', { type: 'addDefect', payload: defect });
        addAuditLog('Create', 'Defect Analysis', `New defect report generated: ${defect.id}`);
    };

    const setDefectsWrapper = (defectsArrayOrFn) => {
        const nextDefects = typeof defectsArrayOrFn === 'function' ? defectsArrayOrFn(defects) : defectsArrayOrFn;
        socket.emit('action', { type: 'setDefects', payload: nextDefects });
    };

    return (
        <DataContext.Provider value={{
            assets, addAsset,
            procurements, addProcurement, addBulkProcurements, updateProcurementStatus, updateSignalResolution,
            auditLogs, addAuditLog, addBulkAuditLogs,
            defects, addDefect, setDefects: setDefectsWrapper
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}

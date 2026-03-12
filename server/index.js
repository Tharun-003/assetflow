import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let db = { assets: [], procurements: [], auditLogs: [], defects: [] };
let isSeeded = false;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('initialState', { db, isSeeded });

  socket.on('seedState', (initialData) => {
    if (!isSeeded) {
      db = initialData;
      isSeeded = true;
      io.emit('stateUpdate', db);
      console.log('Database seeded by first client connecting');
    }
  });

  socket.on('action', ({ type, payload }) => {
    switch (type) {
      case 'addAsset':
        db.assets.push({ ...payload, id: `AST-${String(db.assets.length + 1).padStart(7, '0')}`, qrCode: `qr-AST-${db.assets.length + 1}` });
        break;
      case 'addProcurement':
        db.procurements.push({
            ...payload,
            id: `REQ-${db.procurements.length + 101}`,
            status: 'Requested',
            date: new Date().toISOString().split('T')[0],
            signals: []
        });
        break;
      case 'addBulkProcurements':
        const newProcs = payload.map((p, i) => ({
            status: 'Pending', signals: [], ...p,
            id: `REQ-${db.procurements.length + 101 + i}`,
            date: new Date().toISOString().split('T')[0],
        }));
        db.procurements = [...db.procurements, ...newProcs];
        break;
      case 'addAuditLog':
        db.auditLogs.unshift({
            id: db.auditLogs.length + 1,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: 'System Admin',
            ip: '192.168.1.10',
            ...payload
        });
        break;
      case 'addBulkAuditLogs':
        const newLogs = payload.map((log, i) => ({
            id: db.auditLogs.length + 1 + i,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: 'System Admin',
            ip: '192.168.1.10',
            ...log
        }));
        db.auditLogs = [...newLogs, ...db.auditLogs];
        break;
      case 'updateProcurementStatus':
        db.procurements = db.procurements.map(p => p.id === payload.id ? { ...p, status: payload.status } : p);
        break;
      case 'updateSignalResolution':
        db.procurements = db.procurements.map(p => {
            if (p.id === payload.reqId) {
                const updatedSignals = p.signals.map(s => s.id === payload.signalId ? { ...s, resolution: payload.resolution, resolutionNote: payload.note } : s);
                return { ...p, signals: updatedSignals };
            }
            return p;
        });
        break;
      case 'addDefect':
        db.defects.push(payload);
        break;
      case 'setDefects':
        db.defects = payload;
        break;
    }
    io.emit('stateUpdate', db);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`LAN Sync Server running on port ${PORT} (0.0.0.0 allows network access)`));

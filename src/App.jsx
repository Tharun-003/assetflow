import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Procurement from './pages/Procurement';
import Approvals from './pages/Approvals';
import AuditLog from './pages/AuditLog';
import QrScanner from './pages/QrScanner';

import VerificationWorkbench from './pages/VerificationWorkbench';
import Reports from './pages/Reports';
import DefectDetection from './pages/DefectDetection';
import SmartImport from './pages/SmartImport';

function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="assets" element={<Assets />} />
                            <Route path="procurement" element={<Procurement />} />
                            <Route path="approvals" element={<Approvals />} />
                            <Route path="verification" element={<VerificationWorkbench />} />
                            <Route path="audit" element={<AuditLog />} />
                            <Route path="scanner" element={<QrScanner />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="defect-detection" element={<DefectDetection />} />
                            <Route path="smart-import" element={<SmartImport />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </DataProvider>
        </AuthProvider>
    );
}

export default App;

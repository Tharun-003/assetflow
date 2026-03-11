import Papa from 'papaparse';
import usersCsv from './users.csv?raw';
import assetsCsv from './assets.csv?raw';
import procurementsCsv from './procurements.csv?raw';
import auditLogsCsv from './auditLogs.csv?raw';

export const users = Papa.parse(usersCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
export const assets = Papa.parse(assetsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
const parsedProcurements = Papa.parse(procurementsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

// Inject mock signals for the Verification Workbench
export const procurements = parsedProcurements.map(p => {
    let signals = [];
    if (p.status === 'Requested' || p.status === 'Pending Verification' || p.amount > 50000) {
        // Change status to force into verification queue for testing
        p.status = 'Pending Verification';

        if (p.amount > 100000) {
            signals.push({
                id: 'SIG-001',
                type: 'Duplicate',
                name: 'Identical Request Clone',
                severity: 'Critical',
                confidence: 96,
                description: 'Same item, vendor, and quantity were submitted within the last 30 days.',
                evidence: {
                    type: 'duplicate',
                    fields: [
                        { name: 'Item', match: true, value1: p.item, value2: p.item },
                        { name: 'Amount', match: true, value1: p.amount, value2: p.amount },
                        { name: 'Date', match: false, value1: 'Today', value2: '2 weeks ago' }
                    ]
                },
                resolution: null,
                resolutionNote: ''
            });
        }
    }
    return { ...p, signals };
});

export const auditLogs = Papa.parse(auditLogsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

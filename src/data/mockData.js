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
            const isOlder = p.amount % 2 === 0;
            const historicalAmount = isOlder ? p.amount - 15000 : p.amount;
            const historicalDate = isOlder ? '1 yr ago' : '2 weeks ago';
            const confidence = isOlder ? 82 : 96;

            signals.push({
                id: `SIG-${isOlder ? '002' : '001'}`,
                type: 'Duplicate',
                name: isOlder ? 'Similar Historical Request' : 'Identical Request Clone',
                severity: isOlder ? 'High' : 'Critical',
                confidence: confidence,
                description: isOlder ? 'A highly similar item was procured 1 yr ago.' : 'Same item, vendor, and quantity were submitted within the last 30 days.',
                evidence: {
                    type: 'duplicate',
                    fields: [
                        { name: 'Item', match: true, value1: p.item, value2: p.item },
                        { name: 'Amount', match: !isOlder, value1: p.amount, value2: historicalAmount },
                        { name: 'Date', match: false, value1: 'Today', value2: historicalDate }
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

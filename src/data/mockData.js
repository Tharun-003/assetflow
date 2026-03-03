import Papa from 'papaparse';
import usersCsv from './users.csv?raw';
import assetsCsv from './assets.csv?raw';
import procurementsCsv from './procurements.csv?raw';
import auditLogsCsv from './auditLogs.csv?raw';

export const users = Papa.parse(usersCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
export const assets = Papa.parse(assetsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
export const procurements = Papa.parse(procurementsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
export const auditLogs = Papa.parse(auditLogsCsv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;

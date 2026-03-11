const fs = require('fs');
const path = require('path');

const requests = [
    // Academic
    { id: 'APR-201', item: 'Smart Board Purchase', category: 'Academic', department: 'Academic Block', requestedBy: 'Dr. Sharma', amount: 150000, status: 'Requested', date: '2024-03-01' },
    { id: 'APR-202', item: 'Smart Board Upgrade', category: 'Academic', department: 'Academic Block', requestedBy: 'Prof. Gupta', amount: 160000, status: 'Reviewing', date: '2024-03-05' },
    // IT
    { id: 'APR-203', item: 'Laptop Batch Purchase', category: 'IT & Technology', department: 'IT Dept', requestedBy: 'Amit Singh', amount: 845000, status: 'Approved', date: '2024-02-15' },
    { id: 'APR-204', item: 'Laptop Procurement', category: 'IT & Technology', department: 'IT Dept', requestedBy: 'Rajiv Rao', amount: 920000, status: 'Requested', date: '2024-03-08' },
    { id: 'APR-205', item: 'Server Room Upgrade', category: 'IT & Technology', department: 'IT Dept', requestedBy: 'Neha Verma', amount: 2500000, status: 'Purchased', date: '2024-01-10' },
    // Library
    { id: 'APR-206', item: 'Reference Book Procurement', category: 'Library Approvals', department: 'Library Dept', requestedBy: 'Ms. Iyer', amount: 45000, status: 'Delivered', date: '2023-11-20' },
    { id: 'APR-207', item: 'Journal Subscription Renewal', category: 'Library Approvals', department: 'Library Dept', requestedBy: 'Mr. Bose', amount: 120000, status: 'Approved', date: '2024-02-28' },
    // Hostel
    { id: 'APR-208', item: 'Bed Mattress Replacement', category: 'Hostel Approvals', department: 'Hostel Admin', requestedBy: 'Warden Kumar', amount: 350000, status: 'Reviewing', date: '2024-03-02' },
    { id: 'APR-209', item: 'Hostel Wi-Fi Upgrade', category: 'Hostel Approvals', department: 'Hostel Admin', requestedBy: 'Warden Singh', amount: 65000, status: 'Requested', date: '2024-03-09' },
    // Food & Kitchen
    { id: 'APR-210', item: 'Industrial Refrigerator Purchase', category: 'Food & Kitchen', department: 'Admin', requestedBy: 'Chef Sanjeev', amount: 220000, status: 'Purchased', date: '2024-01-25' },
    // Transport
    { id: 'APR-211', item: 'College Bus Purchase', category: 'Transport & Vehicles', department: 'Transport Dept', requestedBy: 'D. Patel', amount: 3500000, status: 'Delivered', date: '2023-09-15' },
    { id: 'APR-212', item: 'Bus CCTV Upgrade', category: 'Transport & Vehicles', department: 'Transport Dept', requestedBy: 'D. Patel', amount: 75000, status: 'Reviewing', date: '2024-02-20' },
    // Medical
    { id: 'APR-213', item: 'Hospital Bed Procurement', category: 'Medical Approvals', department: 'Medical Center', requestedBy: 'Dr. Reddy', amount: 140000, status: 'Approved', date: '2024-02-18' },
    { id: 'APR-214', item: 'Hospital Bed Replacement', category: 'Medical Approvals', department: 'Medical Center', requestedBy: 'Nurse Joy', amount: 155000, status: 'Requested', date: '2024-03-07' },
    // Sports
    { id: 'APR-215', item: 'Cricket Kit Purchase', category: 'Sports Approvals', department: 'Sports Dept', requestedBy: 'Coach Ravi', amount: 48000, status: 'Delivered', date: '2023-12-05' },
    { id: 'APR-216', item: 'Gym Treadmill Upgrade', category: 'Sports Approvals', department: 'Sports Dept', requestedBy: 'Coach Ravi', amount: 180000, status: 'Reviewing', date: '2024-03-04' },
    // Event
    { id: 'APR-217', item: 'Wireless Microphone Set', category: 'Event & AV Equipment', department: 'Event Committee', requestedBy: 'K. Desai', amount: 35000, status: 'Purchased', date: '2024-01-12' },
    { id: 'APR-218', item: 'Speaker System Upgrade', category: 'Event & AV Equipment', department: 'Event Committee', requestedBy: 'P. Nair', amount: 120000, status: 'Requested', date: '2024-03-10' },
    // Campus Infra
    { id: 'APR-219', item: 'CCTV Camera Expansion', category: 'Campus Infrastructure', department: 'Campus Security', requestedBy: 'Chief Security Ofc', amount: 450000, status: 'Approved', date: '2024-02-10' },
    { id: 'APR-220', item: 'Security Camera Purchase', category: 'Campus Infrastructure', department: 'Campus Security', requestedBy: 'Warden Kumar', amount: 380000, status: 'Requested', date: '2024-03-08' },
];

let csvContent = 'id,item,category,department,requestedBy,amount,status,date\n';
requests.forEach(r => {
    csvContent += `${r.id},${r.item},${r.category},${r.department},${r.requestedBy},${r.amount},${r.status},${r.date}\n`;
});

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'procurements.csv'), csvContent);
console.log('Successfully generated 20 sample approvals (APR-201 to APR-220) into procurements.csv.');

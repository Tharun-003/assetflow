const fs = require('fs');
const path = require('path');

const categories = [
    'Academic', 'IT Infrastructure', 'Library', 'Hostel', 'Food Facility',
    'Transport', 'Medical', 'Sports', 'Event Infrastructure', 'Campus Utilities'
];

const categoryMapping = {
    'IT Infrastructure': ['Desktop Computer', 'Laptop', 'Workstation Computer', 'Server', 'Network Switch', 'Router', 'Wi-Fi Access Point', 'Printer', 'Scanner', 'Biometric Device', 'Video Conferencing System'],
    'Library': ['Bookshelf', 'Library Book Collection', 'Reference Books', 'Journals', 'Reading Table', 'Reading Chair', 'Library Computer', 'Barcode Scanner', 'Book Trolley'],
    'Food Facility': ['Dining Table', 'Dining Chair', 'Serving Counter', 'Food Warmer', 'Cooking Stove', 'Refrigerator', 'Deep Freezer', 'Storage Rack', 'Mixer Grinder', 'Water Dispenser'],
    'Transport': ['College Bus', 'Mini Bus', 'Staff Van', 'Ambulance', 'Electric Campus Vehicle', 'Bus GPS System', 'Bus CCTV Camera'],
    'Medical': ['Hospital Bed', 'First Aid Kit', 'Wheelchair', 'Stretcher', 'Oxygen Cylinder', 'Blood Pressure Monitor', 'Thermometer', 'ECG Machine'],
    'Sports': ['Cricket Kit', 'Football', 'Basketball', 'Volleyball', 'Badminton Racket', 'Table Tennis Table', 'Gym Treadmill', 'Weight Bench'],
    'Event Infrastructure': ['Auditorium Stage', 'Auditorium Chairs', 'Conference Table', 'Podium', 'Microphone', 'Sound Mixer', 'Speaker System', 'Projector', 'LED Display Screen'],
    'Campus Utilities': ['CCTV Camera', 'Fire Extinguisher', 'Fire Alarm System', 'Generator', 'Solar Panel System', 'Water Tank', 'Water Purifier', 'Drinking Water Cooler'],
    'Academic': ['Whiteboard', 'Smart Board', 'Student Desk', 'Teacher Desk', 'Lab Equipment', 'Microscope', 'Oscilloscope', 'Drawing Board'],
    'Hostel': ['Bunk Bed', 'Single Bed', 'Study Table', 'Wardrobe', 'Ceiling Fan', 'Exhaust Fan', 'Laundry Machine', 'Ironing Board']
};

const departments = ['Mech', 'CSE', 'Civil', 'ECE', 'COE', 'IT', 'AI&DS', 'AIML', 'CSBS', 'Cybersecurity', 'BME', 'EEE', 'ACCOUNTS'];
const statuses = ['Active', 'In Repair', 'Disposed'];
const vendors = ['TCS Supplier', 'Local Merchants API', 'Hardware Store', 'Cloud Services inc.', 'EduTech Global', 'Campus Solutions', 'Furniture Direct'];

let csvHeader = 'id,name,category,department,status,purchaseDate,vendor,cost,serialNumber,description,qrCode\n';
let counter = 1;

for (const cat of categories) {
    const items = categoryMapping[cat];
    const numAssets = Math.floor(Math.random() * 11) + 10; // Between 10 and 20

    for (let i = 0; i < numAssets; i++) {
        const id = `AST-${String(counter).padStart(4, '0')}`;
        const name = items[Math.floor(Math.random() * items.length)];
        const category = cat;
        const department = departments[Math.floor(Math.random() * departments.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const year = 2018 + Math.floor(Math.random() * 6);
        const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
        const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
        const purchaseDate = `${year}-${month}-${day}`;
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const cost = Math.floor(1000 + Math.random() * 100000);
        const serialNumber = 'SN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const description = `${status} ${name} used by ${department}`;
        const qrCode = `qr-${id}`;

        csvHeader += `${id},${name},${category},${department},${status},${purchaseDate},${vendor},${cost},${serialNumber},${description},${qrCode}\n`;
        counter++;
    }
}

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'assets.csv'), csvHeader);
console.log('Successfully generated ' + (counter - 1) + ' random assets with unique QR codes into assets.csv.');

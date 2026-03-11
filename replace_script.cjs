const fs = require('fs');
const file = 'src/pages/Assets.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. imports
content = content.replace(
    "import { Search, Filter, Plus, Eye, Edit, Repeat, QrCode as QrCodeIcon, X, Download, Activity } from 'lucide-react';",
    "import { Search, Filter, Plus, Eye, Edit, Repeat, QrCode as QrCodeIcon, X, Download, Activity, GraduationCap, Monitor, Library, Building, Coffee, Bus, PlusSquare, Trophy, Mic, Wrench, ArrowLeft } from 'lucide-react';"
);

// 2. Category Maps
const mapCode = `
const categoryMapping = {
    // IT Infrastructure
    'Desktop Computer': 'IT Infrastructure', 'Laptop': 'IT Infrastructure', 'Workstation Computer': 'IT Infrastructure', 'Server': 'IT Infrastructure', 'Backup Server': 'IT Infrastructure', 'Network Switch': 'IT Infrastructure', 'Router': 'IT Infrastructure', 'Wi-Fi Access Point': 'IT Infrastructure', 'Firewall Device': 'IT Infrastructure', 'Network Rack': 'IT Infrastructure', 'Patch Panel': 'IT Infrastructure', 'UPS': 'IT Infrastructure', 'Power Distribution Unit': 'IT Infrastructure', 'External Hard Drive': 'IT Infrastructure', 'Network Attached Storage (NAS)': 'IT Infrastructure', 'Printer': 'IT Infrastructure', 'Scanner': 'IT Infrastructure', 'Biometric Device': 'IT Infrastructure', 'Video Conferencing System': 'IT Infrastructure', 'Data Backup System': 'IT Infrastructure',
    // Library
    'Bookshelf': 'Library', 'Library Book Collection': 'Library', 'Reference Books': 'Library', 'Journals': 'Library', 'Reading Table': 'Library', 'Reading Chair': 'Library', 'Library Computer': 'Library', 'Barcode Scanner': 'Library', 'Book Issue Counter': 'Library', 'Digital Library System': 'Library', 'Library Printer': 'Library', 'Book Trolley': 'Library', 'Newspaper Stand': 'Library', 'Magazine Rack': 'Library', 'Catalog System': 'Library',
    // Food Facility
    'Dining Table': 'Food Facility', 'Dining Chair': 'Food Facility', 'Serving Counter': 'Food Facility', 'Food Warmer': 'Food Facility', 'Cooking Stove': 'Food Facility', 'LPG Cylinder': 'Food Facility', 'Refrigerator': 'Food Facility', 'Deep Freezer': 'Food Facility', 'Storage Rack': 'Food Facility', 'Kitchen Exhaust System': 'Food Facility', 'Mixer Grinder': 'Food Facility', 'Food Preparation Table': 'Food Facility', 'Dish Washing Machine': 'Food Facility', 'Water Dispenser': 'Food Facility', 'Hand Wash Station': 'Food Facility',
    // Transport
    'College Bus': 'Transport', 'Mini Bus': 'Transport', 'Staff Van': 'Transport', 'Ambulance': 'Transport', 'Electric Campus Vehicle': 'Transport', 'Bus GPS System': 'Transport', 'Bus CCTV Camera': 'Transport', 'Bus Ticket Machine': 'Transport', 'Fuel Storage Tank': 'Transport', 'Vehicle Maintenance Tools': 'Transport',
    // Medical
    'Hospital Bed': 'Medical', 'First Aid Kit': 'Medical', 'Wheelchair': 'Medical', 'Stretcher': 'Medical', 'Oxygen Cylinder': 'Medical', 'Blood Pressure Monitor': 'Medical', 'Thermometer': 'Medical', 'ECG Machine': 'Medical', 'Glucose Monitor': 'Medical', 'Medical Cabinet': 'Medical', 'Patient Monitoring System': 'Medical', 'Medicine Refrigerator': 'Medical',
    // Sports
    'Cricket Kit': 'Sports', 'Football': 'Sports', 'Basketball': 'Sports', 'Volleyball': 'Sports', 'Volleyball Net': 'Sports', 'Badminton Racket': 'Sports', 'Shuttlecock Box': 'Sports', 'Table Tennis Table': 'Sports', 'Table Tennis Bat': 'Sports', 'Gym Treadmill': 'Sports', 'Exercise Bike': 'Sports', 'Dumbbells Set': 'Sports', 'Weight Bench': 'Sports', 'Yoga Mats': 'Sports', 'Sports Scoreboard': 'Sports',
    // Event Infrastructure
    'Auditorium Stage': 'Event Infrastructure', 'Auditorium Chairs': 'Event Infrastructure', 'Conference Table': 'Event Infrastructure', 'Podium': 'Event Infrastructure', 'Microphone': 'Event Infrastructure', 'Wireless Microphone': 'Event Infrastructure', 'Sound Mixer': 'Event Infrastructure', 'Speaker System': 'Event Infrastructure', 'Projector': 'Event Infrastructure', 'LED Display Screen': 'Event Infrastructure', 'Stage Lighting': 'Event Infrastructure', 'Video Recording Camera': 'Event Infrastructure', 'Event Control Console': 'Event Infrastructure',
    // Campus Utilities
    'CCTV Camera': 'Campus Utilities', 'Security Monitoring System': 'Campus Utilities', 'Fire Extinguisher': 'Campus Utilities', 'Fire Alarm System': 'Campus Utilities', 'Generator': 'Campus Utilities', 'Solar Panel System': 'Campus Utilities', 'Water Tank': 'Campus Utilities', 'Water Purifier': 'Campus Utilities', 'Drinking Water Cooler': 'Campus Utilities', 'Public Address System': 'Campus Utilities', 'Parking Barrier Gate': 'Campus Utilities', 'Security Cabin': 'Campus Utilities', 'Street Lights': 'Campus Utilities', 'Garbage Disposal System': 'Campus Utilities', 'Waste Segregation Bins': 'Campus Utilities',
};

const getAssetCategory = (asset) => {
    return categoryMapping[asset.name] || 'Academic'; 
};

const assetCategoriesList = [
    { name: 'Academic', icon: GraduationCap },
    { name: 'IT Infrastructure', icon: Monitor },
    { name: 'Library', icon: Library },
    { name: 'Hostel', icon: Building },
    { name: 'Food Facility', icon: Coffee },
    { name: 'Transport', icon: Bus },
    { name: 'Medical', icon: PlusSquare },
    { name: 'Sports', icon: Trophy },
    { name: 'Event Infrastructure', icon: Mic },
    { name: 'Campus Utilities', icon: Wrench },
];

function Assets() {
    const [selectedCategory, setSelectedCategory] = useState(null);`;

content = content.replace("function Assets() {", mapCode);

// 3. filteredAssets
const filterOld = `    const filteredAssets = assets.filter(a => {
        const sMatch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const dMatch = filterDept === 'All' || a.department === filterDept;
        return sMatch && dMatch;
    });`;
const filterNew = `    const filteredAssets = assets.filter(a => {
        const cMatch = selectedCategory ? getAssetCategory(a) === selectedCategory : true;
        const sMatch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const dMatch = filterDept === 'All' || a.department === filterDept;
        return cMatch && sMatch && dMatch;
    });
    
    const getCategoryCount = (catName) => {
        return assets.filter(a => getAssetCategory(a) === catName).length;
    };`;
content = content.replace(filterOld, filterNew);


// 4. Render block main structure
const renderOld = `            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primaryText">Asset Management</h2>
                <button onClick={() => setIsAddOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm">
                    <Plus size={16} className="mr-2" /> New Asset
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col h-full max-h-[calc(100vh-160px)]">`;
const renderNew = `            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-primaryText">College Asset Management</h2>
                    {selectedCategory && (
                        <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 hover:underline flex items-center mt-1">
                            <ArrowLeft size={14} className="mr-1" /> Back to Categories
                        </button>
                    )}
                </div>
                <button onClick={() => setIsAddOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 transition shadow-sm">
                    <Plus size={16} className="mr-2" /> New Asset
                </button>
            </div>

            {!selectedCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-6" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    {assetCategoriesList.map((cat) => {
                        const Icon = cat.icon;
                        const count = getCategoryCount(cat.name);
                        return (
                            <div 
                                key={cat.name} 
                                onClick={() => setSelectedCategory(cat.name)}
                                className="bg-white rounded-xl shadow-sm border border-borderContent p-6 cursor-pointer hover:shadow-md hover:border-primary transition-all duration-200 flex flex-col items-center justify-center text-center group min-h-[160px]"
                            >
                                <div className="p-4 rounded-full bg-blue-50 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Icon size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-primaryText mb-1">{cat.name}</h3>
                                <p className="text-secondaryText text-sm font-medium">{count} Assets</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-borderContent flex flex-col h-full max-h-[calc(100vh-160px)]">`;

content = content.replace(renderOld, renderNew);

// 5. Close the conditional render for Table view.
const closeTableOld = `                <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText rounded-b-xl flex justify-between items-center">
                    <span>Showing {filteredAssets.length} of {assets.length} assets</span>
                </div>
            </div>

            {/* View Asset Lifecycle Modal */}`;

const closeTableNew = `                <div className="px-6 py-3 border-t border-borderContent bg-gray-50 text-xs text-secondaryText rounded-b-xl flex justify-between items-center">
                    <span>Showing {filteredAssets.length} of {assets.filter(a => getAssetCategory(a) === selectedCategory).length} assets in {selectedCategory}</span>
                </div>
            </div>
            )}

            {/* View Asset Lifecycle Modal */}`;

content = content.replace(closeTableOld, closeTableNew);

fs.writeFileSync(file, content);
console.log("Assets.jsx updated.");

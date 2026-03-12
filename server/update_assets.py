import csv
import random

asset_file = r"c:\Users\tharun\Downloads\assetflow\src\data\assets.csv"

# Category base prices (INR)
base_prices = {
    'Oscilloscope': 150000,
    'Whiteboard': 15000,
    'Student Desk': 12000,
    'Drawing Board': 8000,
    'Teacher Desk': 25000,
    'Printer': 65000,
    'Workstation Computer': 120000,
    'Biometric Device': 15000,
    'Desktop Computer': 55000,
    'Wi-Fi Access Point': 25000,
    'Network Switch': 80000,
    'Scanner': 40000,
    'Book Trolley': 12000,
    'Library Book Collection': 500000,
    'Reading Table': 30000,
    'Journals': 50000,
    'Reading Chair': 8000,
    'Library Computer': 55000,
    'Barcode Scanner': 5000,
    'Exhaust Fan': 3000,
    'Ironing Board': 4000,
    'Bunk Bed': 25000,
    'Single Bed': 15000,
    'Ceiling Fan': 2500,
    'Laundry Machine': 80000,
    'Study Table': 10000,
    'Deep Freezer': 120000,
    'Cooking Stove': 85000,
    'Food Warmer': 45000,
    'Dining Table': 60000,
    'Refrigerator': 40000,
    'Bus CCTV Camera': 25000,
    'Staff Van': 1600000,
    'Ambulance': 2200000,
    'Bus': 3200000,  # Updated from Mini Bus
    'Mini Bus': 3200000, # Fallback mapper
    'Electric Campus Vehicle': 350000,
    'ECG Machine': 150000,
    'Oxygen Cylinder': 12000,
    'Blood Pressure Monitor': 5000,
    'Wheelchair': 18000,
    'First Aid Kit': 3000,
    'Stretcher': 25000,
    'Football': 1500,
    'Table Tennis Table': 35000,
    'Cricket Kit': 25000,
    'Badminton Racket': 3500,
    'Basketball': 1500,
    'Volleyball': 1200,
    'Gym Treadmill': 150000,
    'Projector': 65000,
    'Auditorium Chairs': 8000,
    'Sound Mixer': 120000,
    'Auditorium Stage': 300000,
    'Podium': 25000,
    'Conference Table': 150000,
    'Speaker System': 250000,
    'LED Display Screen': 450000,
    'Generator': 800000,
    'CCTV Camera': 15000,
    'Water Purifier': 45000,
    'Solar Panel System': 1500000,
    'Drinking Water Cooler': 35000,
    'Fire Alarm System': 250000,
    'Water Tank': 50000,
    'Dell Desktop System': 65000
}

rows = []
with open(asset_file, 'r', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    for row in reader:
        name = row['name']
        
        # Specific rename task
        if name == 'Mini Bus':
            name = 'Bus'
            row['name'] = 'Bus'
            row['description'] = row['description'].replace('Mini Bus', 'Ashok Leyland Viking / Tata LPO 50-Seater Bus (TN 85 Reg)')
        
        # Special logic for Ambulance description
        if name == 'Ambulance':
            row['description'] = row['description'].replace('Ambulance', 'Force Traveller / Tata Winger Advanced Life Support Ambulance')

        # Generate realistic price with +/- 5% variance to not look entirely fake
        if name in base_prices:
            base = base_prices[name]
            deviation = int(base * 0.05)
            # Use deterministic seed based on ID for consistency if re-run
            random.seed(row['id'])
            realistic_price = base + random.randint(-deviation, deviation)
            row['cost'] = str(realistic_price)
            
        rows.append(row)

with open(asset_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)

print("Successfully updated asset prices and categories.")

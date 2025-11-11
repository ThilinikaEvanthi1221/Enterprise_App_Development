const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../backend/.env') });
const { Part, InventoryTransaction } = require('../models');
const INVENTORY_CONFIG = require('../config/inventoryConfig');

// Employee ID from the token
const EMPLOYEE_ID = '690b532d8a3e862fcfecf4cc';
const employeeObjectId = new mongoose.Types.ObjectId(EMPLOYEE_ID);

const sampleParts = [
  {
    partNumber: 'ENG-001',
    name: 'Oil Filter',
    description: 'Standard oil filter for most vehicles',
    category: 'Engine',
    manufacturer: 'Mann Filter',
    supplier: 'Auto Parts Supplier',
    currentStock: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 850,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'A',
      shelf: '1',
      bin: '3'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'BRK-001',
    name: 'Brake Pads',
    description: 'Front brake pads - ceramic',
    category: 'Brakes',
    manufacturer: 'Brembo',
    supplier: 'Brake Parts Inc',
    currentStock: 8,
    minStockLevel: 8,
    maxStockLevel: 40,
    unitPrice: 1200,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'B',
      shelf: '2',
      bin: '5'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'ELEC-001',
    name: 'Spark Plugs',
    description: 'Iridium spark plugs',
    category: 'Electrical',
    manufacturer: 'NGK',
    supplier: 'Electrical Parts Co',
    currentStock: 15,
    minStockLevel: 20,
    maxStockLevel: 100,
    unitPrice: 450,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'C',
      shelf: '1',
      bin: '2'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'BODY-001',
    name: 'Side Mirror',
    description: 'Universal side mirror - right',
    category: 'Body',
    manufacturer: 'Generic',
    supplier: 'Body Parts Ltd',
    currentStock: 3,
    minStockLevel: 5,
    maxStockLevel: 20,
    unitPrice: 2500,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'D',
      shelf: '3',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'COOL-001',
    name: 'Radiator',
    description: 'Aluminum radiator',
    category: 'Cooling',
    manufacturer: 'Spectra Premium',
    supplier: 'Cooling Systems Inc',
    currentStock: 2,
    minStockLevel: 5,
    maxStockLevel: 15,
    unitPrice: 3500,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'E',
      shelf: '1',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'ENG-002',
    name: 'Air Filter',
    description: 'High-flow air filter',
    category: 'Engine',
    manufacturer: 'K&N',
    supplier: 'Auto Parts Supplier',
    currentStock: 12,
    minStockLevel: 15,
    maxStockLevel: 60,
    unitPrice: 650,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'A',
      shelf: '1',
      bin: '4'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'BRK-002',
    name: 'Brake Rotors',
    description: 'Front brake rotors - vented',
    category: 'Brakes',
    manufacturer: 'Brembo',
    supplier: 'Brake Parts Inc',
    currentStock: 4,
    minStockLevel: 6,
    maxStockLevel: 30,
    unitPrice: 2200,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'B',
      shelf: '2',
      bin: '6'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'ELEC-002',
    name: 'Battery',
    description: '12V 60Ah car battery',
    category: 'Electrical',
    manufacturer: 'Bosch',
    supplier: 'Electrical Parts Co',
    currentStock: 3,
    minStockLevel: 5,
    maxStockLevel: 20,
    unitPrice: 4500,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'C',
      shelf: '2',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'SUSP-001',
    name: 'Shock Absorber',
    description: 'Front shock absorber - gas',
    category: 'Suspension',
    manufacturer: 'Monroe',
    supplier: 'Suspension Parts Ltd',
    currentStock: 6,
    minStockLevel: 8,
    maxStockLevel: 25,
    unitPrice: 1800,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'F',
      shelf: '1',
      bin: '2'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'TRANS-001',
    name: 'Transmission Filter',
    description: 'Automatic transmission filter kit',
    category: 'Transmission',
    manufacturer: 'ACDelco',
    supplier: 'Transmission Parts Co',
    currentStock: 10,
    minStockLevel: 10,
    maxStockLevel: 40,
    unitPrice: 950,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'G',
      shelf: '1',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'BODY-002',
    name: 'Headlight Assembly',
    description: 'LED headlight assembly - left',
    category: 'Body',
    manufacturer: 'TYC',
    supplier: 'Body Parts Ltd',
    currentStock: 2,
    minStockLevel: 4,
    maxStockLevel: 15,
    unitPrice: 3200,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'D',
      shelf: '3',
      bin: '2'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'COOL-002',
    name: 'Coolant Hose',
    description: 'Upper radiator hose',
    category: 'Cooling',
    manufacturer: 'Gates',
    supplier: 'Cooling Systems Inc',
    currentStock: 8,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 550,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'E',
      shelf: '1',
      bin: '2'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'TIRE-001',
    name: 'All-Season Tire',
    description: '205/55R16 all-season tire',
    category: 'Exterior',
    manufacturer: 'Michelin',
    supplier: 'Tire Warehouse',
    currentStock: 4,
    minStockLevel: 12,
    maxStockLevel: 48,
    unitPrice: 2800,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'H',
      shelf: '1',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'EXHA-001',
    name: 'Muffler',
    description: 'Stainless steel muffler',
    category: 'Engine',
    manufacturer: 'Walker',
    supplier: 'Exhaust Parts Inc',
    currentStock: 3,
    minStockLevel: 5,
    maxStockLevel: 20,
    unitPrice: 2750,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'I',
      shelf: '1',
      bin: '1'
    },
    createdBy: employeeObjectId
  },
  {
    partNumber: 'FUEL-001',
    name: 'Fuel Pump',
    description: 'Electric fuel pump assembly',
    category: 'Fuel',
    manufacturer: 'Bosch',
    supplier: 'Fuel Systems Co',
    currentStock: 2,
    minStockLevel: 5,
    maxStockLevel: 15,
    unitPrice: 5500,
    currency: 'LKR',
    location: {
      warehouse: 'Main Warehouse',
      section: 'J',
      shelf: '1',
      bin: '1'
    },
    createdBy: employeeObjectId
  }
];

async function seedInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Check if data already exists
    const existingParts = await Part.countDocuments({ createdBy: employeeObjectId });
    if (existingParts > 0) {
      console.log(`\n⚠️  Data already exists for employee ${EMPLOYEE_ID}`);
      console.log(`Found ${existingParts} existing parts.`);
      console.log('Skipping seed to preserve existing data.');
      console.log('\nTo re-seed, manually delete the data first or modify this script.\n');
      process.exit(0);
    }

    // Insert sample parts
    const createdParts = await Part.insertMany(sampleParts);
    console.log(`✓ Created ${createdParts.length} sample parts`);

    // Create sample transactions for the employee
    const sampleTransactions = [];
    const transactionDates = [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    ];

    // Transaction 1: Received Oil Filters (IN)
    sampleTransactions.push({
      part: createdParts[0]._id, // Oil Filter
      transactionType: 'IN',
      quantity: 15,
      previousStock: 10,
      newStock: 25,
      unitPrice: 850,
      reference: 'PO-2024-001',
      notes: 'Received shipment from supplier',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[0],
      createdAt: transactionDates[0],
      updatedAt: transactionDates[0]
    });

    // Transaction 2: Used Brake Pads for service (OUT)
    sampleTransactions.push({
      part: createdParts[1]._id, // Brake Pads
      transactionType: 'OUT',
      quantity: 5,
      previousStock: 13,
      newStock: 8,
      unitPrice: 1200,
      reference: 'WO-2024-056',
      notes: 'Used for brake service on vehicle #1234',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[1],
      createdAt: transactionDates[1],
      updatedAt: transactionDates[1]
    });

    // Transaction 3: Received Spark Plugs (IN)
    sampleTransactions.push({
      part: createdParts[2]._id, // Spark Plugs
      transactionType: 'IN',
      quantity: 10,
      previousStock: 5,
      newStock: 15,
      unitPrice: 450,
      reference: 'PO-2024-002',
      notes: 'Bulk order received',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[2],
      createdAt: transactionDates[2],
      updatedAt: transactionDates[2]
    });

    // Transaction 4: Stock adjustment for Battery (ADJUSTMENT)
    sampleTransactions.push({
      part: createdParts[7]._id, // Battery
      transactionType: 'ADJUSTMENT',
      quantity: 1,
      previousStock: 4,
      newStock: 3,
      unitPrice: 4500,
      reference: 'ADJ-2024-001',
      notes: 'Physical count correction',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[3],
      createdAt: transactionDates[3],
      updatedAt: transactionDates[3]
    });

    // Transaction 5: Used Transmission Filter (OUT)
    sampleTransactions.push({
      part: createdParts[9]._id, // Transmission Filter
      transactionType: 'OUT',
      quantity: 2,
      previousStock: 12,
      newStock: 10,
      unitPrice: 950,
      reference: 'WO-2024-067',
      notes: 'Transmission service',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[4],
      createdAt: transactionDates[4],
      updatedAt: transactionDates[4]
    });

    // Transaction 6: Received Tires (IN)
    sampleTransactions.push({
      part: createdParts[12]._id, // All-Season Tire
      transactionType: 'IN',
      quantity: 4,
      previousStock: 0,
      newStock: 4,
      unitPrice: 2800,
      reference: 'PO-2024-003',
      notes: 'New tire shipment',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[4],
      createdAt: transactionDates[4],
      updatedAt: transactionDates[4]
    });

    // Transaction 7: Damaged Headlight (DAMAGE)
    sampleTransactions.push({
      part: createdParts[10]._id, // Headlight Assembly
      transactionType: 'DAMAGE',
      quantity: 1,
      previousStock: 3,
      newStock: 2,
      unitPrice: 3200,
      reference: 'DMG-2024-001',
      notes: 'Dropped during handling',
      performedBy: employeeObjectId,
      approvedBy: employeeObjectId,
      isApproved: true,
      approvalDate: transactionDates[4],
      createdAt: transactionDates[4],
      updatedAt: transactionDates[4]
    });

    const createdTransactions = await InventoryTransaction.insertMany(sampleTransactions);
    console.log(`✓ Created ${createdTransactions.length} sample transactions`);

    // Display summary
    console.log('\n=== Inventory Summary ===');
    const total = await Part.countDocuments({ isActive: true });
    const lowStock = await Part.countDocuments({ 
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });
    const totalValue = createdParts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0);

    console.log(`Total Parts: ${total}`);
    console.log(`Low Stock Parts: ${lowStock}`);
    console.log(`Total Inventory Value: LKR ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    console.log('\n=== Transaction Summary ===');
    const transactionsByType = await InventoryTransaction.aggregate([
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);
    
    transactionsByType.forEach(type => {
      console.log(`${type._id}: ${type.count} transactions, ${type.totalQuantity} items`);
    });

    console.log('\n=== Parts by Category ===');
    const partsByCategory = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    partsByCategory.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} parts, LKR ${cat.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    });

    console.log('\n✓ Inventory seeding completed successfully!');
    console.log(`All transactions performed by employee: ${EMPLOYEE_ID}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory();


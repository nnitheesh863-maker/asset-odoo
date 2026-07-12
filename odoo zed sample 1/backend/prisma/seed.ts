import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Department from '../src/models/Department';
import Employee from '../src/models/Employee';
import AssetCategory from '../src/models/AssetCategory';
import Asset from '../src/models/Asset';
import AssetAllocation from '../src/models/AssetAllocation';
import TransferRequest from '../src/models/TransferRequest';
import MaintenanceRequest from '../src/models/MaintenanceRequest';
import Booking from '../src/models/Booking';
import Notification from '../src/models/Notification';
import ActivityLog from '../src/models/ActivityLog';
import AuditCycle from '../src/models/AuditCycle';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assetflow';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clean existing data
  await Promise.all([
    Department.deleteMany({}),
    Employee.deleteMany({}),
    AssetCategory.deleteMany({}),
    Asset.deleteMany({}),
    AssetAllocation.deleteMany({}),
    TransferRequest.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    Booking.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    AuditCycle.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // Create Departments
  const departments = await Department.insertMany([
    { name: 'Engineering', description: 'Software development and engineering' },
    { name: 'Human Resources', description: 'HR and people operations' },
    { name: 'Finance', description: 'Financial operations and accounting' },
    { name: 'Marketing', description: 'Marketing and communications' },
  ]);
  console.log('Departments created.');

  // Create Employees
  const password = await bcrypt.hash('password123', 12);

  const employees = await Employee.insertMany([
    {
      employeeId: 'EMP-0001',
      name: 'Admin User',
      email: 'admin@assetflow.com',
      password,
      phone: '+1-555-0100',
      departmentId: departments[0]._id,
      role: 'ADMIN',
    },
    {
      employeeId: 'EMP-0002',
      name: 'Sarah Mitchell',
      email: 'manager@assetflow.com',
      password,
      phone: '+1-555-0101',
      departmentId: departments[0]._id,
      role: 'ASSET_MANAGER',
    },
    {
      employeeId: 'EMP-0003',
      name: 'James Rodriguez',
      email: 'head@assetflow.com',
      password,
      phone: '+1-555-0102',
      departmentId: departments[0]._id,
      role: 'DEPARTMENT_HEAD',
    },
    {
      employeeId: 'EMP-0004',
      name: 'Emily Chen',
      email: 'employee@assetflow.com',
      password,
      phone: '+1-555-0103',
      departmentId: departments[0]._id,
      role: 'EMPLOYEE',
    },
    {
      employeeId: 'EMP-0005',
      name: 'Michael Brown',
      email: 'michael@assetflow.com',
      password,
      phone: '+1-555-0104',
      departmentId: departments[1]._id,
      role: 'EMPLOYEE',
    },
    {
      employeeId: 'EMP-0006',
      name: 'Lisa Wang',
      email: 'lisa@assetflow.com',
      password,
      phone: '+1-555-0105',
      departmentId: departments[2]._id,
      role: 'EMPLOYEE',
    },
  ]);
  console.log('Employees created.');

  // Update department heads
  await Department.findByIdAndUpdate(departments[0]._id, { departmentHead: employees[2]._id });
  console.log('Department heads assigned.');

  // Create Asset Categories
  const categories = await AssetCategory.insertMany([
    { name: 'Laptop', description: 'Portable computers' },
    { name: 'Desktop', description: 'Desktop computers' },
    { name: 'Vehicle', description: 'Company vehicles' },
    { name: 'Furniture', description: 'Office furniture' },
    { name: 'Peripheral', description: 'Input/output devices' },
  ]);
  console.log('Asset categories created.');

  // Create Assets
  const assets = await Asset.insertMany([
    {
      assetTag: 'AF-0001',
      assetName: 'MacBook Pro 14"',
      serialNumber: 'SN-MBP-001',
      categoryId: categories[0]._id,
      acquisitionDate: new Date('2024-01-15'),
      acquisitionCost: 2499,
      warranty: '3 years',
      location: 'HQ Floor 3',
      condition: 'NEW',
      status: 'ALLOCATED',
      sharedBookable: false,
      departmentId: departments[0]._id,
    },
    {
      assetTag: 'AF-0002',
      assetName: 'Dell XPS 15',
      serialNumber: 'SN-DLP-002',
      categoryId: categories[0]._id,
      acquisitionDate: new Date('2024-02-20'),
      acquisitionCost: 1899,
      warranty: '2 years',
      location: 'HQ Floor 3',
      condition: 'GOOD',
      status: 'AVAILABLE',
      sharedBookable: false,
      departmentId: departments[0]._id,
    },
    {
      assetTag: 'AF-0003',
      assetName: 'LG UltraWide 34"',
      serialNumber: 'SN-LGW-003',
      categoryId: categories[4]._id,
      acquisitionDate: new Date('2024-03-10'),
      acquisitionCost: 899,
      warranty: '1 year',
      location: 'HQ Floor 3',
      condition: 'NEW',
      status: 'ALLOCATED',
      sharedBookable: true,
      departmentId: departments[0]._id,
    },
    {
      assetTag: 'AF-0004',
      assetName: 'Logitech MX Keys',
      serialNumber: 'SN-LMX-004',
      categoryId: categories[4]._id,
      acquisitionDate: new Date('2024-01-20'),
      acquisitionCost: 120,
      warranty: '1 year',
      location: 'HQ Floor 3',
      condition: 'GOOD',
      status: 'AVAILABLE',
      sharedBookable: true,
      departmentId: departments[0]._id,
    },
    {
      assetTag: 'AF-0005',
      assetName: 'Herman Miller Chair',
      serialNumber: 'SN-HMC-005',
      categoryId: categories[3]._id,
      acquisitionDate: new Date('2023-06-01'),
      acquisitionCost: 1400,
      warranty: '12 years',
      location: 'HQ Floor 2',
      condition: 'GOOD',
      status: 'ALLOCATED',
      sharedBookable: false,
      departmentId: departments[0]._id,
    },
    {
      assetTag: 'AF-0006',
      assetName: 'Honda Civic',
      serialNumber: 'SN-HCV-006',
      categoryId: categories[2]._id,
      acquisitionDate: new Date('2023-09-15'),
      acquisitionCost: 25000,
      warranty: '3 years',
      location: 'Parking Lot A',
      condition: 'GOOD',
      status: 'AVAILABLE',
      sharedBookable: true,
      departmentId: departments[1]._id,
    },
    {
      assetTag: 'AF-0007',
      assetName: 'HP LaserJet Pro',
      serialNumber: 'SN-HPL-007',
      categoryId: categories[4]._id,
      acquisitionDate: new Date('2024-04-01'),
      acquisitionCost: 450,
      warranty: '1 year',
      location: 'HQ Floor 1',
      condition: 'NEW',
      status: 'UNDER_MAINTENANCE',
      sharedBookable: true,
      departmentId: departments[1]._id,
    },
    {
      assetTag: 'AF-0008',
      assetName: 'ThinkPad X1 Carbon',
      serialNumber: 'SN-TPX-008',
      categoryId: categories[0]._id,
      acquisitionDate: new Date('2024-05-10'),
      acquisitionCost: 1999,
      warranty: '3 years',
      location: 'HQ Floor 2',
      condition: 'FAIR',
      status: 'AVAILABLE',
      sharedBookable: false,
      departmentId: departments[2]._id,
    },
  ]);
  console.log('Assets created.');

  // Create Allocations
  await AssetAllocation.insertMany([
    {
      assetId: assets[0]._id,
      employeeId: employees[3]._id,
      departmentId: departments[0]._id,
      allocatedDate: new Date('2024-02-01'),
      expectedReturnDate: new Date('2025-12-31'),
      status: 'ACTIVE',
    },
    {
      assetId: assets[2]._id,
      employeeId: employees[3]._id,
      departmentId: departments[0]._id,
      allocatedDate: new Date('2024-03-15'),
      expectedReturnDate: new Date('2025-06-30'),
      status: 'ACTIVE',
    },
    {
      assetId: assets[4]._id,
      employeeId: employees[3]._id,
      departmentId: departments[0]._id,
      allocatedDate: new Date('2023-07-01'),
      expectedReturnDate: new Date('2025-01-15'),
      status: 'ACTIVE',
    },
  ]);
  console.log('Allocations created.');

  // Create Transfer Request
  await TransferRequest.create({
    requesterId: employees[4]._id,
    assetId: assets[1]._id,
    currentHolderId: employees[3]._id,
    newHolderId: employees[4]._id,
    reason: 'Need for new project work',
    approvalStatus: 'PENDING',
  });
  console.log('Transfer request created.');

  // Create Maintenance Requests
  await MaintenanceRequest.insertMany([
    {
      assetId: assets[6]._id,
      employeeId: employees[4]._id,
      issue: 'Paper jamming frequently, print quality degraded',
      priority: 'HIGH',
      approvalStatus: 'APPROVED',
      progressStatus: 'IN_PROGRESS',
      technicianId: employees[1]._id,
    },
    {
      assetId: assets[7]._id,
      employeeId: employees[5]._id,
      issue: 'Battery not holding charge',
      priority: 'MEDIUM',
      approvalStatus: 'PENDING',
      progressStatus: 'PENDING',
    },
  ]);
  console.log('Maintenance requests created.');

  // Create Bookings
  await Booking.create({
    resourceId: assets[3]._id,
    employeeId: employees[5]._id,
    startTime: new Date('2025-02-01T09:00:00'),
    endTime: new Date('2025-02-01T17:00:00'),
    status: 'CONFIRMED',
  });
  console.log('Bookings created.');

  // Create Notifications
  await Notification.insertMany([
    { title: 'Welcome to AssetFlow', message: 'Your account has been created successfully', userId: employees[3]._id, type: 'GENERAL' },
    { title: 'Asset Assigned', message: 'MacBook Pro 14" has been assigned to you', userId: employees[3]._id, type: 'GENERAL' },
    { title: 'Transfer Pending', message: 'A transfer request for Dell XPS 15 needs your attention', userId: employees[1]._id, type: 'TRANSFER_REQUEST' },
    { title: 'Maintenance Update', message: 'HP LaserJet Pro maintenance is in progress', userId: employees[4]._id, type: 'MAINTENANCE_REQUEST' },
    { title: 'Overdue Return', message: 'Herman Miller Chair return is overdue', userId: employees[3]._id, type: 'OVERDUE' },
  ]);
  console.log('Notifications created.');

  // Create Activity Logs
  await ActivityLog.insertMany([
    { userId: employees[0]._id, action: 'CREATED', module: 'DEPARTMENT', details: { name: 'Engineering' }, timestamp: new Date() },
    { userId: employees[0]._id, action: 'CREATED', module: 'EMPLOYEE', details: { name: 'Emily Chen' }, timestamp: new Date() },
    { userId: employees[1]._id, action: 'CREATED', module: 'ASSET', details: { assetTag: 'AF-0001' }, timestamp: new Date() },
    { userId: employees[1]._id, action: 'ALLOCATED', module: 'ASSET', details: { assetTag: 'AF-0001' }, timestamp: new Date() },
    { userId: employees[4]._id, action: 'CREATED', module: 'TRANSFER_REQUEST', details: { assetTag: 'AF-0002' }, timestamp: new Date() },
    { userId: employees[4]._id, action: 'CREATED', module: 'MAINTENANCE_REQUEST', details: { assetTag: 'AF-0007' }, timestamp: new Date() },
    { userId: employees[1]._id, action: 'APPROVED', module: 'MAINTENANCE', details: { assetTag: 'AF-0007' }, timestamp: new Date() },
  ]);
  console.log('Activity logs created.');

  // Create Audit Cycle
  await AuditCycle.create({
    cycleName: 'Q1 2025 Engineering Audit',
    departmentId: departments[0]._id,
    location: 'HQ Floor 3',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31'),
    auditorIds: [employees[0]._id, employees[1]._id],
  });
  console.log('Audit cycle created.');

  console.log('\n--- Seed complete! ---');
  console.log('Login credentials:');
  console.log('Admin:        admin@assetflow.com / password123');
  console.log('Manager:      manager@assetflow.com / password123');
  console.log('Dept Head:    head@assetflow.com / password123');
  console.log('Employee:     employee@assetflow.com / password123');
  console.log('HR Employee:  michael@assetflow.com / password123');
  console.log('Finance:      lisa@assetflow.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

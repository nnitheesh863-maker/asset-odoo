const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");
  const managerPassword = await hashPassword("manager123");
  const employeePassword = await hashPassword("employee123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: {},
    create: {
      email: "admin@assetflow.com",
      password: adminPassword,
      firstName: "System",
      lastName: "Administrator",
      phone: "+1-555-0100",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("Created admin user:", admin.email);

  const itDept = await prisma.department.upsert({
    where: { name: "IT" },
    update: {},
    create: {
      name: "IT",
      description: "Information Technology Department",
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: {
      name: "HR",
      description: "Human Resources Department",
    },
  });

  const opsDept = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: {
      name: "Operations",
      description: "Operations Department",
    },
  });
  console.log("Created departments:", itDept.name, hrDept.name, opsDept.name);

  const categories = [];
  const categoryData = [
    { name: "Laptop", description: "Portable computers and notebooks" },
    { name: "Desktop", description: "Desktop computers and workstations" },
    { name: "Vehicle", description: "Company vehicles and fleet" },
    { name: "Furniture", description: "Office furniture and fixtures" },
    { name: "Equipment", description: "General office and industrial equipment" },
  ];

  for (const cat of categoryData) {
    const created = await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(created);
  }
  console.log("Created asset categories:", categories.map((c) => c.name).join(", "));

  const manager1 = await prisma.user.upsert({
    where: { email: "john.manager@assetflow.com" },
    update: {},
    create: {
      email: "john.manager@assetflow.com",
      password: managerPassword,
      firstName: "John",
      lastName: "Smith",
      phone: "+1-555-0201",
      role: "MANAGER",
      departmentId: itDept.id,
      isActive: true,
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: "sarah.manager@assetflow.com" },
    update: {},
    create: {
      email: "sarah.manager@assetflow.com",
      password: managerPassword,
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-555-0202",
      role: "MANAGER",
      departmentId: hrDept.id,
      isActive: true,
    },
  });

  const manager3 = await prisma.user.upsert({
    where: { email: "mike.manager@assetflow.com" },
    update: {},
    create: {
      email: "mike.manager@assetflow.com",
      password: managerPassword,
      firstName: "Mike",
      lastName: "Williams",
      phone: "+1-555-0203",
      role: "MANAGER",
      departmentId: opsDept.id,
      isActive: true,
    },
  });
  console.log("Created managers:", manager1.email, manager2.email, manager3.email);

  await prisma.department.update({
    where: { id: itDept.id },
    data: { managerId: manager1.id },
  });
  await prisma.department.update({
    where: { id: hrDept.id },
    data: { managerId: manager2.id },
  });
  await prisma.department.update({
    where: { id: opsDept.id },
    data: { managerId: manager3.id },
  });

  const employees = [];
  const employeeData = [
    { email: "alice.employee@assetflow.com", firstName: "Alice", lastName: "Brown", departmentId: itDept.id },
    { email: "bob.employee@assetflow.com", firstName: "Bob", lastName: "Davis", departmentId: itDept.id },
    { email: "carol.employee@assetflow.com", firstName: "Carol", lastName: "Wilson", departmentId: hrDept.id },
    { email: "dave.employee@assetflow.com", firstName: "Dave", lastName: "Martinez", departmentId: opsDept.id },
    { email: "eve.employee@assetflow.com", firstName: "Eve", lastName: "Anderson", departmentId: opsDept.id },
  ];

  for (const emp of employeeData) {
    const created = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        password: employeePassword,
        role: "EMPLOYEE",
        isActive: true,
      },
    });
    employees.push(created);
  }
  console.log("Created employees:", employees.map((e) => e.email).join(", "));

  const assetData = [
    { name: "MacBook Pro 14\"", categoryId: categories[0].id, departmentId: itDept.id, createdById: admin.id, assetCode: "AST-LP-001", serialNumber: "MBP2024001", model: "MacBook Pro 14-inch M3", manufacturer: "Apple", purchasePrice: 2499.00, currentValue: 2100.00, location: "IT Storage Room A" },
    { name: "Dell XPS 15", categoryId: categories[0].id, departmentId: itDept.id, createdById: admin.id, assetCode: "AST-LP-002", serialNumber: "DellXPS2024001", model: "XPS 15 9530", manufacturer: "Dell", purchasePrice: 1899.00, currentValue: 1500.00, location: "IT Storage Room A" },
    { name: "HP EliteBook 840", categoryId: categories[0].id, departmentId: hrDept.id, createdById: admin.id, assetCode: "AST-LP-003", serialNumber: "HP8402024001", model: "EliteBook 840 G10", manufacturer: "HP", purchasePrice: 1399.00, currentValue: 1100.00, location: "HR Office" },
    { name: "Lenovo ThinkCentre M920", categoryId: categories[1].id, departmentId: itDept.id, createdById: admin.id, assetCode: "AST-DT-001", serialNumber: "LEN2024001", model: "ThinkCentre M920q", manufacturer: "Lenovo", purchasePrice: 899.00, currentValue: 700.00, location: "IT Lab" },
    { name: "Dell OptiPlex 7090", categoryId: categories[1].id, departmentId: hrDept.id, createdById: admin.id, assetCode: "AST-DT-002", serialNumber: "DELL7090001", model: "OptiPlex 7090", manufacturer: "Dell", purchasePrice: 999.00, currentValue: 800.00, location: "HR Office" },
    { name: "Toyota Camry 2023", categoryId: categories[2].id, departmentId: opsDept.id, createdById: admin.id, assetCode: "AST-VH-001", serialNumber: "TOY2023CAM001", model: "Camry LE", manufacturer: "Toyota", purchasePrice: 28500.00, currentValue: 25000.00, location: "Main Parking Lot" },
    { name: "Ford Transit Van", categoryId: categories[2].id, departmentId: opsDept.id, createdById: admin.id, assetCode: "AST-VH-002", serialNumber: "FRD2023TRN001", model: "Transit 250", manufacturer: "Ford", purchasePrice: 42000.00, currentValue: 38000.00, location: "Warehouse Parking" },
    { name: "Herman Miller Aeron Chair", categoryId: categories[3].id, departmentId: itDept.id, createdById: admin.id, assetCode: "AST-FN-001", serialNumber: "HM2024001", model: "Aeron Size B", manufacturer: "Herman Miller", purchasePrice: 1395.00, currentValue: 1100.00, location: "IT Office" },
    { name: "Standing Desk - Uplift V2", categoryId: categories[3].id, departmentId: hrDept.id, createdById: admin.id, assetCode: "AST-FN-002", serialNumber: "UP2024001", model: "V2 Commercial", manufacturer: "Uplift", purchasePrice: 749.00, currentValue: 600.00, location: "HR Office" },
    { name: "HP LaserJet Enterprise M610", categoryId: categories[4].id, departmentId: opsDept.id, createdById: admin.id, assetCode: "AST-EQ-001", serialNumber: "HP6102024001", model: "LaserJet Enterprise M610dn", manufacturer: "HP", purchasePrice: 649.00, currentValue: 500.00, location: "Main Copy Room" },
  ];

  const assets = [];
  for (const asset of assetData) {
    const created = await prisma.asset.upsert({
      where: { assetCode: asset.assetCode },
      update: {},
      create: {
        ...asset,
        purchaseDate: new Date("2024-01-15"),
        warrantyExpiry: new Date("2027-01-15"),
        status: "AVAILABLE",
        isActive: true,
      },
    });
    assets.push(created);
  }
  console.log("Created assets:", assets.length);

  const allocationData = [
    { assetId: assets[0].id, userId: employees[0].id, allocatedBy: manager1.id, isActive: true },
    { assetId: assets[2].id, userId: employees[2].id, allocatedBy: manager2.id, isActive: true },
    { assetId: assets[3].id, userId: employees[1].id, allocatedBy: manager1.id, isActive: true },
    { assetId: assets[5].id, userId: employees[3].id, allocatedBy: manager3.id, isActive: true },
    { assetId: assets[7].id, userId: employees[0].id, allocatedBy: manager1.id, isActive: true },
  ];

  for (const alloc of allocationData) {
    await prisma.assetAllocation.create({
      data: {
        ...alloc,
        allocatedAt: new Date(),
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.asset.updateMany({
    where: { id: { in: allocationData.map((a) => a.assetId) } },
    data: { status: "ALLOCATED" },
  });
  console.log("Created allocations:", allocationData.length);

  const maintenanceData = [
    {
      assetId: assets[9].id,
      requestedById: employees[3].id,
      status: "REQUESTED",
      priority: "MEDIUM",
      title: "Printer jamming issue",
      description: "The HP LaserJet Enterprise M610 in the copy room keeps jamming when printing double-sided documents. Paper jams occur approximately every 10 pages.",
      estimatedCost: 150.00,
    },
    {
      assetId: assets[4].id,
      requestedById: employees[2].id,
      assignedToId: manager2.id,
      status: "SCHEDULED",
      priority: "LOW",
      title: "Scheduled RAM upgrade",
      description: "Dell OptiPlex 7090 needs RAM upgrade from 8GB to 16GB to support new software requirements for the HR team.",
      estimatedCost: 80.00,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      assetId: assets[1].id,
      requestedById: employees[1].id,
      assignedToId: manager1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      title: "Battery replacement",
      description: "Dell XPS 15 battery drains rapidly, lasting only 30 minutes on full charge. Battery health report shows 42% capacity. Replacement needed urgently as it affects daily productivity.",
      estimatedCost: 120.00,
      actualCost: 115.00,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const maint of maintenanceData) {
    await prisma.maintenanceRequest.create({ data: maint });
  }
  console.log("Created maintenance requests:", maintenanceData.length);

  console.log("Seed completed successfully!");
  console.log("\n--- Login Credentials ---");
  console.log("Admin:     admin@assetflow.com / admin123");
  console.log("Manager 1: john.manager@assetflow.com / manager123");
  console.log("Manager 2: sarah.manager@assetflow.com / manager123");
  console.log("Manager 3: mike.manager@assetflow.com / manager123");
  console.log("Employee:  alice.employee@assetflow.com / employee123");
  console.log("Employee:  bob.employee@assetflow.com / employee123");
  console.log("Employee:  carol.employee@assetflow.com / employee123");
  console.log("Employee:  dave.employee@assetflow.com / employee123");
  console.log("Employee:  eve.employee@assetflow.com / employee123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

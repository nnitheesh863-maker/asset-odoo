export const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'manager', 'employee', 'technician', 'auditor'],
  },
  {
    label: 'Assets',
    path: '/assets',
    icon: 'Package',
    roles: ['admin', 'manager', 'employee', 'technician', 'auditor'],
    children: [
      {
        label: 'All Assets',
        path: '/assets',
        icon: 'Package',
        roles: ['admin', 'manager', 'employee', 'technician', 'auditor'],
      },
      {
        label: 'Add Asset',
        path: '/assets/create',
        icon: 'Plus',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    label: 'Departments',
    path: '/departments',
    icon: 'Building2',
    roles: ['admin', 'manager'],
    children: [
      {
        label: 'All Departments',
        path: '/departments',
        icon: 'Building2',
        roles: ['admin', 'manager'],
      },
      {
        label: 'Add Department',
        path: '/departments/create',
        icon: 'Plus',
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: 'Tags',
    roles: ['admin', 'manager'],
  },
  {
    label: 'Employees',
    path: '/employees',
    icon: 'Users',
    roles: ['admin', 'manager'],
    children: [
      {
        label: 'All Employees',
        path: '/employees',
        icon: 'Users',
        roles: ['admin', 'manager'],
      },
      {
        label: 'Add Employee',
        path: '/employees/create',
        icon: 'UserPlus',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    label: 'Allocations',
    path: '/allocations',
    icon: 'UserCheck',
    roles: ['admin', 'manager', 'employee'],
    children: [
      {
        label: 'All Allocations',
        path: '/allocations',
        icon: 'UserCheck',
        roles: ['admin', 'manager'],
      },
      {
        label: 'New Allocation',
        path: '/allocations/create',
        icon: 'Plus',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    label: 'Transfers',
    path: '/transfers',
    icon: 'ArrowLeftRight',
    roles: ['admin', 'manager'],
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: 'Calendar',
    roles: ['admin', 'manager', 'employee'],
    children: [
      {
        label: 'All Bookings',
        path: '/bookings',
        icon: 'Calendar',
        roles: ['admin', 'manager'],
      },
      {
        label: 'My Bookings',
        path: '/bookings/my',
        icon: 'User',
        roles: ['employee'],
      },
    ],
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: 'Wrench',
    roles: ['admin', 'manager', 'technician'],
    children: [
      {
        label: 'All Tasks',
        path: '/maintenance',
        icon: 'Wrench',
        roles: ['admin', 'manager', 'technician'],
      },
      {
        label: 'Schedule Task',
        path: '/maintenance/create',
        icon: 'Plus',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    label: 'Audits',
    path: '/audits',
    icon: 'ClipboardCheck',
    roles: ['admin', 'manager', 'auditor'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    roles: ['admin', 'manager'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: 'UserCog',
    roles: ['admin'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['admin'],
  },
];

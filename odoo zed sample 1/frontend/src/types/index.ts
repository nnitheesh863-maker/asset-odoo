export type Role = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AssetStatus = 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  departmentId?: string;
  department?: Department;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentDepartment?: string;
  departmentHeadId?: string;
  departmentHead?: User;
  status: UserStatus;
  _count?: { employees: number; assets: number };
  employees?: User[];
  assets?: Asset[];
  createdAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  customFields?: any;
  _count?: { assets: number };
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  assetName: string;
  serialNumber: string;
  categoryId: string;
  category?: AssetCategory;
  acquisitionDate: string;
  acquisitionCost: number;
  warranty?: string;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  sharedBookable: boolean;
  image?: string;
  documents?: any;
  departmentId?: string;
  department?: Department;
  allocations?: AssetAllocation[];
  maintenanceRequests?: MaintenanceRequest[];
  transferRequests?: TransferRequest[];
  bookings?: Booking[];
  _count?: { allocations: number; maintenanceRequests: number };
  createdAt: string;
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  employeeId: string;
  departmentId?: string;
  allocatedDate: string;
  expectedReturnDate?: string;
  returnedDate?: string;
  notes?: string;
  status: string;
  asset?: Asset;
  employee?: User;
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  requesterId: string;
  assetId: string;
  currentHolderId: string;
  newHolderId: string;
  reason: string;
  approvalStatus: ApprovalStatus;
  approvedById?: string;
  requester?: User;
  asset?: Asset;
  currentHolder?: User;
  newHolder?: User;
  approvedBy?: User;
  createdAt: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  asset?: Asset;
  employee?: User;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  employeeId: string;
  issue: string;
  priority: string;
  attachment?: string;
  approvalStatus: ApprovalStatus;
  technicianId?: string;
  progressStatus: ProgressStatus;
  completedDate?: string;
  asset?: Asset;
  employee?: User;
  createdAt: string;
}

export interface AuditCycle {
  id: string;
  cycleName: string;
  departmentId: string;
  location: string;
  startDate: string;
  endDate: string;
  assetVerification: string;
  discrepancyReport?: any;
  department?: Department;
  auditors?: User[];
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details?: any;
  timestamp: string;
  user?: User;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenance: number;
  lostAssets: number;
  activeBookings: number;
  pendingMaintenance: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
  totalEmployees: number;
  totalDepartments: number;
}

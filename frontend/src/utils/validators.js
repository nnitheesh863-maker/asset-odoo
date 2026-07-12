import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    departmentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(200),
  description: z.string().max(1000).optional(),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  serialNumber: z.string().max(100).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().min(1, 'Department is required'),
  location: z.string().max(200).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  warrantyExpiry: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).optional(),
  status: z
    .enum(['available', 'allocated', 'maintenance', 'retired', 'lost', 'disposed'])
    .optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  code: z.string().min(1, 'Department code is required').max(20),
  description: z.string().max(500).optional(),
  managerId: z.string().optional(),
  parentId: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  code: z.string().min(1, 'Category code is required').max(20),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  employeeId: z.string().min(1, 'Employee ID is required').max(50),
  departmentId: z.string().min(1, 'Department is required'),
  designation: z.string().max(100).optional(),
  dateOfJoining: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const allocationSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  allocatedDate: z.string().min(1, 'Allocation date is required'),
  expectedReturnDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const bookingSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  purpose: z.string().min(1, 'Purpose is required').max(500),
  notes: z.string().max(500).optional(),
});

export const maintenanceSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  type: z.enum(['preventive', 'corrective', 'predictive', 'emergency']),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  technicianId: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const transferSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  fromDepartmentId: z.string().min(1, 'From department is required'),
  toDepartmentId: z.string().min(1, 'To department is required'),
  fromEmployeeId: z.string().optional(),
  toEmployeeId: z.string().optional(),
  reason: z.string().min(1, 'Reason is required').max(500),
  transferDate: z.string().min(1, 'Transfer date is required'),
  notes: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

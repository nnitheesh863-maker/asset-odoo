import bcrypt from 'bcryptjs';
import { Asset, Employee, ActivityLog, Notification } from '../models';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAssetTag = async (): Promise<string> => {
  const lastAsset = await Asset.findOne({}, { assetTag: 1, _id: 0 })
    .sort({ assetTag: -1 })
    .limit(1)
    .lean();

  if (!lastAsset || !lastAsset.assetTag) return 'AF-0001';

  const lastNumber = parseInt(lastAsset.assetTag.replace('AF-', ''), 10);
  const nextNumber = lastNumber + 1;
  return `AF-${nextNumber.toString().padStart(4, '0')}`;
};

export const generateEmployeeId = async (): Promise<string> => {
  const lastEmployee = await Employee.findOne({}, { employeeId: 1, _id: 0 })
    .sort({ employeeId: -1 })
    .limit(1)
    .lean();

  if (!lastEmployee || !lastEmployee.employeeId) return 'EMP-0001';

  const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP-', ''), 10);
  const nextNumber = lastNumber + 1;
  return `EMP-${nextNumber.toString().padStart(4, '0')}`;
};

export const paginate = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip };
};

export const createActivityLog = async (
  userId: string,
  action: string,
  module: string,
  details?: any
) => {
  return ActivityLog.create({ userId, action, module, details });
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'GENERAL' | 'TRANSFER_REQUEST' | 'MAINTENANCE_REQUEST' | 'BOOKING' | 'RETURN_DUE' | 'OVERDUE' | 'AUDIT' = 'GENERAL'
) => {
  return Notification.create({ userId, title, message, type });
};

import { Request, Response } from 'express';
import { Employee } from '../models';
import { hashPassword, comparePassword, generateEmployeeId, createActivityLog } from '../utils/helpers';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (employee.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    const isValidPassword = await comparePassword(password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokens = generateTokens({
      id: employee._id.toString(),
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
    });

    await createActivityLog(employee._id.toString(), 'LOGIN', 'AUTH');

    const employeeObj = employee.toObject();
    const { password: _, ...employeeData } = employeeObj;

    res.json({
      success: true,
      message: 'Login successful',
      data: { employee: employeeData, ...tokens },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    let { name, email, password, phone, departmentId } = req.body;
    if (!departmentId) departmentId = undefined;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const employeeId = await generateEmployeeId();
    const hashedPassword = await hashPassword(password);

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      phone,
      departmentId,
      role: 'EMPLOYEE',
    });

    const tokens = generateTokens({
      id: employee._id.toString(),
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
    });

    const employeeObj = employee.toObject();
    const { password: _, ...employeeData } = employeeObj;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { employee: employeeData, ...tokens },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const employee = await Employee.findById(decoded.id);

    if (!employee || employee.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens({
      id: employee._id.toString(),
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
    });

    res.json({ success: true, data: tokens });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.user!.id)
      .select('-password')
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const employee = await Employee.findById(req.user!.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const isValid = await comparePassword(currentPassword, employee.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await Employee.findByIdAndUpdate(req.user!.id, { password: hashedPassword });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

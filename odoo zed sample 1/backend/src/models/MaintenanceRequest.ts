import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  _id: Types.ObjectId;
  assetId: Types.ObjectId;
  employeeId: Types.ObjectId;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attachment?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  technicianId?: Types.ObjectId;
  progressStatus: 'PENDING' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED';
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    issue: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    attachment: { type: String },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    progressStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED'],
      default: 'PENDING',
    },
    completedDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', maintenanceRequestSchema);

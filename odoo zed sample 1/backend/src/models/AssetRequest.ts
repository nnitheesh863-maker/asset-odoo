import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssetRequest extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  assetType: 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'HEADSET' | 'VEHICLE' | 'FURNITURE' | 'OTHER';
  assetName: string;
  justification: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  approvedBy?: Types.ObjectId;
  approvalNote?: string;
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const assetRequestSchema = new Schema<IAssetRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    assetType: {
      type: String,
      enum: ['LAPTOP', 'DESKTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'VEHICLE', 'FURNITURE', 'OTHER'],
      required: true,
    },
    assetName: { type: String, required: true, trim: true },
    justification: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
      default: 'PENDING',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    approvalNote: { type: String, trim: true },
    specifications: { type: Schema.Types.Mixed },
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

export default mongoose.model<IAssetRequest>('AssetRequest', assetRequestSchema);

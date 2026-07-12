import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssetAllocation extends Document {
  _id: Types.ObjectId;
  assetId: Types.ObjectId;
  employeeId: Types.ObjectId;
  departmentId: Types.ObjectId;
  allocatedDate: Date;
  expectedReturnDate?: Date;
  returnedDate?: Date;
  notes?: string;
  status: 'ACTIVE' | 'RETURNED';
  createdAt: Date;
  updatedAt: Date;
}

const assetAllocationSchema = new Schema<IAssetAllocation>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    allocatedDate: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date },
    returnedDate: { type: Date },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'RETURNED'],
      default: 'ACTIVE',
    },
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

export default mongoose.model<IAssetAllocation>('AssetAllocation', assetAllocationSchema);

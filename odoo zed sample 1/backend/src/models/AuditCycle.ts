import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditCycle extends Document {
  _id: Types.ObjectId;
  cycleName: string;
  departmentId: Types.ObjectId;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  assetVerification: 'PENDING' | 'VERIFIED' | 'DISCREPANCY';
  discrepancyReport?: Record<string, any>;
  auditorIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const auditCycleSchema = new Schema<IAuditCycle>(
  {
    cycleName: { type: String, required: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    assetVerification: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'DISCREPANCY'],
      default: 'PENDING',
    },
    discrepancyReport: { type: Schema.Types.Mixed },
    auditorIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
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

export default mongoose.model<IAuditCycle>('AuditCycle', auditCycleSchema);

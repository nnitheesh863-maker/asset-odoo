import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  module: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    action: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
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

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

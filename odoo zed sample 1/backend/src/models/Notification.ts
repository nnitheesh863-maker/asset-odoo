import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  title: string;
  message: string;
  userId: Types.ObjectId;
  type: 'GENERAL' | 'TRANSFER_REQUEST' | 'MAINTENANCE_REQUEST' | 'BOOKING' | 'RETURN_DUE' | 'OVERDUE' | 'AUDIT';
  readStatus: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: {
      type: String,
      enum: ['GENERAL', 'TRANSFER_REQUEST', 'MAINTENANCE_REQUEST', 'BOOKING', 'RETURN_DUE', 'OVERDUE', 'AUDIT'],
      default: 'GENERAL',
    },
    readStatus: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export default mongoose.model<INotification>('Notification', notificationSchema);

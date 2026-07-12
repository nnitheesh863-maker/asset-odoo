import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  resourceId: Types.ObjectId;
  employeeId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    resourceId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
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

export default mongoose.model<IBooking>('Booking', bookingSchema);

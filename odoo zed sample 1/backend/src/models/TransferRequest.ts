import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransferRequest extends Document {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  assetId: Types.ObjectId;
  currentHolderId: Types.ObjectId;
  newHolderId: Types.ObjectId;
  reason?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transferRequestSchema = new Schema<ITransferRequest>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    currentHolderId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    newHolderId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    reason: { type: String, trim: true },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    approvedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
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

export default mongoose.model<ITransferRequest>('TransferRequest', transferRequestSchema);

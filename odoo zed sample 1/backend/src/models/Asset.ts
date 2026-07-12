import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAsset extends Document {
  _id: Types.ObjectId;
  assetTag: string;
  assetName: string;
  serialNumber: string;
  categoryId: Types.ObjectId;
  acquisitionDate?: Date;
  acquisitionCost?: number;
  warranty?: string;
  location?: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  status: 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
  sharedBookable: boolean;
  image?: string;
  documents?: Record<string, any>;
  departmentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    assetTag: { type: String, required: true, unique: true, trim: true },
    assetName: { type: String, required: true, trim: true },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    acquisitionDate: { type: Date },
    acquisitionCost: { type: Number },
    warranty: { type: String, trim: true },
    location: { type: String, trim: true },
    condition: {
      type: String,
      enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'],
      default: 'NEW',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'],
      default: 'AVAILABLE',
    },
    sharedBookable: { type: Boolean, default: false },
    image: { type: String },
    documents: { type: Schema.Types.Mixed },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
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

export default mongoose.model<IAsset>('Asset', assetSchema);

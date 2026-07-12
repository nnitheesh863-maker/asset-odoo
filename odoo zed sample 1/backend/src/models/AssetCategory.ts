import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssetCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const assetCategorySchema = new Schema<IAssetCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    customFields: { type: Schema.Types.Mixed },
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

export default mongoose.model<IAssetCategory>('AssetCategory', assetCategorySchema);

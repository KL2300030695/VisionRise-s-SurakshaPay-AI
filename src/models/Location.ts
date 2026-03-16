import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  coordinates: string;
  description?: string;
  city: string;
  state: string;
  country: string;
}

const LocationSchema: Schema = new Schema({
  name: { type: String, required: true },
  coordinates: { type: String, required: true },
  description: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

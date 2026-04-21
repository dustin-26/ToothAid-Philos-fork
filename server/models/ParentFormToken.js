import mongoose from 'mongoose';

const parentFormTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    childId: { type: String, required: true, index: true },
    /** Keys the parent is allowed to edit (boolean map). */
    fieldsRequested: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    createdBy: { type: String, trim: true, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('ParentFormToken', parentFormTokenSchema);

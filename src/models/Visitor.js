import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  count: { type: Number, default: 0 }
}, { timestamps: true });

// Initialize visitor count if not exists
visitorSchema.statics.initializeCount = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({ count: 0 });
  }
};

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
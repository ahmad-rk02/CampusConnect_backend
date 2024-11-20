import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  universityNumber: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  grievanceType: { type: String, required: true },
  message: { type: String, required: true },
  ticketId: { type: String, required: true, unique: true },
  status: { type: String, default: 'open' }, // Initially 'open'
  remarks: { type: String, default: '' },   // Remarks from admin
  createdAt: { type: Date, default: Date.now }
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;

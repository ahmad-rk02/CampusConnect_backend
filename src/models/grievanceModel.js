import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  universityNumber: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  grievanceType: { type: String, required: true, enum: ['departmental', 'office', 'others'] },
  message: { type: String, required: true },
  ticketId: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['not resolved', 'in progress', 'resolved'], 
    default: 'not resolved' 
  },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;
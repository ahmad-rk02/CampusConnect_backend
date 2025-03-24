import express from 'express';
import { submitGrievance, closeGrievance } from '../controllers/grievanceController.js';
import Grievance from '../models/grievanceModel.js';

const router = express.Router();

router.post('/submit', submitGrievance);
router.post('/close/:ticketId', closeGrievance); // Updated to handle status changes
router.get('/fetchgrievance', async (req, res) => {
  const { commonId } = req.query; // 'all' for admin, email for users
  console.log('Received commonId:', commonId);

  try {
    let grievances;
    if (commonId === 'all') {
      grievances = await Grievance.find({});
    } else {
      grievances = await Grievance.find({ email: commonId });
    }
    res.json(grievances);
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ error: 'Failed to fetch grievances.' });
  }
});

export default router;
import express from 'express';
import { submitGrievance, closeGrievance } from '../controllers/grievanceController.js';
import Grievance from '../models/grievanceModel.js';

const router = express.Router();

router.post('/submit', submitGrievance);
router.post('/close/:ticketId', closeGrievance);
router.get('/fetchgrievance', async (req, res) => {
    try {
      const grievances = await Grievance.find(); // Fetch all grievances from DB
      res.status(200).json(grievances); // Return the list of grievances
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch grievances' });
    }
  });
export default router;

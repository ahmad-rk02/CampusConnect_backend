import { createGrievance, updateGrievanceStatus } from '../services/grievanceService.js';

export const submitGrievance = async (req, res) => {
  try {
    const grievance = await createGrievance(req.body);
    res.status(200).json(grievance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const closeGrievance = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { remarks } = req.body;
    const updatedGrievance = await updateGrievanceStatus(ticketId, remarks);
    res.status(200).json(updatedGrievance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

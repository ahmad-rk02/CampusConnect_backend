import express from 'express';
import { getVisitorCount, incrementVisitorCount } from '../controllers/visitorController.js';

const router = express.Router();

router.route('/')
  .get(getVisitorCount)
  .post(incrementVisitorCount);

export default router;
import VisitorService from '../services/visitorService.js';
import asyncHandler from 'express-async-handler';

const getVisitorCount = asyncHandler(async (req, res) => {
  try {
    const visitorData = await VisitorService.getVisitorCount();
    res.json({ count: visitorData.count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitor count' });
  }
});

const incrementVisitorCount = asyncHandler(async (req, res) => {
  try {
    const visitorData = await VisitorService.incrementVisitorCount();
    res.json({ count: visitorData.count });
  } catch (error) {
    res.status(500).json({ message: 'Error incrementing visitor count' });
  }
});

export { getVisitorCount, incrementVisitorCount };
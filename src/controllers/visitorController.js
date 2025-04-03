import VisitorService from '../services/visitorService.js';
import asyncHandler from 'express-async-handler';

const getVisitorCount = asyncHandler(async (req, res) => {
  const visitorData = await VisitorService.getVisitorCount();
  res.json(visitorData);
});

const incrementVisitorCount = asyncHandler(async (req, res) => {
  const visitorData = await VisitorService.incrementVisitorCount();
  res.json(visitorData);
});

export { getVisitorCount, incrementVisitorCount };
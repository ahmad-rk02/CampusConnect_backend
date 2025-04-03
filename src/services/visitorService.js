import Visitor from '../models/Visitor.js';

class VisitorService {
  static async getVisitorCount() {
    const visitorData = await Visitor.findOne();
    return visitorData || await Visitor.create({ count: 0 });
  }

  static async incrementVisitorCount() {
    const visitorData = await Visitor.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    return visitorData;
  }
}

export default VisitorService;
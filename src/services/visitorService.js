import Visitor from '../models/Visitor.js';

class VisitorService {
  static async getVisitorCount() {
    try {
      let visitorData = await Visitor.findOne();
      if (!visitorData) {
        visitorData = await Visitor.create({ count: 0 });
      }
      return visitorData;
    } catch (error) {
      console.error('Error getting visitor count:', error);
      throw error;
    }
  }

  static async incrementVisitorCount() {
    try {
      const visitorData = await Visitor.findOneAndUpdate(
        {},
        { $inc: { count: 1 } },
        { 
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
      return visitorData;
    } catch (error) {
      console.error('Error incrementing visitor count:', error);
      throw error;
    }
  }
}

export default VisitorService;
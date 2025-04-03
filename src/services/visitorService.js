import Visitor from '../models/Visitor.js';

class VisitorService {
  static async getVisitorCount() {
    let visitorData = await Visitor.findOne();
    if (!visitorData) {
      visitorData = await Visitor.create({ count: 0 });
    }
    return visitorData;
  }

  static async incrementVisitorCount() {
    let visitorData = await Visitor.findOne();
    if (!visitorData) {
      visitorData = await Visitor.create({ count: 1 });
    } else {
      visitorData.count += 1;
      await visitorData.save();
    }
    return visitorData;
  }
}

export default VisitorService;
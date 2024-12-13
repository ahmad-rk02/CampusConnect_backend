
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded token data to request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

export default authMiddleware;

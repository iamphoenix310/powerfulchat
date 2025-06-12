// lib/authMiddleware.ts

import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

const authMiddleware = (handler: NextApiHandler) => {
interface CustomNextApiRequest extends NextApiRequest {
    user?: jwt.JwtPayload;
}

const authMiddleware = (handler: NextApiHandler) => {
    return async (req: CustomNextApiRequest, res: NextApiResponse) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string) as jwt.JwtPayload;
            req.user = decoded; // Add the decoded user info to the request object

            return handler(req, res);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};
};

export default authMiddleware;

import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
    userId?: string;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.d.ts.map
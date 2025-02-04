import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP } from '../config/constants';

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HTTP.BAD_REQUEST).json({ errors: errors.array() });
    }

    next();
};
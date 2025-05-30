import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';


export const checkAuth = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
        return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = decoded; // Attach user info to request
        next();
    });
}
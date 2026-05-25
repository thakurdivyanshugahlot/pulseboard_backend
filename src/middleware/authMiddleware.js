import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'token missing'
            });
        }

        // Expected format:
        // Bearer eyJhbGc...

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Token missing'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        // attach user info to request
        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Pease SignIN'
        });

    }

};
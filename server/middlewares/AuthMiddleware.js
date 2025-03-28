import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
    const token = request.cookies.jwt; // Access the JWT from cookies
    if (!token) {
        console.log('No token found in cookies.');
        return response.status(401).send("You are not authenticated!");
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
            console.error('Token verification error:', err); // Log the error for debugging
            return response.status(403).send("Token is not valid!");
        }
        
        request.userId = payload.userId; // Attach userId to the request object
        next(); // Call the next middleware or route handler
    });
};

export default verifyToken;

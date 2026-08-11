const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "library_management_secret_2026";

// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({
            error: "Invalid or expired token"
        });
    }
};

// Check admin role
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Admin access required"
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};
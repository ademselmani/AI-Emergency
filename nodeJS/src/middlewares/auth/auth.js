const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    console.log("➡️ Headers:", req.headers);
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], "jwtSecret");
        req.user = decoded;
        next();
    } catch (error) {
        
        res.status(401).json({ error: "Invalid token" });
    }
};

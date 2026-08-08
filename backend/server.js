const express = require("express");
const cors = require("cors");

require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const borrowingRoutes = require("./routes/borrowingRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Library Management API is running!"
    });
});

// API routes
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowings", borrowingRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
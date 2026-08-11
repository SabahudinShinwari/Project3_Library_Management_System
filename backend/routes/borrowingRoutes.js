const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const {
    getBorrowings,
    getBorrowing,
    borrowBook,
    returnBook
} = require("../controllers/borrowingController");

// GET all borrowing records
// Admin only
router.get("/", authenticateToken, requireAdmin, getBorrowings);

// GET one borrowing record
// Admin only
router.get("/:id", authenticateToken, requireAdmin, getBorrowing);

// BORROW a book
// Admin only
router.post("/", authenticateToken, requireAdmin, borrowBook);

// RETURN a book
// Admin only
router.put("/:id/return", authenticateToken, requireAdmin, returnBook);

module.exports = router;
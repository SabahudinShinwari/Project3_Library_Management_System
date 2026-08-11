const express = require("express");

const router = express.Router();

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    getProfile,
    getAvailableBooks,
    getMyBorrowings,
    borrowBookAsUser,
    returnMyBook
} = require("../controllers/userController");

// Get logged-in user's profile
router.get("/profile", authenticateToken, getProfile);

// Browse available books
router.get("/books", authenticateToken, getAvailableBooks);

// View own borrowing history
router.get("/borrowings", authenticateToken, getMyBorrowings);

// Borrow a book
router.post("/borrow", authenticateToken, borrowBookAsUser);

// Return own borrowed book
router.put(
    "/borrowings/:id/return",
    authenticateToken,
    returnMyBook
);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

// GET all books
// Admin only
router.get("/", authenticateToken, requireAdmin, getBooks);

// GET one book
// Admin only
router.get("/:id", authenticateToken, requireAdmin, getBook);

// CREATE book
// Admin only
router.post("/", authenticateToken, requireAdmin, createBook);

// UPDATE book
// Admin only
router.put("/:id", authenticateToken, requireAdmin, updateBook);

// DELETE book
// Admin only
router.delete("/:id", authenticateToken, requireAdmin, deleteBook);

module.exports = router;
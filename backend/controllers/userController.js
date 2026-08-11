const userModel = require("../models/userModel");
const db = require("../config/db");

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// Browse available books
const getAvailableBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT
                id,
                title,
                author,
                category,
                quantity,
                available_quantity
            FROM books
            WHERE available_quantity > 0
            ORDER BY title ASC
        `);

        res.json(books);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// Get user's borrowing history
const getMyBorrowings = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                borrowings.id,
                books.title AS book_title,
                books.author,
                borrowings.borrow_date,
                borrowings.return_date,
                borrowings.status
            FROM borrowings
            INNER JOIN books
                ON borrowings.book_id = books.id
            INNER JOIN users
                ON borrowings.user_id = users.id
            WHERE borrowings.user_id = ?
            ORDER BY borrowings.id DESC
        `, [req.user.id]);

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// Borrow a book as a user
const borrowBookAsUser = async (req, res) => {
    try {
        const { book_id } = req.body;

        if (!book_id) {
            return res.status(400).json({
                error: "book_id is required"
            });
        }

        // Check whether book exists and is available
        const [books] = await db.query(
            `SELECT id, available_quantity
             FROM books
             WHERE id = ?`,
            [book_id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        if (books[0].available_quantity <= 0) {
            return res.status(400).json({
                error: "Book is currently unavailable"
            });
        }

        // Create borrowing record
        const [result] = await db.query(
            `INSERT INTO borrowings
             (book_id, user_id, borrow_date, status)
             VALUES (?, ?, CURDATE(), 'Borrowed')`,
            [book_id, req.user.id]
        );

        // Decrease available quantity
        await db.query(
            `UPDATE books
             SET available_quantity = available_quantity - 1
             WHERE id = ?`,
            [book_id]
        );

        res.status(201).json({
            message: "Book borrowed successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// Return user's own book
const returnMyBook = async (req, res) => {
    try {
        const borrowingId = req.params.id;

        const [rows] = await db.query(
            `SELECT book_id, status
             FROM borrowings
             WHERE id = ? AND user_id = ?`,
            [borrowingId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Borrowing record not found"
            });
        }

        if (rows[0].status === "Returned") {
            return res.status(400).json({
                error: "Book has already been returned"
            });
        }

        await db.query(
            `UPDATE borrowings
             SET return_date = CURDATE(),
                 status = 'Returned'
             WHERE id = ? AND user_id = ?`,
            [borrowingId, req.user.id]
        );

        await db.query(
            `UPDATE books
             SET available_quantity = available_quantity + 1
             WHERE id = ?`,
            [rows[0].book_id]
        );

        res.json({
            message: "Book returned successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


module.exports = {
    getProfile,
    getAvailableBooks,
    getMyBorrowings,
    borrowBookAsUser,
    returnMyBook
};
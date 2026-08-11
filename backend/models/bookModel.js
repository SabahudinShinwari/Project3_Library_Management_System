const db = require("../config/db");

// Get all books
const getAllBooks = async () => {
    const [rows] = await db.query(
        "SELECT * FROM books ORDER BY id ASC"
    );

    return rows;
};

// Get one book
const getBookById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM books WHERE id = ?",
        [id]
    );

    return rows[0];
};

// Create book
const createBook = async (title, author, category, quantity) => {
    const [result] = await db.query(
        `INSERT INTO books
        (title, author, category, quantity, available_quantity)
        VALUES (?, ?, ?, ?, ?)`,
        [title, author, category, quantity, quantity]
    );

    return result.insertId;
};

// Update book
const updateBook = async (id, title, author, category, quantity) => {

    // Get current book information
    const [books] = await db.query(
        `SELECT quantity, available_quantity
         FROM books
         WHERE id = ?`,
        [id]
    );

    if (books.length === 0) {
        return 0;
    }

    const oldQuantity = Number(books[0].quantity);
    const oldAvailableQuantity = Number(books[0].available_quantity);

    // Difference between new and old quantity
    const quantityDifference = Number(quantity) - oldQuantity;

    // Increase/decrease available copies by the same difference
    let newAvailableQuantity =
        oldAvailableQuantity + quantityDifference;

    // Available copies cannot be negative
    if (newAvailableQuantity < 0) {
        newAvailableQuantity = 0;
    }

    // Available copies cannot be greater than total quantity
    if (newAvailableQuantity > Number(quantity)) {
        newAvailableQuantity = Number(quantity);
    }

    const [result] = await db.query(
        `UPDATE books
         SET title = ?,
             author = ?,
             category = ?,
             quantity = ?,
             available_quantity = ?
         WHERE id = ?`,
        [
            title,
            author,
            category,
            Number(quantity),
            newAvailableQuantity,
            id
        ]
    );

    return result.affectedRows;
};

// Delete book
const deleteBook = async (id) => {
    const [result] = await db.query(
        "DELETE FROM books WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
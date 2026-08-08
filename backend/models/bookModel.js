const db = require("../config/db");

// Get all books
const getAllBooks = async () => {
    const [rows] = await db.query(
        "SELECT * FROM books ORDER BY id DESC"
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
    const [result] = await db.query(
        `UPDATE books
         SET title = ?, author = ?, category = ?, quantity = ?,
             available_quantity = LEAST(available_quantity, ?)
         WHERE id = ?`,
        [title, author, category, quantity, quantity, id]
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
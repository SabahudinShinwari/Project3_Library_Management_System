const db = require("../config/db");

// Find user by email
const getUserByEmail = async (email) => {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

// Find user by ID
const getUserById = async (id) => {
    const [rows] = await db.query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
};

// Create user
const createUser = async (name, email, hashedPassword, role = "user") => {
    const [result] = await db.query(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role]
    );

    return result.insertId;
};

// Save password reset token
const saveResetToken = async (email, token, expires) => {
    const [result] = await db.query(
        `UPDATE users
         SET reset_token = ?, reset_token_expires = ?
         WHERE email = ?`,
        [token, expires, email]
    );

    return result.affectedRows;
};

// Find user by reset token
const getUserByResetToken = async (token) => {
    const [rows] = await db.query(
        `SELECT *
         FROM users
         WHERE reset_token = ?
         AND reset_token_expires > NOW()`,
        [token]
    );

    return rows[0];
};

// Update password and clear reset token
const updatePassword = async (userId, hashedPassword) => {
    const [result] = await db.query(
        `UPDATE users
         SET password = ?,
             reset_token = NULL,
             reset_token_expires = NULL
         WHERE id = ?`,
        [hashedPassword, userId]
    );

    return result.affectedRows;
};

module.exports = {
    getUserByEmail,
    getUserById,
    createUser,
    saveResetToken,
    getUserByResetToken,
    updatePassword
};
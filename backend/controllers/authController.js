const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userModel = require("../models/userModel");
const { sendPasswordResetEmail } = require("../config/mail");

const JWT_SECRET =
    process.env.JWT_SECRET || "library_management_secret_2026";

// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });
        }

        const existingUser = await userModel.getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await userModel.createUser(
            name,
            email,
            hashedPassword,
            "user"
        );

        res.status(201).json({
            message: "Registration successful",
            userId
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }

        const user = await userModel.getUserByEmail(email);

        // Do not reveal whether an email exists
        if (!user) {
            return res.json({
                message:
                    "If the email exists, a password reset link has been generated."
            });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token expires in 15 minutes
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        await userModel.saveResetToken(
            email,
            resetToken,
            expires
        );

        const resetPage =
            process.env.RESET_FRONTEND_URL ||
            "http://127.0.0.1:5500/frontend/index.html";
        const resetLink =
            `${resetPage}?resetToken=${encodeURIComponent(resetToken)}`;

        await sendPasswordResetEmail(email, resetLink);

        res.json({
            message:
                "If the email exists, a password reset link has been sent."
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                error: "Token and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });
        }

        const user =
            await userModel.getUserByResetToken(token);

        if (!user) {
            return res.status(400).json({
                error: "Invalid or expired reset token"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        await userModel.updatePassword(
            user.id,
            hashedPassword
        );

        res.json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
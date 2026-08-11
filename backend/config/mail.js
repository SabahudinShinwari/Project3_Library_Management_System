const nodemailer = require("nodemailer");

const requiredMailSettings = [
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD"
];

const missingMailSettings = requiredMailSettings.filter(
    (setting) => !process.env[setting]
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const sendPasswordResetEmail = async (recipient, resetLink) => {
    if (missingMailSettings.length > 0) {
        throw new Error(
            `Missing email configuration: ${missingMailSettings.join(", ")}`
        );
    }

    await transporter.sendMail({
        from: `Library Management System <${process.env.GMAIL_USER}>`,
        to: recipient,
        subject: "Reset your library account password",
        text: `Use this link to reset your password. It expires in 15 minutes:\n\n${resetLink}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>Library Management System</h2>

                <p>
                    We received a request to reset your library account password.
                </p>

                <p>
                    <a href="${resetLink}"
                       style="
                           display: inline-block;
                           padding: 12px 20px;
                           background-color: #4f46e5;
                           color: white;
                           text-decoration: none;
                           border-radius: 6px;
                       ">
                        Reset Your Password
                    </a>
                </p>

                <p>
                    This link expires in 15 minutes.
                </p>

                <p>
                    If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
        `
    });
};

module.exports = {
    sendPasswordResetEmail
};
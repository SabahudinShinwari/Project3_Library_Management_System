const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "library_management",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("MySQL database connected successfully!");
    connection.release();
});

module.exports = pool.promise();
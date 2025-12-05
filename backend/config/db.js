const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "registro_notas",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL (registro_notas).');
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        process.exit(1);
    }
}

module.exports = {
    connectDB,
    pool
};
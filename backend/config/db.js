import { createPool } from "mysql2/promise";

const pool = createPool({
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

export default {
    connectDB,
    pool
};
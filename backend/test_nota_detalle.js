import dbExport from "./config/db.js";

async function test() {
    try {
        await dbExport.connectDB();
        console.log("✅ Conexión a BD exitosa");

        // Crear tabla si no existe
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS nota_detalle (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idEstudiante INT NOT NULL,
                semestre INT NOT NULL,
                tipo ENUM('tarea','examen','proyecto') NOT NULL,
                descripcion VARCHAR(100),
                nota DECIMAL(5,2) NOT NULL,
                fecha DATE,
                FOREIGN KEY (idEstudiante) REFERENCES estudiante(id)
            )
        `;
        await dbExport.pool.query(createTableSQL);
        console.log("✅ Tabla nota_detalle creada/verificada");

        // Probar inserción
        const pool = dbExport.pool;
        const testData = {
            idEstudiante: 1,
            semestre: 1,
            tipo: 'tarea',
            descripcion: 'Prueba',
            nota: 85
        };

        const query = "INSERT INTO nota_detalle (idEstudiante, semestre, tipo, descripcion, nota) VALUES (?, ?, ?, ?, ?)";
        const [resultado] = await pool.query(query, [testData.idEstudiante, testData.semestre, testData.tipo, testData.descripcion, testData.nota]);
        console.log("✅ Inserción exitosa, ID:", resultado.insertId);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        console.error("Detalles:", err);
        process.exit(1);
    }
}

test();

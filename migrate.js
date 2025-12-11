import dbExport from "./backend/config/db.js";

const db = dbExport.pool;

async function runMigration() {
    try {
        const query = `ALTER TABLE nota_detalle MODIFY COLUMN tipo ENUM('tarea','examen','proyecto','asistencia') NOT NULL;`;
        await db.query(query);
        console.log("✅ Migración ejecutada: ENUM actualizado en nota_detalle");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error en migración:", err.message);
        process.exit(1);
    }
}

runMigration();

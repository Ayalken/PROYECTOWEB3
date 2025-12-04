import express from "express";
import cors from "cors";
import estudianteRoutes from "./rutas/estudianteRoutes.js";
import notasRoutes from "./rutas/notasRoutes.js";
import camposExtraRoutes from "./rutas/camposExtraRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS
app.use("/estudiantes", estudianteRoutes);
app.use("/notas", notasRoutes);
app.use("/campos-extra", camposExtraRoutes);

// Servidor
app.listen(3000, () => {
    console.log("Servidor backend corriendo en http://localhost:3000");
});

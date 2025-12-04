import express from "express";
import { listar, crear, eliminar } from "../controlador/camposExtraController.js";

const router = express.Router();

router.get("/", listar);
router.post("/", crear);
router.delete("/:id", eliminar);

export default router;

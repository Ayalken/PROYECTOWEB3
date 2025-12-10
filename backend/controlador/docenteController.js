// /controlador/docenteController.js
import { obtTodosDocentes, insertaDocente, actualizaDocente, eliminaLogicoDocente } from "../modelo/docenteModel.js";
import { asignarDocentePorCurso } from "../modelo/estudianteModel.js";

// Validación: aceptar campo combinado o campos separados
const validarDatosDocente = (data) => {
    if (data.apellido_paterno || data.apellido_materno || data.nombres) {
        if (!data.apellido_paterno || !data.apellido_materno || !data.nombres) {
            return "Apellido paterno, apellido materno y nombres son obligatorios si se usan campos separados.";
        }
    } else {
        if (!data.apellidos_nombres || data.apellidos_nombres.length < 5) {
            return "El nombre y apellido del docente es obligatorio y debe ser más largo.";
        }
    }
    if (!data.ci) {
        return "El carnet de identidad es obligatorio.";
    }
    return null;
};

export const listar = async (req, res) => {
    try {
        const resultado = await obtTodosDocentes();
        res.json(resultado);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const crear = async (req, res) => {
    const error = validarDatosDocente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const data = { ...req.body };
        if (data.apellido_paterno && data.apellido_materno && data.nombres) {
            data.apellidos_nombres = `${data.apellido_paterno} ${data.apellido_materno} ${data.nombres}`.trim();
        }
        const resultado = await insertaDocente(data);

        // Si se proporcionó un curso en el formulario, asignar este docente a los estudiantes de ese curso
        if (data.curso_asignado) {
            try {
                await asignarDocentePorCurso(resultado.id, data.curso_asignado);
            } catch (errAssign) {
                console.warn('No se pudo asignar docente a estudiantes por curso:', errAssign.message || errAssign);
            }
        }

        res.json({ mensaje: "Docente registrado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const actualizar = async (req, res) => {
    const error = validarDatosDocente(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    try {
        const data = { ...req.body };
        if (data.apellido_paterno && data.apellido_materno && data.nombres) {
            data.apellidos_nombres = `${data.apellido_paterno} ${data.apellido_materno} ${data.nombres}`.trim();
        }
        const resultado = await actualizaDocente(req.params.id, data);
        res.json({ mensaje: "Docente actualizado", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await eliminaLogicoDocente(req.params.id);
        res.json({ mensaje: "Docente eliminado (lógico)", resultado });
    } catch (err) {
        res.status(500).json(err);
    }
};
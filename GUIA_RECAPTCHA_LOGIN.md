# 🔐 GUÍA DE CONFIGURACIÓN: Google reCAPTCHA v3 + Login

## Paso 1: Obtener las claves de Google reCAPTCHA

1. Ve a https://www.google.com/recaptcha/admin
2. Inicia sesión con tu cuenta Google (o crea una)
3. Haz clic en el signo "+" (+ button) para crear un nuevo sitio
4. Completa el formulario:
   - **Nombre del sitio**: "Sistema de Registro de Notas"
   - **Tipo de reCAPTCHA**: Selecciona **reCAPTCHA v3**
   - **Dominios**: `localhost` (para desarrollo)
   - Acepta los términos y haz clic en "Submit"

5. Google te generará dos claves:
   - **Site Key (Clave del sitio)**: Usa esto en el **FRONTEND**
   - **Secret Key (Clave secreta)**: Usa esto en el **BACKEND**

## Paso 2: Configurar el Backend

### 2.1 Crear archivo `.env`
```bash
# En c:\Users\Windows 10\Desktop\PROYECTOWEB3\backend\
# Copia el contenido de .env.example a .env
cp .env.example .env
```

### 2.2 Editar el archivo `.env`
```
JWT_SECRET=tu_clave_super_secreta_cambiar_esto
RECAPTCHA_SECRET=6Lc...........................  # ← Tu Secret Key de Google
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=registro_notas
PORT=3000
```

### 2.3 Instalar dependencias
```bash
npm install
```

## Paso 3: Configurar el Frontend

### 3.1 En tu HTML (login.html o similar)
```html
<!-- Agrega este script al <head> -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

Reemplaza `YOUR_SITE_KEY` con tu Site Key de Google.

### 3.2 En tu JavaScript (cuando hagas login)
```javascript
// Obtener el token de reCAPTCHA
const token = await grecaptcha.execute('YOUR_SITE_KEY', { action: 'login' });

// Enviar al backend junto con usuario y contraseña
const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nombre_usuario: usuario,
        password: password,
        captcha_token: token  // ← El token generado por reCAPTCHA
    })
});
```

## Paso 4: Crear un Usuario Admin

### 4.1 Registrar un usuario (en Postman o curl)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_usuario": "admin",
    "password": "Admin@12345!",
    "rol": "admin"
  }'
```

### 4.2 Hacer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_usuario": "admin",
    "password": "Admin@12345!",
    "captcha_token": "tu_token_aqui"  # Para testing, puedes usar un token válido de Google
  }'
```

## Paso 5: Probar el Servidor

```bash
cd backend
npm start
```

El servidor debería mostrar:
```
✅ Conexión exitosa a MySQL (registro_notas).
Servidor backend corriendo en http://localhost:3000
```

## Notas Importantes

⚠️ **Seguridad**:
- NUNCA cargues el archivo `.env` a GitHub (está en `.gitignore`)
- La `JWT_SECRET` debe ser una cadena larga y aleatoria en producción
- Usa HTTPS en producción (no HTTP)
- El `RECAPTCHA_SECRET` debe protegerse (nunca lo expongas en el frontend)

🧪 **Testing**:
- En desarrollo, puedes usar la Site Key demo de Google (siempre dará score > 0.5)
- Para testing sin reCAPTCHA, comenta temporalmente la validación en `authController.js`

📚 **Score de reCAPTCHA v3**:
- 0.0 = Definitivamente un bot
- 1.0 = Definitivamente un humano
- Score > 0.5 = Considerado usuario legítimo (puedes ajustar este threshold)

## Archivos Modificados

✅ `/backend/controlador/authController.js`
   - Función `verificarCaptcha()` para validar el token
   - Login actualizado para requerir CAPTCHA

✅ `/backend/package.json`
   - Agregado `node-fetch` para hacer requests HTTP a Google

✅ `/backend/.env.example`
   - Plantilla de variables de entorno

📝 `/backend/LOGIN_CON_CAPTCHA_EJEMPLO.html`
   - Ejemplo completo de formulario con reCAPTCHA v3

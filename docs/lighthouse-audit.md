# Auditoría de Lighthouse CI (LHCI)

Este repositorio cuenta con una auditoría automatizada y centralizada de Lighthouse para analizar la accesibilidad, rendimiento, SEO y mejores prácticas de todos los módulos del software en una sola ejecución, incluso en rutas protegidas que requieren autenticación con doble factor (2FA).

## Requisitos Previos

1. **Servidor Local Activo:**
   La aplicación debe estar ejecutándose en local antes de iniciar la auditoría.
   ```bash
   pnpm run dev
   # o bien:
   pnpm start
   ```

2. **Puerto de la Aplicación:**
   Por defecto, la auditoría apunta a `http://localhost:3000`. Si cambias el puerto, actualiza el archivo `scripts/urls.txt` con el puerto correspondiente.

## Cómo Ejecutar la Auditoría

Para actualizar las rutas de tu software y lanzar la auditoría completa, ejecuta:

```bash
pnpm run lhci:all
```

Este comando ejecuta de forma secuencial dos tareas:
1. **`lhci:update-urls`**: Sincroniza la lista de rutas en `scripts/urls.txt` hacia la configuración principal `lighthouserc.json`.
2. **`lhci:mobile`**: Inicia el motor de Lighthouse emulando dispositivos móviles, ejecuta la autenticación automatizada en cada ruta y genera los reportes correspondientes.

---

## Flujo de Autenticación Automatizada (2FA)

La aplicación utiliza un script de Puppeteer ubicado en [`scripts/lhci-login.js`](file:///c:/Dev/The Tower Power/scripts/lhci-login.js) para loguearse de forma automática antes de auditar cada página protegida.

El flujo realiza los siguientes pasos de forma autónoma:
1. Ingresa al formulario de login (`/login`).
2. Digita el correo del superadministrador (`superadmin@towerpower.local`) y la contraseña.
3. Al detectar la pantalla de doble factor (2FA), consulta la clave secreta de TOTP almacenada en base de datos para este usuario y genera programáticamente el código dinámico de 6 dígitos usando la librería `otplib`.
4. Digita el código y completa el inicio de sesión.
5. Lighthouse mantiene activa esta sesión (gracias a la opción `disableStorageReset: true` en la configuración) y realiza las mediciones sobre las páginas internas de los dashboards sin ser redirigido.

---

## Estructura de Archivos

- **[`lighthouserc.json`](file:///c:/Dev/The Tower Power/lighthouserc.json)**: Configuración principal de Lighthouse CI.
- **[`scripts/urls.txt`](file:///c:/Dev/The Tower Power/scripts/urls.txt)**: Listado de rutas del software que deseas auditar. Puedes agregar o quitar URLs aquí en cualquier momento.
- **[`scripts/update-lhci-urls.js`](file:///c:/Dev/The Tower Power/scripts/update-lhci-urls.js)**: Script utilitario que lee `urls.txt` y regenera la configuración de `lighthouserc.json`.
- **[`scripts/lhci-login.js`](file:///c:/Dev/The Tower Power/scripts/lhci-login.js)**: Script de automatización de login con soporte para 2FA.

# 🧪 PreParcial – Mini Red Social con Roles y Estado Global (TypeScript + Firebase + Supabase)

## 🎯 Objetivo

Crear una aplicación tipo **red social** utilizando **TypeScript nativo** (sin React, sin Redux), con autenticación y base de datos en **Firebase**, y manejo de estado global **flux** y almacenamiento de imagenes con **Supabase como store**. La app debe diferenciar entre usuarios **administradores** y **usuarios normales**, permitiendo una navegación y funcionalidades distintas por rol.

---

## 📋 Requerimientos funcionales

### 🧾 Autenticación y usuarios

- Implementa autenticación usando **Firebase Auth**.
- Debes poder iniciar sesión y registrar usuarios.
- Cada usuario debe tener un **rol asignado**: `"admin"` o `"user"` (usa un campo extra en Firestore o claims de Firebase).

### 👥 Vistas según rol

- **Administrador:**
  - Puede ver todas las publicaciones.
  - Puede eliminar publicaciones de cualquier usuario.
  - Puede cambiar el rol de otros usuarios.
- **Usuario normal:**
  - Solo puede ver sus propias publicaciones.
  - Solo puede eliminar sus propias publicaciones.

### 📝 Formularios y base de datos

- Implementa un formulario para crear publicaciones (mensaje, fecha, etc.).
- Guarda cada publicación en **Firebase Firestore**.
- Las publicaciones deben poder ser leídas por otros usuarios (conforme a sus permisos).

### 🔄 Sincronización en tiempo real

- Los cambios realizados (crear, eliminar, editar publicaciones) deben reflejarse **en tiempo real** en otros clientes conectados.

---

## 🔁 Estado global y arquitectura

- Implementa un sistema de **estado global** con lógica centralizada (tipo Flux) utilizando **Supabase** como store de imagenes
- Toda acción debe **fluir** desde el estado global hacia las vistas.
- Usa **nombres claros**, **tipado correcto**, y una arquitectura **modular y limpia**.

---

¡Éxito!

- Att: Chatty <3

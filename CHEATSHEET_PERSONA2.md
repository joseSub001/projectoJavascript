# CHEAT-SHEET — PERSONA 2: CRUD y Persistencia de Datos

> Mi rol: "La técnica del backend/datos". Explico cómo se guardan los datos y cómo funciona el panel de administrador.

---

## ARCHIVOS QUE EXPONGO
| Archivo | Para qué |
|---|---|
| `src/utils/storage.js` | Capa de persistencia (las 4 funciones) |
| `src/components/AdminPanel.jsx` | Panel CRUD del admin + `validateForm()` |
| `src/App.jsx` | Ruta `/admin` protegida por rol |
| `src/components/Auth.jsx` | De dónde sale el usuario admin (apoyo) |

**Login admin:** `admin@amaru.pe` / `admin123` → ruta `/admin`

---

## 1) PERSISTENCIA — `storage.js` (1-2 min)

> "Usamos **LocalStorage** (almacenamiento del navegador). Creamos una **capa de abstracción** con 4 funciones. Si mañana migramos a una base de datos real, solo cambiamos este archivo."

```javascript
loadData(key, fallback)      // leer  -> JSON.parse
saveData(key, value)         // guardar -> JSON.stringify
removeData(key)              // borrar (ej. cerrar sesion)
updateItem(key, id, changes) // editar UN item por su id
```

**Frase clave:** LocalStorage solo guarda **texto** → por eso `JSON.stringify` al guardar y `JSON.parse` al leer. Todo va en `try/catch` para no romper la app.

### Las 5 claves (prefijo `amaru_`)
| Clave | Qué guarda |
|---|---|
| `amaru_users` | Usuarios registrados |
| `amaru_session` | Sesión activa |
| `amaru_menu` | La carta del restaurante |
| `amaru_carrito` | El carrito del cliente |
| `amaru_pedidos` | Pedidos confirmados |

---

## 2) PANEL CRUD — `AdminPanel.jsx` (2 min)

> "El admin entra a `/admin` y gestiona la carta. Es el CRUD completo."

**Demo en vivo (en orden):**
1. **READ (Leer):** al entrar carga el menú con `loadData('amaru_menu', ...)` y lo pinta en la tabla.
2. **CREATE (Crear):** botón "Nuevo Plato" → formulario → se crea con `id` único (`Date.now()`).
3. **UPDATE (Editar):** botón editar → cambio un campo → "Guardar cambios".
4. **DELETE (Eliminar):** botón eliminar → **modal de confirmación** → "Eliminar".

**Frase clave:** cada operación termina en `saveData('amaru_menu', ...)` → los cambios **persisten** aunque recargue la página.

---

## 3) VALIDACIONES — `validateForm()` (1 min)

> "Antes de guardar, `validateForm()` revisa los campos. Si hay errores, NO se guarda."

```javascript
const validateForm = (form) => {
  const errors = {};
  // Nombre: obligatorio + minimo 3 caracteres
  if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
  else if (form.name.trim().length < 3) errors.name = "Mínimo 3 caracteres.";

  // Descripcion: obligatoria + minimo 10 caracteres
  if (!form.desc.trim()) errors.desc = "La descripción es obligatoria.";
  else if (form.desc.trim().length < 10) errors.desc = "Mínimo 10 caracteres.";

  // Precio: numero mayor a 0 (y maximo 9999)
  const priceNum = parseFloat(form.price);
  if (isNaN(priceNum) || priceNum <= 0) errors.price = "Debe ser mayor a 0.";
  else if (priceNum > 9999) errors.price = "No puede superar S/ 9,999.";

  // Imagen: si se pone, debe empezar con http:// o https://
  if (form.img.trim() && !/^https?:\/\/.+/.test(form.img.trim())) {
    errors.img = "La URL debe comenzar con http://";
  }
  return errors;
};
```

Y se conecta en `handleSubmit`:
```javascript
const validationErrors = validateForm(form);
if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors); // muestra errores en rojo
  return;                      // detiene el guardado
}
```

---

## 4) SEGURIDAD POR ROL — `App.jsx` (cierre 30 seg)

> "La ruta `/admin` está protegida. Solo `role === 'admin'` ve el panel; si no, va al login."

```jsx
<Route path="/admin" element={
  user?.role === 'admin'
    ? <AdminPanel user={user} />
    : <Navigate to="/login" />
} />
```

**Doble barrera** dentro del propio `AdminPanel.jsx`:
```javascript
if (!user || user.role !== "admin") {
  return <p>Acceso restringido</p>;
}
```

---

## RESUMEN PARA MEMORIZAR
- **Persistencia:** LocalStorage + capa de abstracción (`storage.js`), 4 funciones.
- **5 claves**, todas con prefijo `amaru_`.
- **CRUD completo** en `/admin`: crear, leer, editar, eliminar (con modal).
- **Validación** con `validateForm()` antes de guardar.
- **Seguridad por rol:** `role === 'admin'`, doble barrera (ruta + componente).

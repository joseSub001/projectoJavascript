# Documento de Planificación – Semana 14: Sprint 2

Este documento extiende la documentación del proyecto **Amaru Restaurante** con todos los entregables oficiales del **Sprint 2 – Gestión del Negocio**, correspondiente a la **Semana 14** del cronograma del curso de JavaScript Avanzado.

---

## Estado del Sprint 2

| Ítem | Estado |
|---|---|
| CRUD Principal (platos del menú) | ✅ Completado |
| Validaciones de formulario | ✅ Completado |
| Persistencia con LocalStorage | ✅ Completado |
| Consumo de API externa (`fetch`) | ✅ Completado |
| Carrito de compras (HU-05) | ✅ Completado |
| Flujo de confirmación de pedido (HU-06) | ✅ Completado |
| Login de administrador (HU-07) | ✅ Completado (heredado Sprint 1) |
| Panel CRUD de administrador (HU-08) | ✅ Completado |

---

## 1. Objetivo del Sprint 2

Implementar la lógica principal del negocio del restaurante Amaru: gestión dinámica de la carta, flujo de compra del cliente (carrito → pedido) y un panel de administración completo con operaciones CRUD persistidas.

---

## 2. Historias de Usuario Completadas en Sprint 2

De acuerdo al Product Backlog definido en la Semana 12, las siguientes historias fueron completadas en esta iteración:

| ID | Historia de Usuario | Criterio de Aceptación |
|---|---|---|
| **HU-05** | Como cliente, quiero agregar platos a un carrito de compras, para organizar los productos que deseo ordenar. | El cliente puede agregar, aumentar, reducir y eliminar ítems. El carrito persiste entre navegaciones. |
| **HU-06** | Como cliente, quiero confirmar y enviar mi pedido, para que el restaurante comience a prepararlo. | El pedido se guarda en LocalStorage con estado `pendiente`, nombre del cliente, ítems, total y fecha. |
| **HU-07** | Como administrador, quiero iniciar sesión con credenciales especiales, para acceder al panel de gestión. | Usuario `admin@amaru.pe` con rol `admin` accede a `/admin`. Clientes son redirigidos a `/login`. |
| **HU-08** | Como administrador, quiero crear, editar y eliminar platos de la carta, para mantener la oferta actualizada. | CRUD completo en `/admin` con validaciones, persistencia en LocalStorage y confirmación antes de eliminar. |

---

## 3. Entregable 1 – CRUD Principal

### Descripción
El módulo **Panel de Administración** (`AdminPanel.jsx`) implementa las cuatro operaciones fundamentales sobre la colección de platos del menú:

| Operación | Implementación |
|---|---|
| **Crear (Create)** | Formulario con validaciones agrega plato con ID único (`Date.now()`) y persiste en LocalStorage. |
| **Consultar (Read)** | Tabla interactiva con imagen, nombre, categoría, precio y estado. Incluye búsqueda y filtro por categoría. |
| **Actualizar (Update)** | Botón "Editar" abre el formulario pre-poblado con los datos del plato seleccionado. Los cambios persisten inmediatamente. |
| **Eliminar (Delete)** | Botón "Eliminar" abre un modal de confirmación antes de borrar definitivamente. |

### Archivos involucrados
- `src/components/AdminPanel.jsx` — Componente principal del CRUD.
- `src/utils/storage.js` — Capa de abstracción de LocalStorage.

### Acceso al CRUD
- **URL:** `/admin`
- **Credenciales de prueba:** `admin@amaru.pe` / `admin123`
- **Protección de ruta:** Solo accesible si `user.role === 'admin'`; de lo contrario redirige a `/login`.

---

## 4. Entregable 2 – Validaciones

Todas las validaciones se aplican en el formulario del panel de administración antes de persistir cualquier dato. Se implementaron en la función pura `validateForm(form)`:

| Campo | Reglas de validación |
|---|---|
| **Nombre del plato** | Obligatorio · Mínimo 3 caracteres |
| **Descripción** | Obligatoria · Mínimo 10 caracteres |
| **Precio** | Obligatorio · Número mayor a 0 · No puede superar S/ 9,999 |
| **URL de imagen** | Opcional · Si se ingresa, debe comenzar con `http://` o `https://` |
| **Categoría** | Selección de lista cerrada: Entradas, Fondos, Bebidas, Postres, Especiales |
| **Disponibilidad** | Toggle booleano — controla si el plato aparece en la carta pública |

**Tipo de feedback al usuario:**
- Mensajes de error inline bajo cada campo inválido (clase `is-invalid` de Bootstrap).
- El formulario no se envía si hay errores (`noValidate` + validación manual en JS).
- Notificaciones toast al crear, editar o eliminar un plato exitosamente.
- Modal de confirmación antes de eliminar para prevenir borrados accidentales.

**Validaciones en el carrito:**
- No se puede confirmar un pedido con el carrito vacío.
- La nota de pedido tiene un límite de 200 caracteres con contador en tiempo real.
- Usuario no autenticado es redirigido a `/login` si intenta ordenar.

---

## 5. Entregable 3 – Persistencia de Datos

Se utilizó **LocalStorage** como mecanismo de persistencia, gestionado mediante la capa de abstracción en `src/utils/storage.js`.

### Claves de almacenamiento

| Clave (key) | Contenido | Tipo |
|---|---|---|
| `amaru_users` | Array de usuarios registrados | User[] |
| `amaru_session` | Sesión activa del usuario | User o null |
| `amaru_menu` | Carta completa del restaurante | Plato[] |
| `amaru_carrito` | Carrito activo del cliente | ItemCarrito[] |
| `amaru_pedidos` | Historial de pedidos confirmados | Pedido[] |

### Esquema de un Plato (JSON)

```json
{
  "id": "1750854789123",
  "name": "Ceviche Clásico",
  "desc": "Pescado fresco marinado en limón...",
  "img": "https://images.unsplash.com/...",
  "price": 35.00,
  "category": "Entradas",
  "available": true
}
```

### Esquema de un Pedido confirmado (JSON)

```json
{
  "id": "1750854800456",
  "clientEmail": "cliente@email.com",
  "clientName": "Juan Pérez",
  "items": [
    { "id": "1", "name": "Ceviche Clásico", "price": 35, "qty": 2 }
  ],
  "total": 70.00,
  "note": "Sin picante",
  "date": "2026-06-24T20:30:00.000Z",
  "status": "pendiente"
}
```

### API de almacenamiento disponible

```js
import { loadData, saveData, removeData, updateItem } from '../utils/storage';

loadData('amaru_menu', [])          // Lee y parsea del localStorage
saveData('amaru_menu', menuArray)   // Serializa y guarda
removeData('amaru_session')         // Elimina una clave
updateItem('amaru_menu', id, {})    // Actualiza un ítem por ID en una colección
```

---

## 6. Entregable 4 – Consumo de API Externa

Se integró la API pública **TheMealDB** (`https://www.themealdb.com/api/json/v1/1/`) mediante `fetch()` nativo de JavaScript (sin librerías externas).

### Implementación en AdminPanel.jsx

```js
const fetchApiSuggestion = async () => {
  setApiLoading(true);
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    const data = await res.json();
    const meal = data.meals[0];
    // Pre-pobla el formulario con datos del plato externo
    setForm({
      name: meal.strMeal,
      desc: meal.strInstructions.slice(0, 120) + "...",
      img: meal.strMealThumb,
      price: "",
      category: "Especiales",
      available: true,
    });
  } catch (err) {
    showToast("Error al consultar la API externa.", "error");
  } finally {
    setApiLoading(false);
  }
};
```

### Flujo completo del consumo de API

```
Admin hace clic en "Sugerir desde API"
        ↓
fetch() GET → https://www.themealdb.com/api/json/v1/1/random.php
        ↓
Respuesta JSON: meal.strMeal, strInstructions, strMealThumb
        ↓
Formulario pre-poblado con los datos del plato externo
        ↓
Admin ajusta precio y categoría → guarda en LocalStorage
```

### Manejo de errores de red

- Estado de carga con spinner mientras se consulta la API.
- Toast de error si la petición falla (sin conexión, timeout, respuesta no-OK).
- La interfaz nunca queda bloqueada: el formulario permanece utilizable independientemente del resultado de la API.

---

## 7. Flujo de Negocio Completo (Sprint 2)

### Flujo del Cliente

```
Visita /  →  Ve carta dinámica (cargada desde LocalStorage)
         →  Filtra platos por categoría
         →  Click "Agregar al carrito"
               → Si no autenticado: redirige a /login
               → Si autenticado: ítem agregado + toast de confirmación
         →  Navega a /carrito (badge en Navbar muestra cantidad)
         →  Ajusta cantidades / elimina ítems / agrega nota
         →  Click "Confirmar pedido"
         →  Pedido guardado en amaru_pedidos con status: "pendiente"
         →  Pantalla de éxito con opciones de continuar
```

### Flujo del Administrador

```
Inicia sesión (admin@amaru.pe / admin123)
         →  Enlace "Admin" visible en Navbar
         →  Navega a /admin
         →  Ve tabla de platos con estadísticas (total, disponibles, categorías)
         →  CRUD: Crear / Editar / Eliminar platos
         →  Opcional: "Sugerir desde API" → fetch() a TheMealDB
         →  Cambios persistidos → Menú público actualizado en tiempo real
```

---

## 8. Sprint Backlog Actualizado

| ID | Historia | Sprint | Estado |
|---|---|---|---|
| HU-01 | Registro de usuario | Sprint 1 | ✅ Completado |
| HU-02 | Inicio de sesión y perfil | Sprint 1 | ✅ Completado |
| HU-03 | Visualizar carta del restaurante | Sprint 1 → 2 | ✅ Completado (dinámica en S2) |
| HU-04 | Navegación funcional entre vistas | Sprint 1 | ✅ Completado |
| HU-05 | Agregar platos al carrito | Sprint 2 | ✅ Completado |
| HU-06 | Confirmar y enviar pedido | Sprint 2 | ✅ Completado |
| HU-07 | Login de administrador | Sprint 2 | ✅ Completado |
| HU-08 | CRUD de platos (Admin) | Sprint 2 | ✅ Completado |
| HU-09 | Visualizar pedidos entrantes | Sprint 3 | ⏳ Pendiente |
| HU-10 | Dashboard con indicadores | Sprint 3 | ⏳ Pendiente |

---

## 9. Arquitectura de Componentes (Sprint 2)

```
App.jsx
├── Navbar.jsx          ← Carrito con badge, enlace Admin (condicional por rol)
├── [Ruta /]
│   ├── Hero.jsx        ← Banner principal (sin cambios)
│   └── Menu.jsx        ← Carta dinámica (LocalStorage), filtros, "Agregar al carrito"
├── [Ruta /login]
│   └── Auth.jsx        ← Login + Registro (sin cambios de Sprint 1)
├── [Ruta /perfil]
│   └── Perfil.jsx      ← Datos del usuario autenticado
├── [Ruta /carrito]     ← NUEVO Sprint 2
│   └── Carrito.jsx     ← Gestión del carrito y confirmación de pedido
├── [Ruta /admin]       ← NUEVO Sprint 2, protegida: solo role === 'admin'
│   └── AdminPanel.jsx  ← CRUD completo de platos + consumo de API
└── Footer.jsx
```

---

## 10. Tecnologías y Patrones Utilizados

| Tecnología / Patrón | Uso en Sprint 2 |
|---|---|
| **React 19 + Hooks** | `useState`, `useEffect` para estado local y efectos secundarios |
| **React Router v7** | Rutas protegidas por rol con Navigate, rutas anidadas |
| **LocalStorage** | Persistencia de menú, carrito, pedidos y sesión |
| **Fetch API** | Consumo asíncrono de TheMealDB con manejo de errores |
| **Bootstrap 5.3** | Tabla, formularios, modales, badges, toasts, spinner |
| **Bootstrap Icons** | Iconografía (carrito, admin, buscar, etc.) |
| **JavaScript Avanzado** | async/await, spread operator, Array.filter/map/find |
| **Validación manual** | Función validateForm() pura sin dependencias externas |

---

## 11. Burndown Simple – Sprint 2

| Momento | Tareas planificadas | Completadas | Restantes |
|---|---|---|---|
| Inicio del Sprint | 4 historias (HU-05 a HU-08) | 0 | 4 |
| Mitad del Sprint | — | 2 (HU-07, HU-08) | 2 |
| Fin del Sprint | — | 4 (HU-05, HU-06) | **0** |

**Velocidad del equipo:** 4 historias de usuario completadas en 1 sprint.

---

## 12. Evidencias del Sprint 2

- **Repositorio GitHub:** Código actualizado con los nuevos componentes `AdminPanel.jsx`, `Carrito.jsx`, y los archivos modificados `Menu.jsx`, `Navbar.jsx`, `App.jsx`, `storage.js`.
- **Panel Admin activo:** Ingresa con `admin@amaru.pe` / `admin123` → navega a `/admin`.
- **Flujo de cliente completo:** Regístrate → agrega platos al carrito → confirma pedido → pedido guardado en `amaru_pedidos`.
- **API integrada:** Botón "Sugerir desde API" en el panel admin realiza un `fetch()` real a TheMealDB.

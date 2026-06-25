/**
 *  persistencia en LocalStorage
 * sprint2 – gestion negocio
 */

const loadData = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveData = (key, value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const removeData = (key) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

/**
 * Actualiza un elemento dentro de una colección almacenada en LocalStorage.
 * @param {string} key - Clave de localStorage
 * @param {string} id - ID del elemento a actualizar
 * @param {object} changes - Campos a modificar
 */
const updateItem = (key, id, changes) => {
  const collection = loadData(key, []);
  const updated = collection.map((item) =>
    item.id === id ? { ...item, ...changes } : item
  );
  saveData(key, updated);
  return updated;
};

export { loadData, saveData, removeData, updateItem };
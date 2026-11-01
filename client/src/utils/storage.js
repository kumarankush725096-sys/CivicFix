// localStorage/sessionStorage can throw (private mode, blocked). Never crash on it.
export const safeGet = (store, key, fallback = null) => {
  try {
    const v = store.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
};
export const safeSet = (store, key, value) => {
  try {
    store.setItem(key, value);
  } catch {
    /* ignore */
  }
};
export const safeRemove = (store, key) => {
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
};

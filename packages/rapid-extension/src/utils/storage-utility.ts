const NAME_SPACE = "RAPID_EXTENSION_STORAGE.";

export class RapidExtStorage {
  static get<T = any>(key: string): T {
    try {
      const k = `${NAME_SPACE}${key}`;
      const d = localStorage.getItem(k);
      return d ? JSON.parse(d) : d;
    } catch (err) {
      return null;
    }
  }

  static set<T = any>(key: string, val: T) {
    try {
      const k = `${NAME_SPACE}${key}`;
      localStorage.setItem(k, JSON.stringify(val) || "null");
    } catch (err) {
      console.error(err);
    }
  }

  static remove(key: string) {
    try {
      const k = `${NAME_SPACE}${key}`;
      localStorage.removeItem(k);
    } catch (err) {
      console.error(err);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (err) {
      console.error(err);
    }
  }
}

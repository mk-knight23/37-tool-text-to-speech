/**
 * Test-only in-memory Storage mock.
 *
 * The runtime here (Node) does not expose a Web `localStorage` (it needs
 * `--localstorage-file`), so tests that exercise localStorage-backed code stub
 * this in via `vi.stubGlobal("localStorage", createMockStorage())`.
 *
 * Not a `*.test.*` file, so vitest does not collect it as a suite.
 */

export function createMockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

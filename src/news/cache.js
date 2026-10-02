// Cache de la dernière valeur connue : en mémoire, et copié sur disque pour
// survivre à un redémarrage du serveur.

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';

export class FileCache {
  constructor(file) {
    this.file = file;
    this.value = undefined; // undefined = pas encore lu sur disque
  }

  async get() {
    if (this.value !== undefined) return this.value;
    if (!this.file) return (this.value = null);
    try {
      this.value = JSON.parse(await readFile(this.file, 'utf8'));
    } catch {
      this.value = null;
    }
    return this.value;
  }

  async set(value) {
    this.value = value;
    if (!this.file) return;
    try {
      await mkdir(dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await writeFile(tmp, JSON.stringify(value));
      await rename(tmp, this.file);
    } catch (err) {
      // Le disque est un bonus : le cache mémoire suffit pour servir la page.
      console.warn(`[actus] cache disque non écrit : ${err.message}`);
    }
  }
}

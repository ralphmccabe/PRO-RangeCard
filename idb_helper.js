/**
 * IDB_HELPER.js
 * Robust IndexedDB wrapper for TRC PRO READY
 * Provides high-capacity, durable storage for DOPE cards and weapon profiles.
 */

const DB_NAME = 'TRC_PRO_DB';
const DB_VERSION = 1;
const STORES = {
    PROFILES: 'rangeCardProfiles',
    WEAPONS: 'weaponProfiles'
};

const idb = {
    db: null,

    async init() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.PROFILES)) {
                    db.createObjectStore(STORES.PROFILES);
                }
                if (!db.objectStoreNames.contains(STORES.WEAPONS)) {
                    db.createObjectStore(STORES.WEAPONS);
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                const error = event.target.error;
                console.error("[IDB] Database error:", error);
                // Also log to a global error collection for debugging
                window.IDB_CRITICAL_ERROR = error;
                reject(error);
            };
        });
    },

    async getStore(storeName, mode = 'readonly') {
        const db = await this.init();
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    },

    // Get all items as an object (to maintain compatibility with existing localStorage structure)
    async getAll(storeName) {
        const store = await this.getStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.openCursor();
            const results = {};
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    results[cursor.key] = cursor.value;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async set(storeName, key, value) {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async delete(storeName, key) {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Migration helper: Move data from LocalStorage to IndexedDB
    async migrateFromLocalStorage() {
        console.log("[IDB] Checking for legacy data to migrate...");

        // 1. Migrate Range Card Profiles
        const legacyProfiles = localStorage.getItem('rangeCardProfiles');
        if (legacyProfiles) {
            try {
                const profiles = JSON.parse(legacyProfiles);
                const count = Object.keys(profiles).length;
                if (count > 0) {
                    console.log(`[IDB] Migrating ${count} profiles from LocalStorage...`);
                    for (const [name, data] of Object.entries(profiles)) {
                        await this.set(STORES.PROFILES, name, data);
                    }
                    // Clear old data to prevent double migration
                    localStorage.removeItem('rangeCardProfiles');
                    console.log("[IDB] Profile migration complete.");
                }
            } catch (e) {
                console.error("[IDB] Profile migration failed:", e);
            }
        }

        // 2. Migrate Weapon Profiles
        const legacyWeapons = localStorage.getItem('weaponProfiles');
        if (legacyWeapons) {
            try {
                const weapons = JSON.parse(legacyWeapons);
                const count = Object.keys(weapons).length;
                if (count > 0) {
                    console.log(`[IDB] Migrating ${count} weapons from LocalStorage...`);
                    for (const [name, data] of Object.entries(weapons)) {
                        await this.set(STORES.WEAPONS, name, data);
                    }
                    localStorage.removeItem('weaponProfiles');
                    console.log("[IDB] Weapon migration complete.");
                }
            } catch (e) {
                console.error("[IDB] Weapon migration failed:", e);
            }
        }
    }
};

window.TRC_IDB = idb;

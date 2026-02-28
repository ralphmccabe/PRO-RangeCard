/**
 * IDB_HELPER.js
 * Robust IndexedDB wrapper for TRC PRO READY
 * Provides high-capacity, durable storage for DOPE cards and weapon profiles.
 */

const DB_NAME = 'TRC_PRO_DB';
const DB_VERSION = 1;
const STORES = {
    PROFILES: 'rangeCardProfiles',
    WEAPONS: 'weaponProfiles',
    VAULT: 'dopeVault',
    HISTORY: 'sessionHistory'
};

const idb = {
    db: null,

    async init() {
        if (!window.indexedDB) {
            console.error("[IDB] IndexedDB not supported.");
            return null;
        }
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORES.PROFILES)) db.createObjectStore(STORES.PROFILES);
                    if (!db.objectStoreNames.contains(STORES.WEAPONS)) db.createObjectStore(STORES.WEAPONS);
                    if (!db.objectStoreNames.contains(STORES.VAULT)) db.createObjectStore(STORES.VAULT);
                    if (!db.objectStoreNames.contains(STORES.HISTORY)) db.createObjectStore(STORES.HISTORY);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve(this.db);
                };

                request.onerror = (event) => {
                    const error = event.target.error;
                    console.error("[IDB] Database error:", error);
                    window.IDB_CRITICAL_ERROR = error;
                    reject(error);
                };
            } catch (e) {
                console.error("[IDB] Initial open failed:", e);
                reject(e);
            }
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
                for (const [name, data] of Object.entries(weapons)) {
                    await this.set(STORES.WEAPONS, name, data);
                }
                localStorage.removeItem('weaponProfiles');
                console.log("[IDB] Weapon migration complete.");
            } catch (e) {
                console.error("[IDB] Weapon migration failed:", e);
            }
        }

        // 3. Migrate Dope Vault (Large Images)
        const legacyVault = localStorage.getItem('trc_dope_vault');
        if (legacyVault) {
            try {
                const vault = JSON.parse(legacyVault);
                for (const [id, data] of Object.entries(vault)) {
                    await this.set(STORES.VAULT, id, data);
                }
                localStorage.removeItem('trc_dope_vault');
                console.log("[IDB] Dope Vault migration complete.");
            } catch (e) {
                console.error("[IDB] Vault migration failed:", e);
            }
        }

        // 4. Migrate Session History
        const legacyHistory = localStorage.getItem('rangeCardSessionHistory');
        if (legacyHistory) {
            try {
                const history = JSON.parse(legacyHistory);
                if (Array.isArray(history)) {
                    for (let i = 0; i < history.length; i++) {
                        await this.set(STORES.HISTORY, i.toString(), history[i]);
                    }
                }
                localStorage.removeItem('rangeCardSessionHistory');
                console.log("[IDB] Session History migration complete.");
            } catch (e) {
                console.error("[IDB] History migration failed:", e);
            }
        }
    }
};

window.TRC_IDB = idb;

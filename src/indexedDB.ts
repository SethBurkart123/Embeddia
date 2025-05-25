// uncomment for testing only
// import { IDBFactory } from 'fake-indexeddb';
// const indexedDB = new IDBFactory();

export interface StoreOptions {
  /** field to use as keyPath, omit for auto‑inc behaviour */
  primaryKey?: string;
  /** autoIncrement flag if you want both keyPath *and* a counter */
  autoIncrement?: boolean;
  /** additional secondary indices to create (unique = false) */
  indices?: string[];
}

export class IndexedDbManager {
  private DBname!: string;
  private objectStoreName!: string;

  constructor(DBname: string, objectStoreName: string) {
    this.DBname = DBname;
    this.objectStoreName = objectStoreName;
  }

  /**
   * @param DBname            database name
   * @param objectStoreName   store / table name
   * @param opts              optional schema options (see type below)
   */
  static async create(
    DBname: string = 'embeddiaDB',
    objectStoreName: string = 'embeddiaObjectStore',
    opts: StoreOptions = {},
  ): Promise<IndexedDbManager> {

    const instance = new IndexedDbManager(DBname, objectStoreName);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DBname);

      request.onerror = (ev) => {
        console.error('IndexedDB error:', ev);
        reject(new Error('Database initialization failed'));
      };

      request.onsuccess = async () => {
        const db = request.result;

        // create object store lazily if it does not exist
        if (!db.objectStoreNames.contains(objectStoreName)) {
          db.close();
          try {
            await instance.createObjectStore(opts);
          } catch (e) {
            return reject(e);
          }
        }
        db.close();
        resolve(instance);
      };
    });
  }

  async createObjectStore(opts: StoreOptions = {}): Promise<void> {
    const { primaryKey, autoIncrement, indices = [] } = opts;
  
    return new Promise((resolve, reject) => {
      // open once to read the current version
      const first = indexedDB.open(this.DBname);
      first.onerror = (ev) => {
        console.error('Error opening database:', ev);
        reject(new Error('Error opening database'));
      };
  
      first.onsuccess = () => {
        const oldDB = first.result;
        const nextVersion = oldDB.version + 1;
        oldDB.close();
  
        const upgrade = indexedDB.open(this.DBname, nextVersion);
  
        upgrade.onupgradeneeded = () => {
          const db = upgrade.result;
  
          if (!db.objectStoreNames.contains(this.objectStoreName)) {
            // keep default when no primaryKey passed
            const store = db.createObjectStore(this.objectStoreName, {
              keyPath: primaryKey ?? undefined,
              autoIncrement:
                primaryKey === undefined ? true : !!autoIncrement,
            });
  
            // optional extra indices
            for (const idx of indices) {
              if (!store.indexNames.contains(`by_${idx}`)) {
                store.createIndex(`by_${idx}`, idx, { unique: false });
              }
            }
          }
        };
  
        upgrade.onsuccess = () => {
          upgrade.result.close();
          resolve();
        };
  
        upgrade.onerror = (ev) => {
          console.error('Error creating object store:', ev);
          reject(new Error('Error creating object store'));
        };
      };
    });
  }
  
  async addToIndexedDB(
    objs: { [key: string]: any }[] | { [key: string]: any },
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = indexedDB.open(this.DBname);

      request.onsuccess = async () => {
        let db = request.result;
        const transaction = db.transaction([this.objectStoreName], 'readwrite');
        const objectStore = transaction.objectStore(this.objectStoreName);

        if (!Array.isArray(objs)) {
          objs = [objs];
        }

        objs.forEach((obj: { [key: string]: any }) => {
          const request = objectStore.put(obj);

          request.onerror = (event) => {
            console.error('Failed to add object', event);
            throw new Error('Failed to add object');
          };
        });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = (event) => {
          console.error('Failed to add object', event);
          reject(new Error('Failed to add object'));
        };
        db.close();
      };
    });
  }

  async clearObjectStore(
    DBname: string,
    objectStoreName: string,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = indexedDB.open(DBname);
      request.onsuccess = async () => {
        let db = request.result;
        db.deleteObjectStore(objectStoreName);
        resolve();
      };
      request.onerror = (event) => {
        console.error('Failed to clear object store', event);
        reject(new Error('Failed to clear object store'));
      };
    });
  }

  async *dbGenerator(): AsyncGenerator<any, void, undefined> {
    const objectStoreName = this.objectStoreName;
    const dbOpenPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.DBname);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(new Error('Could not open DB'));
      };
    });

    try {
      const db = await dbOpenPromise;
      const transaction = db.transaction([objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);
      const request = objectStore.openCursor();

      let promiseResolver: (value: any) => void;

      request.onsuccess = function (event: Event) {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          promiseResolver(cursor.value);
          cursor.continue();
        } else {
          promiseResolver(null);
        }
      };

      while (true) {
        const promise = new Promise<any>((resolve) => {
          promiseResolver = resolve;
        });
        const value = await promise;
        if (value === null) break;
        yield value;
      }

      db.close();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async deleteIndexedDBObjectStoreFromDB(
    DBname: string,
    objectStoreName: string,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = indexedDB.open(this.DBname);

      request.onsuccess = async () => {
        let db = request.result;
        var version = db.version;
        db.close();
        const request_2 = indexedDB.open(db.name, version + 1);
        request_2.onupgradeneeded = async () => {
          let db2 = request_2.result;
          if (db2.objectStoreNames.contains(objectStoreName)) {
            db2.deleteObjectStore(objectStoreName);
          } else {
            console.error(
              `Object store '${objectStoreName}' not found in database '${DBname}'`,
            );
            reject(
              new Error(
                `Object store '${objectStoreName}' not found in database '${DBname}'`,
              ),
            );
          }
        };
        request_2.onsuccess = () => {
          let db2 = request_2.result;
          db2.close();
          resolve();
        };
        request_2.onerror = (event) => {
          console.error('Failed to delete object store', event);
          let db2 = request_2.result;
          db2.close();
          reject(new Error('Failed to delete object store'));
        };
      };
      request.onerror = (event) => {
        console.error('Failed to open database', event);
        reject(new Error('Failed to open database'));
      };
    });
  }
}

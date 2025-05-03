import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface PaySurityDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'sync_status': boolean };
  };
}

// Define the Transaction interface
export interface Transaction {
  id: string;
  type: string;
  data: any;
  sync_status: boolean;
  created_at: string;
  updated_at: string;
}

export class DatabaseSync {
  private db: IDBPDatabase<PaySurityDB>;
  
  constructor(db: IDBPDatabase<PaySurityDB>) {
    this.db = db;
  }
  
  /**
   * Get all unsynced records using cursor-based approach
   * This is more efficient for large datasets as it doesn't load all records into memory at once
   */
  async getUnsyncedRecords(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      const request = this.db
        .transaction('transactions', 'readonly')
        .objectStore('transactions')
        .index('sync_status')
        .openCursor(IDBKeyRange.only(false));

      const unsynced: Transaction[] = [];
      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          unsynced.push(cursor.value);
          cursor.continue();
        } else {
          resolve(unsynced);
        }
      };
    });
  }
  
  /**
   * Mark a transaction as synced
   */
  async markAsSynced(id: string): Promise<void> {
    const tx = this.db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    
    const transaction = await store.get(id);
    if (transaction) {
      transaction.sync_status = true;
      transaction.updated_at = new Date().toISOString();
      await store.put(transaction);
    }
    
    await tx.done;
  }
  
  /**
   * Add a new transaction
   */
  async addTransaction(type: string, data: any): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.add('transactions', {
      id,
      type,
      data,
      sync_status: false,
      created_at: now,
      updated_at: now
    });
    
    return id;
  }
  
  /**
   * Get all transactions by type
   */
  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return this.db.getAllFromIndex('transactions', 'by-type', type);
  }
  
  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    await this.db.delete('transactions', id);
  }
  
  /**
   * Clear all synced transactions
   */
  async clearSyncedTransactions(): Promise<void> {
    const tx = this.db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const index = store.index('sync_status');
    
    let cursor = await index.openCursor(IDBKeyRange.only(true));
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }
}

// Initialize the database
export async function initSyncDB(): Promise<DatabaseSync> {
  const db = await openDB<PaySurityDB>('paysurity-sync', 1, {
    upgrade(db) {
      // Create the transactions store if it doesn't exist
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', {
          keyPath: 'id'
        });
        
        // Create indexes for efficient querying
        store.createIndex('sync_status', 'sync_status');
        store.createIndex('by-type', 'type');
      }
    }
  });
  
  return new DatabaseSync(db);
}
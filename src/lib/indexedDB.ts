import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface PaySurityDB extends DBSchema {
  offline_transactions: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      sync_status: boolean;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-type': string; 'by-sync-status': boolean };
  };
}

// Database name and version
const DB_NAME = 'paysurity-db';
const DB_VERSION = 1;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<PaySurityDB>> {
  return openDB<PaySurityDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the offline_transactions store if it doesn't exist
      if (!db.objectStoreNames.contains('offline_transactions')) {
        const store = db.createObjectStore('offline_transactions', {
          keyPath: 'id'
        });
        
        // Create indexes for efficient querying
        store.createIndex('by-type', 'type');
        store.createIndex('by-sync-status', 'sync_status');
      }
    }
  });
}

// Add a transaction to the offline store
export async function addOfflineTransaction(
  type: string,
  data: any
): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.add('offline_transactions', {
    id,
    type,
    data,
    sync_status: false,
    created_at: now,
    updated_at: now
  });
  
  return id;
}

// Get all transactions of a specific type
export async function getOfflineTransactionsByType(
  type: string
): Promise<any[]> {
  const db = await initDB();
  return db.getAllFromIndex('offline_transactions', 'by-type', type);
}

// Get all unsynchronized transactions
export async function getUnsyncedTransactions(): Promise<any[]> {
  const db = await initDB();
  return db.getAllFromIndex('offline_transactions', 'by-sync-status', false);
}

// Mark a transaction as synchronized
export async function markTransactionSynced(id: string): Promise<void> {
  const db = await initDB();
  const tx = await db.transaction('offline_transactions', 'readwrite');
  const store = tx.objectStore('offline_transactions');
  
  const transaction = await store.get(id);
  if (transaction) {
    transaction.sync_status = true;
    transaction.updated_at = new Date().toISOString();
    await store.put(transaction);
  }
  
  await tx.done;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('offline_transactions', id);
}

// Clear all synchronized transactions
export async function clearSyncedTransactions(): Promise<void> {
  const db = await initDB();
  const tx = await db.transaction('offline_transactions', 'readwrite');
  const store = tx.objectStore('offline_transactions');
  const index = store.index('by-sync-status');
  
  let cursor = await index.openCursor(true);
  
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  
  await tx.done;
}

// Get a specific transaction by ID
export async function getTransaction(id: string): Promise<any | undefined> {
  const db = await initDB();
  return db.get('offline_transactions', id);
}

// Update a transaction
export async function updateTransaction(
  id: string,
  data: any
): Promise<void> {
  const db = await initDB();
  const tx = await db.transaction('offline_transactions', 'readwrite');
  const store = tx.objectStore('offline_transactions');
  
  const transaction = await store.get(id);
  if (transaction) {
    transaction.data = { ...transaction.data, ...data };
    transaction.updated_at = new Date().toISOString();
    await store.put(transaction);
  }
  
  await tx.done;
}
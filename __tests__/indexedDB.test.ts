import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  initDB, 
  addOfflineTransaction, 
  getOfflineTransactionsByType,
  getUnsyncedTransactions,
  markTransactionSynced,
  deleteTransaction,
  clearSyncedTransactions,
  getTransaction,
  updateTransaction
} from '../src/lib/indexedDB';

// Mock indexedDB
import { IDBFactory } from 'fake-indexeddb';
import { IDBKeyRange } from 'fake-indexeddb/lib/FDBKeyRange';

// Setup global indexedDB mock
const originalIndexedDB = global.indexedDB;
const originalIDBKeyRange = global.IDBKeyRange;

describe('IndexedDB Utils', () => {
  beforeEach(() => {
    // Setup fake IndexedDB
    global.indexedDB = new IDBFactory();
    global.IDBKeyRange = IDBKeyRange;
    
    // Mock crypto.randomUUID
    global.crypto = {
      ...global.crypto,
      randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000')
    };
  });

  afterEach(() => {
    // Restore original IndexedDB
    global.indexedDB = originalIndexedDB;
    global.IDBKeyRange = originalIDBKeyRange;
    vi.clearAllMocks();
  });

  it('should initialize the database', async () => {
    const db = await initDB();
    expect(db).toBeDefined();
    expect(db.name).toBe('paysurity-db');
    expect(db.version).toBe(1);
    expect(Array.from(db.objectStoreNames)).toContain('offline_transactions');
  });

  it('should add an offline transaction', async () => {
    const id = await addOfflineTransaction('payroll_run', { test: 'data' });
    expect(id).toBe('123e4567-e89b-12d3-a456-426614174000');
    
    const db = await initDB();
    const tx = await db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const result = await store.get(id);
    
    expect(result).toBeDefined();
    expect(result.type).toBe('payroll_run');
    expect(result.data).toEqual({ test: 'data' });
    expect(result.sync_status).toBe(false);
  });

  it('should get transactions by type', async () => {
    await addOfflineTransaction('payroll_run', { test: 'data1' });
    await addOfflineTransaction('payroll_run', { test: 'data2' });
    await addOfflineTransaction('time_entry', { test: 'data3' });
    
    const payrollRuns = await getOfflineTransactionsByType('payroll_run');
    expect(payrollRuns).toHaveLength(2);
    expect(payrollRuns[0].data.test).toBe('data1');
    expect(payrollRuns[1].data.test).toBe('data2');
    
    const timeEntries = await getOfflineTransactionsByType('time_entry');
    expect(timeEntries).toHaveLength(1);
    expect(timeEntries[0].data.test).toBe('data3');
  });

  it('should get unsynced transactions', async () => {
    const id1 = await addOfflineTransaction('payroll_run', { test: 'data1' });
    const id2 = await addOfflineTransaction('time_entry', { test: 'data2' });
    
    // Mark one as synced
    await markTransactionSynced(id1);
    
    const unsynced = await getUnsyncedTransactions();
    expect(unsynced).toHaveLength(1);
    expect(unsynced[0].id).toBe(id2);
    expect(unsynced[0].data.test).toBe('data2');
  });

  it('should mark a transaction as synced', async () => {
    const id = await addOfflineTransaction('payroll_run', { test: 'data' });
    await markTransactionSynced(id);
    
    const db = await initDB();
    const tx = await db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const result = await store.get(id);
    
    expect(result.sync_status).toBe(true);
  });

  it('should delete a transaction', async () => {
    const id = await addOfflineTransaction('payroll_run', { test: 'data' });
    await deleteTransaction(id);
    
    const db = await initDB();
    const tx = await db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const result = await store.get(id);
    
    expect(result).toBeUndefined();
  });

  it('should clear synced transactions', async () => {
    const id1 = await addOfflineTransaction('payroll_run', { test: 'data1' });
    const id2 = await addOfflineTransaction('time_entry', { test: 'data2' });
    
    // Mark one as synced
    await markTransactionSynced(id1);
    
    await clearSyncedTransactions();
    
    const db = await initDB();
    const tx = await db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    
    const result1 = await store.get(id1);
    const result2 = await store.get(id2);
    
    expect(result1).toBeUndefined();
    expect(result2).toBeDefined();
  });

  it('should get a transaction by ID', async () => {
    const id = await addOfflineTransaction('payroll_run', { test: 'data' });
    const transaction = await getTransaction(id);
    
    expect(transaction).toBeDefined();
    expect(transaction.id).toBe(id);
    expect(transaction.type).toBe('payroll_run');
    expect(transaction.data).toEqual({ test: 'data' });
  });

  it('should update a transaction', async () => {
    const id = await addOfflineTransaction('payroll_run', { test: 'data', count: 1 });
    await updateTransaction(id, { count: 2, newField: 'value' });
    
    const transaction = await getTransaction(id);
    
    expect(transaction.data).toEqual({ test: 'data', count: 2, newField: 'value' });
  });
});
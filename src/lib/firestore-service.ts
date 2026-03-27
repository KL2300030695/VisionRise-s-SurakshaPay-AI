import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  Timestamp,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Universal Firestore Service
 */
export const FirestoreService = {
  /**
   * Add a new document to a collection
   */
  async addDocument<T>(collectionName: string, data: T) {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...(data as any),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...(data as any) } as T & { id: string };
  },

  /**
   * Get a document by ID
   */
  async getDocument<T>(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    }
    return null;
  },

  /**
   * Update a document by ID
   */
  async updateDocument(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  },

  /**
   * Single document query (e.g., find by email)
   */
  async findOne<T>(collectionName: string, constraints: QueryConstraint[]) {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints, limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    }
    return null;
  },

  /**
   * Find many documents
   */
  async findMany<T>(collectionName: string, constraints: QueryConstraint[]) {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (T & { id: string })[];
  },

  /**
   * Delete a document by ID
   */
  async deleteDocument(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  }
};

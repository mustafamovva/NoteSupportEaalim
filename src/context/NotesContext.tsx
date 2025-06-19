"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  orderBy, 
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "../app/firebase";

// Define types
export interface Note {
  id: string;
  studentName: string;
  teacherName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  creatorEmail?: string;
  creatorName?: string;
}

export interface Reply {
  id: string;
  noteId: string;
  content: string;
  createdAt: Date;
  creatorEmail: string;
  creatorName: string;
}

interface NotesContextType {
  // Notes state
  notes: Note[];
  loading: boolean;
  fetchNotes: (collectionName?: string) => Promise<void>;
  
  // Note operations
  saveNote: (note: { 
    studentName: string; 
    teacherName: string; 
    content: string; 
    id?: string;
  }, collectionName?: string) => Promise<void>;
  deleteNote: (noteId: string, collectionName?: string) => Promise<void>;
  
  // Replies state and operations
  replies: Reply[];
  loadingReplies: boolean;
  fetchReplies: (noteId: string, collectionName?: string) => Promise<void>;
  addReply: (noteId: string, content: string, collectionName?: string) => Promise<string | undefined>;
  deleteReply: (noteId: string, replyId: string, collectionName?: string) => Promise<void>;
  
  // Utility functions
  formatDate: (date: Date) => string;
}

// Create context with default value
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Provider component
export function NotesProvider({ children, collectionName = 'normalNotes' }: { 
  children: ReactNode;
  collectionName?: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Format date helper function
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Fetch all notes
  const fetchNotes = useCallback(async (collectionName2 = collectionName) => {
    try {
      console.log(`Fetching notes from collection: ${collectionName2}`);
      setLoading(true);
      
      // Ensure we're using a valid collection name
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        return;
      }
      
      // Reference to the specific collection
      const notesRef = collection(db, collectionName2);
      
      // Order notes by the most recent date (either createdAt or updatedAt) in descending order
      const q = query(notesRef, orderBy("updatedAt", "desc"));
      
      console.log(`Executing query on collection: ${collectionName2}`);
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.size} documents from ${collectionName2}`);
      
      const fetchedNotes: Note[] = [];

      // Process each document
      querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        console.log(`Processing document from ${collectionName2}: ${docSnapshot.id}`, data);
        
        // Create a note object from the document data
        try {
          // Handle potential missing timestamp fields by creating current date if needed
          let createdAt = new Date();
          let updatedAt = new Date();
          
          // Safely convert Firestore timestamps to Date objects
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            }
          }
          
          if (data.updatedAt) {
            if (typeof data.updatedAt.toDate === 'function') {
              updatedAt = data.updatedAt.toDate();
            } else if (data.updatedAt instanceof Date) {
              updatedAt = data.updatedAt;
            }
          }
          
          const note: Note = {
            id: docSnapshot.id,
            studentName: data.studentName || "",
            teacherName: data.teacherName || "",
            content: data.content || "",
            createdAt: createdAt,
            updatedAt: updatedAt,
            creatorEmail: data.creatorEmail || "",
            creatorName: data.creatorName || (data.creatorEmail ? data.creatorEmail.split('@')[0] : "")
          };
          
          fetchedNotes.push(note);
        } catch (err) {
          console.error(`Error processing document ${docSnapshot.id}:`, err);
        }
      });

      console.log(`Setting ${fetchedNotes.length} notes in state from collection: ${collectionName2}`);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error(`Error fetching notes from collection: ${collectionName2}:`, error);
      // Don't throw the error, just log it
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Save note (create or update)
  const saveNote = async (note: { studentName: string; teacherName: string; content: string; id?: string; }, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to save note to collection: ${collectionName2}`, note);
      
      // Input validation
      if (!note.studentName.trim() || !note.teacherName.trim() || !note.content.trim()) {
        throw new Error("All fields are required.");
      }
      
      // Ensure we're using a valid collection name
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }

      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email || "anonymous@example.com";
      const userName = currentUser?.displayName || userEmail.split('@')[0];
      
      const now = new Date();
      
      if (note.id) {
        // Update existing note
        console.log(`Updating existing note with ID: ${note.id} in collection: ${collectionName2}`);
        
        try {
          // First check if the document exists
          const noteRef = doc(db, collectionName2, note.id);
          const noteSnap = await getDoc(noteRef);
          
          if (noteSnap.exists()) {
            // Document exists, proceed with update
            const updateData = {
              studentName: note.studentName,
              teacherName: note.teacherName,
              content: note.content,
              updatedAt: now
            };
            
            await updateDoc(noteRef, updateData);
            console.log(`Successfully updated note with ID: ${note.id}`);
            
            // Update the note in the notes list
            setNotes(prevNotes => 
              prevNotes.map(n => 
                n.id === note.id ? { 
                  ...n, 
                  studentName: note.studentName,
                  teacherName: note.teacherName,
                  content: note.content,
                  updatedAt: now
                } : n
              )
            );
          } else {
            // Document doesn't exist, create a new one with the same ID
            console.log(`Note with ID ${note.id} doesn't exist in Firestore, creating new document`);
            
            const newNoteData = {
              studentName: note.studentName,
              teacherName: note.teacherName,
              content: note.content,
              createdAt: now,
              updatedAt: now,
              creatorEmail: userEmail,
              creatorName: userName
            };
            
            // Use setDoc to create a document with a specific ID
            await setDoc(noteRef, newNoteData);
            console.log(`Successfully created new note with ID: ${note.id}`);
            
            // Update the note in the notes list
            setNotes(prevNotes => 
              prevNotes.map(n => 
                n.id === note.id ? { 
                  ...n, 
                  studentName: note.studentName,
                  teacherName: note.teacherName,
                  content: note.content,
                  createdAt: now,
                  updatedAt: now,
                  creatorEmail: userEmail,
                  creatorName: userName
                } : n
              )
            );
          }
        } catch (error) {
          console.error(`Error checking/updating note with ID ${note.id}:`, error);
          throw error;
        }
      } else {
        // Create new note
        console.log(`Creating new note in collection: ${collectionName2}`);
        const noteData = {
          studentName: note.studentName,
          teacherName: note.teacherName,
          content: note.content,
          createdAt: now,
          updatedAt: now,
          creatorEmail: userEmail,
          creatorName: userName
        };
        
        const notesRef = collection(db, collectionName2);
        const newNoteRef = await addDoc(notesRef, noteData);
        console.log(`Successfully created note with ID: ${newNoteRef.id}`);
        
        // Add the new note to the notes list
        const newNote = {
          id: newNoteRef.id,
          ...noteData
        };
        
        setNotes(prevNotes => [newNote, ...prevNotes]);
      }
    } catch (error) {
      console.error(`Error saving note to collection: ${collectionName2}:`, error);
      throw error;
    }
  };

  // Delete note and its replies
  const deleteNote = async (noteId: string, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to delete note with ID: ${noteId} from collection: ${collectionName2}`);
      
      // Ensure we're using a valid collection name and note ID
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }
      
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        throw new Error("Invalid note ID");
      }
      
      // Delete all replies for this note
      console.log(`Fetching replies for note ID: ${noteId}`);
      const repliesRef = collection(db, `${collectionName2}/${noteId}/replies`);
      const repliesSnapshot = await getDocs(repliesRef);
      
      console.log(`Found ${repliesSnapshot.size} replies to delete`);
      
      // Use a batch to delete all replies
      const batch = writeBatch(db);
      repliesSnapshot.forEach((replyDoc) => {
        console.log(`Adding reply ID: ${replyDoc.id} to deletion batch`);
        batch.delete(doc(db, `${collectionName2}/${noteId}/replies`, replyDoc.id));
      });
      
      // Add the note deletion to the batch
      console.log(`Adding note ID: ${noteId} to deletion batch`);
      batch.delete(doc(db, collectionName2, noteId));
      
      // Commit the batch
      console.log('Committing deletion batch...');
      await batch.commit();
      console.log('Batch committed successfully');
      
      // Update the notes list in state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      console.log(`Successfully deleted note with ID: ${noteId} and all its replies`);
    } catch (error) {
      console.error(`Error deleting note with ID: ${noteId} from collection: ${collectionName2}:`, error);
      throw error;
    }
  };

  // Fetch replies for a note
  const fetchReplies = async (noteId: string, collectionName2 = collectionName) => {
    try {
      console.log(`Fetching replies for note ID: ${noteId} from collection: ${collectionName2}`);
      
      // Ensure we're using a valid collection name and note ID
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        return;
      }
      
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        return;
      }
      
      // Clear previous replies and set loading state
      setReplies([]);
      setLoadingReplies(true);
      
      // First, check if the note exists
      const noteDocRef = doc(db, collectionName2, noteId);
      const noteSnapshot = await getDoc(noteDocRef);
      
      if (!noteSnapshot.exists()) {
        console.warn(`Note with ID ${noteId} does not exist in collection ${collectionName2}`);
        setLoadingReplies(false);
        return;
      }
      
      console.log(`Note found. Checking for replies subcollection...`);
      
      // Construct the proper path to the replies subcollection
      const repliesPath = `${collectionName2}/${noteId}/replies`;
      console.log(`Using replies path: ${repliesPath}`);
      
      // Get a reference to the replies subcollection
      const repliesRef = collection(db, repliesPath);
      
      // First get count of replies to see if the subcollection exists
      const countQuery = query(repliesRef, limit(1));
      const countSnapshot = await getDocs(countQuery);
      
      if (countSnapshot.empty) {
        console.log(`No replies found for note ID: ${noteId}`);
        setLoadingReplies(false);
        return;
      }
      
      // Subcollection exists and has documents, perform the main query
      console.log(`Replies subcollection exists. Fetching replies...`);
      
      // Query to get replies sorted by creation time
      const q = query(repliesRef, orderBy("createdAt", "asc"));
      
      console.log(`Executing query on replies collection`);
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.size} replies`);
      
      // Use a Map to ensure unique reply IDs
      const repliesMap = new Map<string, Reply>();
      
      // Process each reply document
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const replyId = doc.id;
        console.log(`Processing reply: ${replyId}`, data);
        
        // Skip if we already have this reply ID (prevent duplicates)
        if (repliesMap.has(replyId)) {
          console.warn(`Duplicate reply ID found: ${replyId}. Skipping.`);
          return;
        }
        
        // Handle potential missing timestamp fields
        let createdAt = new Date();
        
        // Safely convert Firestore timestamp to Date object
        if (data.createdAt) {
          try {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            }
          } catch (err) {
            console.error(`Error converting timestamp for reply ${replyId}:`, err);
            // Use current date as fallback
          }
        }
        
        // Create reply object and store in map
        repliesMap.set(replyId, {
          id: replyId,
          noteId: noteId,
          content: data.content || "",
          createdAt: createdAt,
          creatorEmail: data.creatorEmail || "",
          creatorName: data.creatorName || (data.creatorEmail ? data.creatorEmail.split('@')[0] : "")
        });
      });
      
      // Convert map values to array
      const fetchedReplies = Array.from(repliesMap.values());
      
      console.log(`Setting ${fetchedReplies.length} unique replies in state`);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error(`Error fetching replies for note ID: ${noteId} from collection: ${collectionName2}:`, error);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Delete a reply from a note
  const deleteReply = async (noteId: string, replyId: string, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to delete reply with ID: ${replyId} from note ID: ${noteId} in collection: ${collectionName2}`);
      
      // Ensure we're using a valid collection name and IDs
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }
      
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        throw new Error("Invalid note ID");
      }
      
      if (!replyId) {
        console.error("Reply ID is undefined or empty");
        throw new Error("Invalid reply ID");
      }
      
      // Reference to the specific reply document
      const replyPath = `${collectionName2}/${noteId}/replies/${replyId}`;
      console.log(`Deleting reply at path: ${replyPath}`);
      
      const replyRef = doc(db, replyPath);
      
      // Check if the reply exists first
      const replySnap = await getDoc(replyRef);
      
      if (!replySnap.exists()) {
        console.warn(`Reply with ID ${replyId} does not exist in note ${noteId}`);
        throw new Error("Reply not found");
      }
      
      // Delete the reply document
      await deleteDoc(replyRef);
      console.log(`Successfully deleted reply with ID: ${replyId}`);
      
      // Update the replies state by removing the deleted reply
      setReplies(prevReplies => prevReplies.filter(reply => reply.id !== replyId));
      
      // Update the note's updatedAt timestamp
      const noteRef = doc(db, collectionName2, noteId);
      await updateDoc(noteRef, {
        updatedAt: new Date()
      });
      
      // Update the note in the notes list with the new updatedAt time
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, updatedAt: new Date() } : note
        )
      );
    } catch (error) {
      console.error(`Error deleting reply with ID: ${replyId} from note ID: ${noteId}:`, error);
      throw error;
    }
  };
  
  // Add a reply to a note
  const addReply = async (noteId: string, content: string, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to add reply to note ID: ${noteId} in collection: ${collectionName2}`);
      
      // Input validation
      if (!content.trim()) {
        console.error("Reply content cannot be empty");
        throw new Error("Reply content cannot be empty");
      }
      
      // Ensure we're using a valid collection name and note ID
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }
      
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        throw new Error("Invalid note ID");
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to add a reply");
      }
      
      const userEmail = currentUser.email || "anonymous@example.com";
      const userName = currentUser.displayName || userEmail.split('@')[0];
      
      const now = new Date();
      const replyData = {
        noteId,
        content,
        createdAt: now,
        creatorEmail: userEmail,
        creatorName: userName
      };
      
      const repliesPath = `${collectionName2}/${noteId}/replies`;
      console.log(`Using replies path for adding reply: ${repliesPath}`);
      
      const repliesRef = collection(db, repliesPath);
      const replyDoc = await addDoc(repliesRef, replyData);
      console.log(`Successfully added reply with ID: ${replyDoc.id}`);
      
      // Add the new reply to the replies list
      const newReply = {
        id: replyDoc.id,
        ...replyData
      };
      
      setReplies(prevReplies => [...prevReplies, newReply]);
      console.log(`Added new reply to state`);

      // Update the note in the notes list with the new updatedAt time
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, updatedAt: now } : note
        )
      );
      console.log(`Updated note's updatedAt timestamp`);

      return replyDoc.id;
    } catch (error) {
      console.error(`Error adding reply to note ID: ${noteId} in collection: ${collectionName2}:`, error);
      throw error;
    }
  };
  
  // Load notes on initial render
  useEffect(() => {
    console.log(`NotesProvider initialized with collection: ${collectionName}`);
    const loadInitialNotes = async () => {
      try {
        await fetchNotes(collectionName);
        console.log(`Successfully fetched initial notes from collection: ${collectionName}`);
      } catch (error) {
        console.error(`Error fetching initial notes from collection: ${collectionName}`, error);
      }
    };
    
    loadInitialNotes();
  }, [collectionName, fetchNotes]);

  // Wrap functions in useCallback to prevent unnecessary re-renders
  const memoizedFetchReplies = useCallback(fetchReplies, [collectionName]);
  const memoizedDeleteReply = useCallback(deleteReply, [collectionName]);
  
  // Value object containing all the context data
  const value = {
    notes,
    loading,
    fetchNotes,
    saveNote,
    deleteNote,
    replies,
    loadingReplies,
    fetchReplies: memoizedFetchReplies,
    addReply,
    deleteReply: memoizedDeleteReply,
    formatDate
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use the notes context
export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
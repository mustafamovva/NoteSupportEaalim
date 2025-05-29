"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { 
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../app/firebase";
 
export interface Note{
  id: string;
  studentName: string;
  teacherName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  creatorEmail?: string;
  creatorName?: string;
}

export interface Reply{
  id: string;
  noteId: string;
  content: string;
  createdAt: Date;
  creatorEmail: string; 
  creatorName: string;
}

interface NotesContextType{
  notes: Note[];
  loading: boolean;
  fetchNotes: (collectionName?: string) => Promise<void>;
  saveNote: (note: {
    studentName: string;
    teacherName: string;
    content: string;
    id?: string;

  }, collectionName?: string) => Promise<void>;
  deleteNote: (noteId: string, collectionName?: string) => Promise<void>;

  replies: Reply[];
  loadingReplies: boolean;
  fetchReplies: (noteId: string, collectionName?: string) => Promise<void>;
  addReply: (noteId: string, content: string, collectionName?: string) => Promise<string | undefined>;
  deleteReply: (noteId: string, replyId: string, collectionName?: string) => Promise<void>;
  formatDate: (date: Date) => string;
}
const NotesContext = createContext<NotesContextType | undefined>(undefined);
export function NotesProvider({ children, collectionName = "normalNotes" }: {
  children: ReactNode;
  collectionName?: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    }).format(date);
  };
  const fetchNotes = async (collectionName2 = collectionName) => {
    try {
      console.log(`Fetching notes from collection:${collectionName2}`);
      setLoading(true);
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        return;
      }
      const notesRef = collection(db, collectionName2);
      const q = query(notesRef);
      console.log(`Executing query on collection:${collectionName2}`);
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.size} documents from ${collectionName2}`);
      const fetchedNotes: Note[] = [];
      querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnapshot.data();
        console.log(`Processing document from ${collectionName2}:${docSnapshot.id}`, data);
        try {
          let createdAt = new Date();
          let updatedAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            }
          }
          if (data.updatedAt) {
            if (typeof data.updatedAt.toDate === "function") {
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
            creatorName: data.creatorName || (data.creatorEmail ? data.creatorEmail.split("@")[0] : "")
          };
          fetchedNotes.push(note);
        } catch (err) {
          console.error(`Error processing document ${docSnapshot.id}:`, err);
        }
      });
      console.log(`setting ${fetchedNotes.length} notes in state from collection :${collectionName2}`);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error(`Error fetching notes from collection:${collectionName2}:`, error);
    } finally {
      setLoading(false);
    }
  };
  const saveNote = async (note: { studentName: string; teacherName: string; content: string; id?: string; }, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to save note to collection: ${collectionName2}`, note);
      if (!note.studentName.trim() || !note.teacherName.trim() || !note.content.trim()) {
        throw new Error("All fields are required.")
      }
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }
      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email || "anonymous@example.com";
      const userName = currentUser?.displayName || userEmail.split("@")[0];
      const now = new Date();
      if (note.id) {
        console.log(`Updating existing note with ID:${note.id} in collection:${collectionName2}`);
        try {
          const noteRef = doc(db, collectionName2, note.id);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            const updateData = {
              studentName: note.studentName,
              teacherName: note.teacherName,
              content: note.content,
              updatedAt: now
            };
            await updateDoc(noteRef, updateData);
            console.log(`Successfully updated note with ID:${note.id}`);
            setNotes(prevNotes =>
              prevNotes.map(n => n.id === note.id ? {
                ...n,
                studentName: note.studentName,
                teacherName: note.teacherName,
                content: note.content,
                updatedAt: now
              } : n
              )
            );
          } else {
            console.log(`Note with ID ${note.id} doesnot exist in firestore, creating new document`);
            const newNoteData = {
              studentName: note.studentName,
              teacherName: note.teacherName,
              content: note.content,
              createdAt: now,
              updatedAt: now,
              creatorEmail: userEmail,
              creatorName: userName,
            };
            await setDoc(noteRef, newNoteData);
            console.log(`Successfully created new note with ID:${note.id}`);
            setNotes(prevNotes =>
              prevNotes.map(n => n.id === note.id ? {
                ...n,
                studentName: note.studentName,
                teacherName: note.teacherName,
                content: note.content,
                createdAt: now,
                updatedAt: now,
                creatorEmail: userEmail,
                creatorName: userName,
              } : n
              )
            );
          }
        } catch (error) {
          console.error(`Error checking/updating note with ID ${note.id}:`, error);
          throw error;
        }
      } else {
        console.log(`Creating new note in collection: ${collectionName2}`);
        const noteData = {
          studentName: note.studentName,
          teacherName: note.teacherName,
          content: note.content,
          createdAt: now,
          updatedAt: now,
          creatorEmail: userEmail,
          creatorName: userName,
        };
        const notesRef = collection(db, collectionName2);
        const newNoteRef = await addDoc(notesRef, noteData);
        console.log(`Successfully created note with ID: ${newNoteRef.id}`);
        const newNote = {
          id: newNoteRef.id,
          ...noteData
        };
        setNotes(prevNotes => [newNote, ...prevNotes]);
      }
    } catch (error) {
      console.error(`Error saving note to collection:${collectionName2}:`, error);
      throw error;
    }
  };
  // Delete a note by ID function
}

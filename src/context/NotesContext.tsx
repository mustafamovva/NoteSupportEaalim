"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
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
  notes: Note[];
  loading: boolean;
  fetchNotes: (collectionName?: string) => Promise<void>;
  saveNote: (
    note: {
      studentName: string;
      teacherName: string;
      content: string;
      id?: string;
    },
    collectionName?: string
  ) => Promise<void>;
  deleteNote: (noteId: string, collectionName?: string) => Promise<void>;

  replies: Reply[];
  loadingReplies: boolean;
  fetchReplies: (noteId: string, collectionName?: string) => Promise<void>;
  addReply: (
    noteId: string,
    content: string,
    collectionName?: string
  ) => Promise<string | undefined>;
  deleteReply: (
    noteId: string,
    replyId: string,
    collectionName?: string
  ) => Promise<void>;
  formatDate: (date: Date) => string;
}
const NotesContext = createContext<NotesContextType | undefined>(undefined);
export function NotesProvider({
  children,
  collectionName = "normalNotes",
}: {
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
      hour12: true,
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
      console.log(
        `Query returned ${querySnapshot.size} documents from ${collectionName2}`
      );
      const fetchedNotes: Note[] = [];
      querySnapshot.forEach(
        (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnapshot.data();
          console.log(
            `Processing document from ${collectionName2}:${docSnapshot.id}`,
            data
          );
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
              creatorName:
                data.creatorName ||
                (data.creatorEmail ? data.creatorEmail.split("@")[0] : ""),
            };
            fetchedNotes.push(note);
          } catch (err) {
            console.error(`Error processing document ${docSnapshot.id}:`, err);
          }
        }
      );
      console.log(
        `setting ${fetchedNotes.length} notes in state from collection :${collectionName2}`
      );
      setNotes(fetchedNotes);
    } catch (error) {
      console.error(
        `Error fetching notes from collection:${collectionName2}:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };
  const saveNote = async (
    note: {
      studentName: string;
      teacherName: string;
      content: string;
      id?: string;
    },
    collectionName2 = collectionName
  ) => {
    try {
      console.log(
        `Attempting to save note to collection: ${collectionName2}`,
        note
      );
      if (
        !note.studentName.trim() ||
        !note.teacherName.trim() ||
        !note.content.trim()
      ) {
        throw new Error("All fields are required.");
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
        console.log(
          `Updating existing note with ID:${note.id} in collection:${collectionName2}`
        );
        try {
          const noteRef = doc(db, collectionName2, note.id);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            const updateData = {
              studentName: note.studentName,
              teacherName: note.teacherName,
              content: note.content,
              updatedAt: now,
            };
            await updateDoc(noteRef, updateData);
            console.log(`Successfully updated note with ID:${note.id}`);
            setNotes((prevNotes) =>
              prevNotes.map((n) =>
                n.id === note.id
                  ? {
                      ...n,
                      studentName: note.studentName,
                      teacherName: note.teacherName,
                      content: note.content,
                      updatedAt: now,
                    }
                  : n
              )
            );
          } else {
            console.log(
              `Note with ID ${note.id} doesnot exist in firestore, creating new document`
            );
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
            setNotes((prevNotes) =>
              prevNotes.map((n) =>
                n.id === note.id
                  ? {
                      ...n,
                      studentName: note.studentName,
                      teacherName: note.teacherName,
                      content: note.content,
                      createdAt: now,
                      updatedAt: now,
                      creatorEmail: userEmail,
                      creatorName: userName,
                    }
                  : n
              )
            );
          }
        } catch (error) {
          console.error(
            `Error checking/updating note with ID ${note.id}:`,
            error
          );
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
          ...noteData,
        };
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    } catch (error) {
      console.error(
        `Error saving note to collection:${collectionName2}:`,
        error
      );
      throw error;
    }
  };
  const deleteNote = async (
    noteId: string,
    collectionName2 = collectionName
  ) => {
    try {
      console.log(
        `Attempting to delete note with ID: ${noteId} from collection: ${collectionName2}`
      );
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        throw new Error("Invalid collection name");
      }
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        throw new Error("Invalid note ID");
      }
      console.log(`Fetching replies for note ID: ${noteId}`);
      const repliesRef = collection(db, `${collectionName2}/${noteId}/replies`);
      const repliesSnapshot = await getDocs(repliesRef);
      console.log(`Found ${repliesSnapshot.size} replies to delete`);
      const batch = writeBatch(db);
      repliesSnapshot.forEach((replyDoc) => {
        console.log(`Adding reply ID: ${replyDoc.id} to deletion batch`);
        batch.delete(
          doc(db, `${collectionName2}/${noteId}/replies`, replyDoc.id)
        );
      });
      console.log(`Adding note ID: ${noteId} to deletion batch`);
      batch.delete(doc(db, collectionName2, noteId));
      console.log("Committing deletion batch...");
      await batch.commit();
      console.log("Batch committed successfully");
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      console.log(
        `Successfully deleted note with ID: ${noteId} and all its replies`
      );
    } catch (error) {
      console.error(
        `Error deleting note with ID: ${noteId} from collection: ${collectionName2}:`,
        error
      );
      throw error;
    }
  };
  const fetchReplies = async (
    noteId: string,
    collectionName2 = collectionName
  ) => {
    try {
      console.log(
        `Fetching replies for note ID: ${noteId} from collection: ${collectionName2}`
      );
      if (!collectionName2) {
        console.error("Collection name is undefined or empty");
        return;
      }
      if (!noteId) {
        console.error("Note ID is undefined or empty");
        return;
      }
      setReplies([]);
      setLoadingReplies(true);
      const noteDocRef = doc(db, collectionName2, noteId);
      const noteSnapshot = await getDoc(noteDocRef);
      if (!noteSnapshot.exists()) {
        console.warn(
          `Note with ID ${noteId} does not exist in collection ${collectionName2}`
        );
        setLoadingReplies(false);
        return;
      }
      console.log(`Note found. Checking for replies subcollection...`);
      const repliesPath = `${collectionName2}/${noteId}/replies`;
      console.log(`Using replies path: ${repliesPath}`);
      const repliesRef = collection(db, repliesPath);
      const countQuery = query(repliesRef, limit(1));
      const countSnapshot = await getDocs(countQuery);
      if (countSnapshot.empty) {
        console.log(`No replies found for note ID: ${noteId}`);
        setLoadingReplies(false);
        return;
      }
      console.log(`Replies subcollection exists. Fetching replies...`);
      const q = query(repliesRef, orderBy("createdAt", "asc"));
      console.log(`Executing query on replies collection`);
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.size} replies`);
      const repliesMap = new Map<string, Reply>();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const replyId = doc.id;
        console.log(`Processing reply: ${replyId}`, data);
        if (repliesMap.has(replyId)) {
          console.warn(`Duplicate reply ID found: ${replyId}. Skipping.`);
          return;
        }
        let createdAt = new Date();
        if (data.createdAt) {
          try {
            if (typeof data.createdAt.toDate === "function") {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            }
          } catch (err) {
            console.error(
              `Error converting timestamp for reply ${replyId}:`,
              err
            );
          }
        }
        repliesMap.set(replyId, {
          id: replyId,
          noteId: noteId,
          content: data.content || "",
          createdAt: createdAt,
          creatorEmail: data.creatorEmail || "",
          creatorName:
            data.creatorName ||
            (data.creatorEmail ? data.creatorEmail.split("@")[0] : ""),
        });
      });
      const fetchedReplies = Array.from(repliesMap.values());
      console.log(`Setting ${fetchedReplies.length} unique replies in state`);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error(
        `Error fetching replies for note ID: ${noteId}from collection: ${collectionName2}:`,
        error
      );
    } finally {
      setLoadingReplies(false);
    }
  };
  const deleteReply = async (
    noteId: string,
    replyId: string,
    collectionName2 = collectionName
  ) => {
    try {
      console.log(
        `Attempting to delete reply with ID: ${replyId} from note ID: ${noteId} in collection: ${collectionName2}`
      );
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
        throw new Error("Invalid reply Id");
      }
      const replyPath = `${collectionName2}/${noteId}/replies/${replyId}`;
      console.log(`Deleting reply at path: ${replyPath}`);
      const replyRef = doc(db, replyPath);
      const replySnap = await getDoc(replyRef);
      if (!replySnap.exists()) {
        console.warn(
          `Reply with ID ${replyId} does not exist in note ${noteId}`
        );
        throw new Error("Reply not found");
      }
      await deleteDoc(replyRef);
      console.log(`Successfully deleted reply with ID: ${replyId}`);
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== replyId)
      );
      const noteRef = doc(db, collectionName2, noteId);
      await updateDoc(noteRef, {
        updatedAt: new Date(),
      });
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, updatedAt: new Date() } : note
        )
      );
    } catch (error) {
      console.error(
        `Error deleting reply with ID: ${replyId} from note ID: ${noteId}:`,
        error
      );
      throw error;
    }
  };
  const addReply = async (noteId: string, content: string, collectionName2 = collectionName) => {
    try {
      console.log(`Attempting to add reply to note ID: ${noteId} in collection: ${collectionName2}`);
      if (!content.trim()) {
        console.error("Reply content cannot be empty");
        throw new Error("Reply content cannot be empty");
      }
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
      const userName = currentUser.displayName || userEmail.split("@")[0];
      const now = new Date();
      const replyData = {
        noteId,
        content,
        createdAt: now,
        creatorEmail: userEmail,
        creatorName: userName,
      };
      const repliesPath = `${collectionName2}/${noteId}/replies`;
      console.log(`Using replies path for adding reply: ${repliesPath}`);
      const repliesRef = collection(db, repliesPath);
      const replyDoc = await addDoc(repliesRef, replyData);
      console.log(`Successfully added reply with ID: ${replyDoc.id}`);
      const newReply = {
        id: replyDoc.id,
        ...replyData,
      };
      setReplies(prevReplies => [...prevReplies, newReply]);
      console.log(`Added new reply to state`);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, updatedAt: now } : note
        )
      );
      console.log(`Updated note s updatedAt timestamp`);
      return replyDoc.id;
    } catch (error) {
      console.error(`Error adding reply to note ID: ${noteId} in collection: ${collectionName2}:`, error);
      throw error;
    }
  };
  // Load notes on initial render
}

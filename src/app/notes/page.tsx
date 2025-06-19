"use client";

import { useEffect, useState } from "react";
import { NotesProvider, useNotes } from "../../context/NotesContext";
import { EmptyState } from "../../components/notes/EmptyState"; // Import EmptyState component

// Import components
import PageHeader from "../../components/notes/PageHeader";
import NoteCard from "../../components/notes/NoteCard";
import NoteForm from "../../components/notes/NoteForm";
import ShowNoteDialog from "../../components/notes/ShowNoteDialog";
import ReplyDialog from "../../components/notes/ReplyDialog";
import DeleteConfirmDialog from "../../components/notes/DeleteConfirmDialog";

// Main component that wraps everything with the provider
export default function NotesPage() {
  return (
    <NotesProvider collectionName="normalNotes">
      <NotesPageContent />
    </NotesProvider>
  );
}

// Define Note interface for type safety
interface Note {
  id: string;
  studentName: string;
  teacherName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  creatorEmail?: string;
  creatorName?: string;
}

// Inner content component that uses the context
function NotesPageContent() {
  // Get all data and functions from context
  const { notes, loading, formatDate, fetchNotes } = useNotes();
  
  // Local UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteDialogOpen, setShowNoteDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Load notes when component mounts
  useEffect(() => {
    console.log('NotesPageContent mounted - loading normal notes');
    const loadNotes = async () => {
      try {
        console.log('Fetching normal notes from collection: normalNotes');
        await fetchNotes('normalNotes');
      } catch (error) {
        console.error('Error loading normal notes:', error);
      }
    };
    
    loadNotes();
    
    // Add event listener for the Add Note button in the mobile header
    const handleAddNoteEvent = () => {
      console.log('Received openAddNoteDialog event');
      handleAddNote();
    };
    
    document.addEventListener('openAddNoteDialog', handleAddNoteEvent);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('openAddNoteDialog', handleAddNoteEvent);
    };
    
    // This ensures we're not creating an infinite loop with the useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle opening the dialog for creating a new note
  const handleAddNote = () => {
    setSelectedNote(null);
    setIsDialogOpen(true);
  };

  // Handle opening the dialog for editing a note
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const openShowNoteDialog = (note: Note) => {
    setSelectedNote(note);
    setShowNoteDialogOpen(true);
  };

  const openDeleteDialog = (note: Note) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCloseShowNoteDialog = () => {
    setShowNoteDialogOpen(false);
  };

  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Use the formatDate from context instead of redefining it

  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader onAddNote={() => handleAddNote()} />
      
      <div className="flex-grow">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <EmptyState
              title="No Notes Yet"
              description="Click the + button to create your first note"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                onShowNote={() => openShowNoteDialog(note)}
                onEditNote={() => handleEditNote(note)}
                onDeleteNote={() => openDeleteDialog(note)}
                formatDate={formatDate}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Note Form Dialog */}
      <NoteForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        note={selectedNote}
      />

      {/* Show Note Dialog */}
      {selectedNote && (
        <ShowNoteDialog
          isOpen={showNoteDialogOpen}
          onClose={handleCloseShowNoteDialog}
          note={selectedNote}
          formatDate={formatDate}
        />
      )}

      {/* Reply Dialog */}
      {selectedNote && (
        <ReplyDialog
          isOpen={replyDialogOpen}
          onClose={handleCloseReplyDialog}
          note={selectedNote}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedNote && (
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          note={selectedNote}
        />
      )}
    </div>
  );
}; 
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNotes } from "../../context/NotesContext";

interface Note {
  id?: string;
  studentName: string;
  teacherName: string;
  content: string;
}

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  collectionName?: string;
  onSaved?: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
  isOpen,
  onClose,
  note = null,
  collectionName = "normalNotes",
  onSaved,
}) => {
  const [studentName, setStudentName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { saveNote } = useNotes();
  const isEditMode = !!note?.id;
  const isFormValid =
    studentName.trim() !== "" &&
    teacherName.trim() !== "" &&
    noteContent.trim() !== "";
  useEffect(() => {
    if (note) {
      setStudentName(note.studentName || "");
      setTeacherName(note.teacherName || "");
      setNoteContent(note.content || "");
    } else {
      setStudentName("");
      setTeacherName("");
      setNoteContent("");
    }
  }, [note, isOpen]);

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      setIsSaving(true);
      await saveNote(
        {
          id: note?.id,
          studentName,
          teacherName,
          content: noteContent,
        },
        collectionName
      );

      handleClose();
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setStudentName("");
      setTeacherName("");
      setNoteContent("");
      onClose();
    }
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] " />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  {isEditMode ? "Edit Note" : "Create New Note"}
                </Dialog.Title>
                <div className="mt-2 space-y-4">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                     Student Name
                    </label>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

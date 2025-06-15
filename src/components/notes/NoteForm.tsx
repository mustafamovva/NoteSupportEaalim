import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNotes } from '../../context/NotesContext';

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

// Utility function to detect text direction
function getDirection(text: string) {
  // Find the first strong directional character
  const ltrChars = /[A-Za-z]/;
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  for (const char of text) {
    if (rtlChars.test(char)) return 'rtl';
    if (ltrChars.test(char)) return 'ltr';
  }
  return 'ltr'; // default to ltr
}

const NoteForm: React.FC<NoteFormProps> = ({
  isOpen,
  onClose,
  note = null,
  collectionName = 'normalNotes',
  onSaved
}) => {
  // Local state for form values
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [contentDir, setContentDir] = useState<'ltr' | 'rtl'>('ltr');
  
  // Get save function from context
  const { saveNote } = useNotes();
  
  // Determine if we're in edit mode
  const isEditMode = !!note?.id;
  
  // Validation state
  const isFormValid = studentName.trim() !== '' && teacherName.trim() !== '' && noteContent.trim() !== '';
  
  // Initialize form with note data if provided
  useEffect(() => {
    if (note) {
      setStudentName(note.studentName || '');
      setTeacherName(note.teacherName || '');
      setNoteContent(note.content || '');
    } else {
      // Clear form when creating a new note
      setStudentName('');
      setTeacherName('');
      setNoteContent('');
    }
  }, [note, isOpen]);
  
  useEffect(() => {
    setContentDir(getDirection(noteContent));
  }, [noteContent]);
  
  // Handle save
  const handleSave = async () => {
    if (!isFormValid) return;
    
    try {
      setIsSaving(true);
      
      await saveNote({
        id: note?.id,
        studentName,
        teacherName,
        content: noteContent
      }, collectionName);
      
      // Close form and notify parent if needed
      handleClose();
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle close with cleanup
  const handleClose = () => {
    if (!isSaving) {
      setStudentName('');
      setTeacherName('');
      setNoteContent('');
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
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
                  {isEditMode ? 'Edit Note' : 'Create New Note'}
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name..."
                    />
                  </div>

                  <div>
                    <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      id="teacherName"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Enter teacher name..."
                    />
                  </div>

                  <div>
                    <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Note Content
                    </label>
                    <textarea
                      id="noteContent"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your note here..."
                      style={{ textAlign: contentDir === 'rtl' ? 'right' : 'left', direction: contentDir }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-all duration-200"
                    onClick={handleSave}
                    disabled={isSaving || !isFormValid}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span>{isEditMode ? 'Update Note' : 'Create Note'}</span>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NoteForm;
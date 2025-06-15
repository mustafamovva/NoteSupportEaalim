import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import UserAvatar from './UserAvatar';
import ReplyItem from './ReplyItem';
import { useNotes } from '../../context/NotesContext';

// Define interfaces locally for this component
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

interface ReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  collectionName?: string;
}

// Utility function to detect text direction
function getDirection(text: string) {
  const ltrChars = /[A-Za-z]/;
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  for (const char of text) {
    if (rtlChars.test(char)) return 'rtl';
    if (ltrChars.test(char)) return 'ltr';
  }
  return 'ltr';
}

const ReplyDialog: React.FC<ReplyDialogProps> = ({
  isOpen,
  onClose,
  note,
  collectionName = 'normalNotes'
}) => {
  // Internal state
  const [newReply, setNewReply] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  // Create ref to track the last fetched note ID to prevent redundant fetches
  const lastFetchedNoteId = React.useRef("");

  // Get context values
  const {
    replies,
    loadingReplies,
    fetchReplies,
    addReply,
    deleteReply,
    formatDate
  } = useNotes();

  // Load replies when dialog opens and note changes
  useEffect(() => {
    // Only fetch replies when the dialog is open and we have a note
    if (isOpen && note) {
      console.log(`ReplyDialog opened for note ID: ${note.id} in collection: ${collectionName}`);

      // Create a stable ID for tracking changes - this prevents unnecessary refetching
      const noteIdentifier = `${note.id}-${collectionName}`;

      // Only fetch if this is a different note than the last one we fetched
      if (lastFetchedNoteId.current !== noteIdentifier) {
        console.log(`Fetching replies for note: ${noteIdentifier}, previous: ${lastFetchedNoteId.current}`);
        lastFetchedNoteId.current = noteIdentifier;
        fetchReplies(note.id, collectionName);
      } else {
        console.log(`Skipping fetch - already fetched replies for note: ${noteIdentifier}`);
      }
    } else {
      // Reset the ref when dialog closes
      if (!isOpen) {
        lastFetchedNoteId.current = "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, note?.id, collectionName]);  // Remove fetchReplies from dependencies to prevent loops

  // Handle adding a reply
  const handleAddReply = async () => {
    if (!note || !newReply.trim()) return;

    try {
      setSavingReply(true);
      await addReply(note.id, newReply, collectionName);
      setNewReply(''); // Clear input after successful reply
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSavingReply(false);
    }
  };

  // Handle deleting a reply
  const handleDeleteReply = async (replyId: string) => {
    if (!note) return;
    
    try {
      console.log(`Deleting reply ID: ${replyId} from note ID: ${note.id}`);
      await deleteReply(note.id, replyId, collectionName);
      console.log('Reply deleted successfully');
    } catch (error) {
      console.error('Error deleting reply:', error);
      // No alert for errors, just log to console
    }
  };
  if (!note) return null;

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

        <div className="overflow-y-auto fixed inset-0">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Reply to Note
                  </Dialog.Title>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    onClick={onClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="flex-none">
                  {note && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-2 overflow-auto max-h-[25vh]">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <UserAvatar
                            email={note.creatorEmail}
                            name={note.creatorName}
                            size="md"
                            colorScheme="blue-teal"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Student: <span className="text-blue-600 dark:text-blue-400">{note.studentName}</span>
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                Teacher: <span className="text-teal-600 dark:text-teal-400">{note.teacherName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 w-full text-sm text-gray-600 whitespace-pre-wrap break-words dark:text-gray-300 overflow-wrap-anywhere"
                               style={{ textAlign: getDirection(note.content) === 'rtl' ? 'right' : 'left', direction: getDirection(note.content) }}>
                            {note.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex overflow-hidden flex-col flex-1 mt-4 min-h-0">
                  <h4 className="px-1 mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {loadingReplies ? 'Loading replies...' : replies.length === 0 ? 'No replies yet' : 'Conversation'}
                  </h4>

                  <div className="overflow-y-auto flex-1 pr-1 pl-1 space-y-4">
                    {note && replies.map(reply => (
                      <ReplyItem
                        key={reply.id}
                        reply={reply}
                        onDeleteReply={(replyId) => handleDeleteReply(replyId)}
                        formatDate={formatDate}
                      />
                    ))}

                    {loadingReplies && (
                      <div className="flex justify-center py-4">
                        <svg className="w-5 h-5 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <textarea
                      className="flex-1 min-h-[80px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      placeholder="Write your reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                    ></textarea>
                    <button
                      className="flex-shrink-0 p-2 text-white bg-gradient-to-r from-blue-500 to-teal-400 rounded-full shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-teal-500 disabled:opacity-50"
                      onClick={handleAddReply}
                      disabled={!newReply.trim() || savingReply}
                    >
                      {savingReply ? (
                        <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                      )}
                    </button>
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

export default ReplyDialog;
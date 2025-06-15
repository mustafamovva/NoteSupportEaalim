import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Define Note interface locally for this component
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

interface ShowNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  formatDate: (date: Date) => string;
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

const ShowNoteDialog: React.FC<ShowNoteDialogProps> = ({
  isOpen,
  onClose,
  note,
  formatDate
}) => {
  if (!note) return null;

  const contentDir = getDirection(note.content);

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
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2"
                >
                  Note Details
                </Dialog.Title>

                <div className="mt-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Student</h4>
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400 break-words">{note.studentName}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teacher</h4>
                    <p className="text-lg font-medium text-teal-600 dark:text-teal-400 break-words">{note.teacherName}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Content</h4>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-[40vh] overflow-auto">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words"
                         style={{ textAlign: contentDir === 'rtl' ? 'right' : 'left', direction: contentDir }}>
                        {note.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span>Created: {formatDate(note.createdAt)}</span>
                    <span>Updated: {formatDate(note.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                    onClick={onClose}
                  >
                    Close
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

export default ShowNoteDialog;
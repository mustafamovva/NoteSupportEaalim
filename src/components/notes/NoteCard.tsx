import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import UserAvatar from "./UserAvatar";

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

interface NoteCardProps {
  note: Note;
  onShowNote: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onReplyToNote: (note: Note) => void;
  formatDate: (date: Date) => string;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onShowNote,
  onEditNote,
  onDeleteNote,
  onReplyToNote,
  formatDate
}) => {
  return (
    <div
      key={note.id}
      className="flex-col h-full p-4 transition-shadow bg-white border border-gray-200 shadow-xl cursor-pointer rounded-3xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-md sm:p-5 flex"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Student: <span className="block max-w-full text-blue-600 truncate dark:text-blue-400" title={note.studentName}>{note.studentName}</span>
          </h3>
          <h4 className="text-sm text-gray-700 dark:text-gray-300">
            Teacher: <span className="block max-w-full text-teal-600 truncate dark:text-teal-400" title={note.teacherName}>{note.teacherName}</span>
          </h4>
        </div>
        <div className="flex items-center space-x-2 flex-shirk-0">
          <UserAvatar
            name={note.creatorName}
            email={note.creatorEmail}
            size="sm"
            colorScheme="blue-teal"
          />
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
              </svg>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 divide-y divide-gray-100 dark:divide-gray-700 ">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onShowNote(note)}
                        className={`${active ? "bg-gray-100 dark:bg-gray-700 " : ""} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Show Note
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onEditNote(note)}
                        className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""}group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit Note
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onReplyToNote(note)}
                        className={`${active ? "bg-gray-100 dark:bg-gray-700 " : ""} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                        </svg>
                        Reply
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onDeleteNote(note)}
                        className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""}group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                      >
                        <svg className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Note
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>

            </Transition>
          </Menu>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-2 flex-grow">
        <p className="text-gray-800 dark:text-gray-300 text-sm whitespace-pre-wrap break-words overflow-hidden line-clamp-4">
          {note.content || "No content"}
        </p>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600 dark:text-gray-400">
          {note.updatedAt && note.updatedAt > note.createdAt
            ? `Edited ${formatDate(note.updatedAt)}`
            : `Created ${formatDate(note.createdAt)}`}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
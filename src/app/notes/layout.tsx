"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import ThemeToggle from "../../components/ThemeToggle";
import ThemeToggleWithLabel from "../../components/ThemeToggleWithLabel";
import Image from "next/image";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
      } else {
        // Extract username from email (remove @gmail.com part)
        const email = user.email || "";
        const username = email.split("@")[0];
        setUserName(username);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Responsive sidebar: open by default only on xl and above
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) { // xl breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex overflow-hidden h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 
        lg:bg-white lg:dark:bg-gray-800 
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
        border-r border-gray-200 dark:border-gray-700 
        flex flex-col transition-transform duration-300 ease-in-out transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto lg:w-64 lg:backdrop-blur-none
      `}>
        {/* Company Logo and Name */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Circular Logo Container */}
            <div className="flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-md shadow-md">
              <Image
                src="/img/Logo.png"
                alt="Company Logo"
                width={40}
                height={40}
                className="object-contain w-10 h-10"
                priority
              />
            </div>
            {/* Company Name */}
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Eaalim
            </h1>
          </div>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center w-10 h-10 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 rounded-full">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName || "User"}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto flex-1 p-5 space-y-1">
          <Link
            href="/notes"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${pathname === '/notes' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Normal Notes
          </Link>

          <Link
            href="/stopped-students"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${pathname === '/stopped-students' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Stopped Student Notes
          </Link>

          <Link
            href="/permanent-notes"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${pathname === '/permanent-notes' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="mr-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Permanent Notes
          </Link>
        </nav>

        {/* Theme Toggle Button */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
          <ThemeToggleWithLabel />
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-auto flex-1 w-full transition-colors duration-200 lg:ml-0 xl:ml-0">
        {/* Mobile Header */}
        <div className="flex sticky top-0 z-10 justify-between items-center p-4 backdrop-blur-sm transition-colors duration-200 bg-white/80 lg:hidden dark:bg-gray-800/80 dark:backdrop-blur-sm dark:border-gray-700">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 rounded-md transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              {pathname === '/notes' ? 'Normal Notes' : pathname === '/stopped-students' ? 'Stopped Students' : pathname === '/permanent-notes' ? 'Permanent Notes' : 'Normal Notes'}
            </h1>
          </div>
          
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <button
              onClick={() => {
                const event = new CustomEvent('openAddNoteDialog');
                document.dispatchEvent(event);
              }}
              className="p-2 text-blue-500 rounded-md transition-colors duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
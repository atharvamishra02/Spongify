"use client";
import React, { useState } from "react";
import Link from "next/link";

const navItems = [
  { name: "Home", icon: "🏠", href: "/" },
  { name: "Favourite", icon: "❤️", href: "/favourite" },
  { name: "Library", icon: "🎵", href: "/library" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button (left) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black border-4 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>


      {/* Mobile overlay with sidebar contents */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed left-0 top-0 h-full w-64 bg-black border-2 text-white flex flex-col py-8 px-4 gap-6 shadow-lg transform transition-transform duration-300">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-gray-800 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* App title */}
            <div className="text-2xl font-bold mb-8 gap-4 tracking-wide text-center">
              MusicApp
            </div>

            {/* Navigation items */}
            <nav className="flex flex-col gap-4 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Add Music button */}
            <Link
              href="/add-music"
              className="mt-auto px-4 py-3 bg-red-600 hover:bg-blue-700 text-white rounded-lg font-bold text-center transition-colors shadow"
              onClick={() => setIsOpen(false)}
            >
              + Add Music
            </Link>
          </div>
        </div>
      )}

  {/* Desktop sidebar (fixed) */}
  <aside className="hidden lg:flex fixed top-0 left-0 h-screen bg-black border-4 text-white w-64 flex-col py-10 px-4 shadow-lg">
        {/* App title */}
        <div className="text-2xl font-bold mb-8 tracking-wide text-center">
          MusicApp
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col flex-1 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Add Music button at bottom */}
        <Link
          href="/add-music"
          className="mt-auto px-4 py-2 bg-red-600 hover:bg-red-800 text-white rounded-lg font-bold text-center transition-colors shadow"
        >
          + Add Music
        </Link>
      </aside>
    </>
  );
}

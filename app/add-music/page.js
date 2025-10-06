"use client";
import UploadMusic from "../components/UploadMusic";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddMusicPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // When songs are uploaded, send them to the API only
  const handleSongsChange = (songs) => {
    setError("");
    if (!songs || songs.length === 0) return;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-4 sm:py-12 px-2 sm:px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-gray-800 dark:via-gray-900 dark:to-gray-700">
      <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-6 text-center">Add Music</h1>
      <div className="w-full max-w-xs sm:max-w-2xl">
        <UploadMusic onSongsChange={handleSongsChange} showOnlyUpload onBackHome={handleBackToHome} />
      </div>
      {success && (
        <div className="mt-3 sm:mt-4 text-green-500 font-semibold text-sm sm:text-base text-center max-w-xs sm:max-w-md">Song uploaded successfully!</div>
      )}
      {error && (
        <div className="mt-3 sm:mt-4 text-red-500 font-semibold text-sm sm:text-base text-center max-w-xs sm:max-w-md break-words">{error}</div>
      )}
    </div>
  );
}
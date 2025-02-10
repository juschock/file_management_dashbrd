// file-management-poc/src/app/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to File Management PoC
        </h1>
        {status === "loading" ? (
          <p className="text-xl text-gray-600">Loading...</p>
        ) : session ? (
          <>
            <p className="text-lg text-gray-700 mb-4">
              Signed in as {session.user.email}
            </p>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => signOut()}
                className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
              <Link
                href="/dashboard"
                className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-4">
              You are not signed in.
            </p>
            <button
              onClick={() => signIn()}
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition-colors"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { signIn } from "next-auth/react";

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: true,
      callbackUrl: "/",
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg flex flex-col gap-4 w-80"
      >
        <h2 className="text-2xl font-bold text-amber-600 mb-2">Login</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 dark:bg-zinc-800 dark:text-white"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 dark:bg-zinc-800 dark:text-white"
          required
        />
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold p-2 rounded transition-colors"
        >
          Login
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-black p-2 rounded transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
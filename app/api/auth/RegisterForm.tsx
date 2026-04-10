"use client";

import React, { useState } from "react";

interface RegisterFormProps {
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess("Регистрация успешна!");
        setTimeout(onClose, 1000);
      } else {
        const data = await res.json();
        setError(data.message || "Ошибка регистрации");
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка сети");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg flex flex-col gap-4 w-80"
      >
        <h2 className="text-2xl font-bold text-amber-600 mb-2">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 dark:bg-zinc-800 dark:text-white"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 dark:bg-zinc-800 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 dark:bg-zinc-800 dark:text-white"
          required
        />

        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold p-2 rounded transition-colors"
        >
          Register
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
'use client';

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!prompt && !image) return alert("Please enter a prompt or upload an image.");
    setLoading(true);
    setResponse("");

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (image) formData.append("image", image);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data.text || data.error);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">NgobrolAI</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your question..."
        className="w-full max-w-xl p-3 rounded-lg text-white border border-blue-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 bg-gray-800"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="mt-3 mb-4 text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      <button
        onClick={sendPrompt}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 mt-2 px-4 py-2 rounded-lg"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-lg">
        <strong>Response:</strong>
        <p className="mt-2 whitespace-pre-wrap">{response}</p>
      </div>
    </main>
  );
}

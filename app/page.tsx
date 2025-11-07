'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (typeof response === "string" && response.length > 0) {
      let i = 0;
      setDisplayedResponse("");
      setIsTyping(true);

      const interval = setInterval(() => {
        setDisplayedResponse((prev) => prev + response[i]);
        i++;
        if (i >= response.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // typing speed (ms per char)
    } else if (response && typeof response === "object") {
      // If JSON, display instantly formatted
      setDisplayedResponse(JSON.stringify(response, null, 2));
    }
  }, [response]);

  const sendPrompt = async () => {
    if (!prompt && !image) return alert("Please enter a prompt or upload an image.");
    setLoading(true);
    setResponse(null);
    setDisplayedResponse("");

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      let text = data.text || data.error;

      text = text.replace(/```json|```/g, "").trim();

      try {
        const parsed = JSON.parse(text);
        setResponse(parsed);
      } catch {
        setResponse(text);
      }
    } catch (err: any) {
      setResponse("Error: " + err.message);
    }

    setLoading(false);
  };

  const handleCopy = () => {
    const textToCopy =
      typeof response === "string"
        ? response
        : JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard!");
  };

  const handleClear = () => {
    setPrompt("");
    setImage(null);
    setResponse(null);
    setDisplayedResponse("");
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

      <div className="flex space-x-2 mt-2">
        <button
          onClick={sendPrompt}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          {loading ? "Thinking..." : "Send"}
        </button>

        <button
          onClick={handleClear}
          disabled={loading}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
        >
          Clear
        </button>
      </div>

      {response && (
        <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-lg relative">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          >
            Copy
          </button>

          <strong>Response:</strong>
          <pre className="mt-2 whitespace-pre-wrap text-gray-100 overflow-x-auto">
            {displayedResponse}
            {isTyping && <span className="animate-pulse">▍</span>}
          </pre>
        </div>
      )}
    </main>
  );
}

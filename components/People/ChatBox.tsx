"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ClipboardIcon } from "@heroicons/react/24/outline";

interface ChatBoxProps {
  person: string;
  personName: string;
  personImage: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ person, personName, personImage }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!session) {
      alert("You need to log in to chat.");
      return;
    }
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person, messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Chat API error");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || "No response." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  // Copy Markdown properly
  const copyToClipboard = async (markdownText: string) => {
    try {
      await navigator.clipboard.writeText(markdownText);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-screen bg-white shadow-md rounded-lg border border-gray-200 relative">
      {/* Header */}
      <div className="p-4 flex items-center bg-blue-500 text-white rounded-t-lg">
        <button onClick={() => router.push(`/people/${person}`)} className="text-lg font-bold">
          ← Back
        </button>
        <div className="flex items-center ml-4">
          <Image
            src={personImage}
            alt={personName}
            width={40}
            height={40}
            className="rounded-full mr-2"
          />
          <h2 className="text-lg font-semibold">{personName}</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[75%] ${
              msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"
            } relative`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {/* Copy Button */}
            {msg.role === "assistant" && (
              <button
                onClick={() => copyToClipboard(msg.content)}
                className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
              >
                <ClipboardIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="p-3 bg-gray-200 rounded-lg max-w-[75%] self-start flex items-center space-x-1">
            <span className="text-gray-500 text-sm">Typing</span>
            <div className="flex space-x-1">
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-bounce"></span>
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Box */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 flex items-center space-x-2 max-w-lg mx-auto z-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 border p-2 rounded-md focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .animate-bounce {
          animation: bounce 1.2s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
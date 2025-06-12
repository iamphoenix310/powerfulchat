"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/GoogleLogin/LoginModel";
import { useSession } from "next-auth/react";
import questionTemplates from "@/app/utils/questionTemplates";

interface QuestionAnswerProps {
  celebrityName: string;
  profession: string;
}

const QuestionAnswer: React.FC<QuestionAnswerProps> = ({ celebrityName, profession }) => {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (profession) {
      const professions = profession.split(", ");
      const uniqueQuestions = new Set<string>();

      professions.forEach((p) => {
        if (questionTemplates[p]) {
          questionTemplates[p].forEach((q) =>
            uniqueQuestions.add(q.replace("[celebrityName]", celebrityName))
          );
        }
      });

      const randomQuestions = Array.from(uniqueQuestions)
        .sort(() => 0.5 - Math.random()) // Shuffle questions
        .slice(0, 3); // Show only 2-3 questions

      setSuggestedQuestions(randomQuestions);
    } else {
      setSuggestedQuestions([]);
    }
  }, [profession, celebrityName]);

  const askQuestion = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!question.trim()) {
      setAnswer("Please enter a question.");
      return;
    }

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, celebrity: celebrityName, conversation }),
      });

      const data = await res.json();
      if (data.error) {
        console.error("API Error:", data.error);
        setAnswer("Something went wrong. Please try again.");
        return;
      }

      const newAnswer = data.answer || "No answer received.";
      setConversation((prev) => [...prev, { question, answer: newAnswer }]);
      setAnswer(newAnswer);
      setQuestion(""); // ✅ Clears input field after asking
    } catch (error) {
      console.error("Fetch error:", error);
      setAnswer("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
        Ask anything about <span className="text-blue-600">{celebrityName}</span>
      </h2>

      {/* Suggested Questions (Randomized) */}
      {suggestedQuestions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Suggested Questions:</h3>
          <ul className="mt-2 space-y-2">
            {suggestedQuestions.map((q, index) => (
              <li
                key={index}
                onClick={() => setQuestion(q)}
                className="cursor-pointer text-blue-600 hover:text-blue-800 transition"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input & Button */}
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask anything about ${celebrityName}...`}
          className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          onClick={askQuestion}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Ask
        </button>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-300">
          <h3 className="text-xl font-semibold mb-2">Conversation History:</h3>
          <ul className="space-y-2">
            {conversation.map((entry, index) => (
              <li key={index} className="bg-white p-2 rounded-md border border-gray-200">
                <strong className="text-gray-800">Q:</strong> {entry.question} <br />
                <strong className="text-gray-800">A:</strong> {entry.answer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Answer Display */}
      {answer && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-300">
          <h3 className="text-xl font-semibold">Answer:</h3>
          <p>{answer}</p>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default QuestionAnswer;
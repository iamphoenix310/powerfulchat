"use client";

import { useState } from "react";

interface FeedbackFormProps {
  personName: string;
  onSubmit: (message: string) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ personName, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(message);
      setSubmitted(true);
      setMessage("");
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-300 pt-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
        Request an update about {personName}
      </h2>
      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col items-center space-y-4"
        >
          <textarea
            className="w-full max-w-lg border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            placeholder={`Share your thoughts about ${personName}, or submit a correction!`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          ></textarea>
          <button
            type="submit"
            className={`w-full max-w-xs px-4 py-2 text-white rounded-md shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      ) : (
        <div className="mt-4 text-green-500 text-center font-medium">
          Thank you! Your feedback has been submitted.
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;

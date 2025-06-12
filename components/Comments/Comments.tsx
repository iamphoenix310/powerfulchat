"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LoginModal } from "@/components/GoogleLogin/LoginModel";

interface Comment {
  _id: string;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  authorName?: string;
  replies?: Comment[];
  authorId?: string;
}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const { data: session } = useSession(); // Get session data
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [reply, setReply] = useState<{ parentId: string | null; content: string }>({
    parentId: null,
    content: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const userId = session?.user?.id || session?.user?.email; // Extract user ID or email from the session

  // Fetch comments from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/ids/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [postId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!session) {
      setShowLoginModal(true); // Show login modal if not logged in
      return;
    }

    if (!newComment.trim()) {
      console.error("Comment content is empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          authorId: session.user?.email, // Pass the user's email
          associatedContentId: postId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit comment: ${errorText}`);
      }

      const addedComment: Comment = await response.json();
      setComments([...comments, addedComment]); // Update state with the new comment
      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete comment: ${errorText}`);
      }

      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a reply to a comment
  const handleAddReply = async (parentId: string) => {
    if (!session) {
      setShowLoginModal(true); // Show login modal if not logged in
      return;
    }

    if (!reply.content.trim()) {
      console.error("Reply content is empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reply.content,
          authorId: userId, // Use logged-in user ID or email
          parentId,
          associatedContentId: postId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit reply: ${errorText}`);
      }

      const addedReply: Comment = await response.json();
      setComments(
        comments.map((comment) =>
          comment._id === parentId
            ? { ...comment, replies: [...(comment.replies || []), addedReply] }
            : comment
        )
      );
      setReply({ parentId: null, content: "" }); // Clear reply field
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 rounded-lg text-white shadow-lg">
      <h3 className="text-lg font-bold border-b border-gray-700 pb-2">Comment Your Thoughts</h3>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
      />
      <button
        onClick={handleAddComment}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      <ul className="space-y-4">
  {comments.map((comment) => (
    <li
      key={comment._id}
      className="p-4 bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
    >
      <p className="text-sm mb-2">{comment.comment}</p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>By: {comment.authorName || "Anonymous"}</span>
        <span>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <div className="mt-2 flex space-x-4">
        <button
          onClick={() => setReply({ parentId: comment._id, content: "" })}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          Reply
        </button>
        
        {comment.authorId === userId && (
          <button
            onClick={() => handleDeleteComment(comment._id)}
            className="text-red-400 hover:text-red-300 transition"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  ))}
</ul>


      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Comments;

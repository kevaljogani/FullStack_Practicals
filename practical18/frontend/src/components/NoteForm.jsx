import { useState } from "react";
import axios from "axios";

function NoteForm({ refreshNotes }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/notes", { title, content });
    setTitle("");
    setContent("");
    refreshNotes();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6"
    >
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
        rows="4"
      />
      <button
        type="submit"
        className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition font-medium"
      >
        Add Note
      </button>
    </form>
  );
}

export default NoteForm;

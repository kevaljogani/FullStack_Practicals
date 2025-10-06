import axios from "axios";

function NoteList({ notes, refreshNotes }) {
  const deleteNote = async (id) => {
    await axios.delete(`http://localhost:5000/api/notes/${id}`);
    refreshNotes();
  };

  return (
    <div className="grid gap-4">
      {notes.length === 0 ? (
        <p className="text-center text-gray-500">No notes yet. Add one!</p>
      ) : (
        notes.map((note) => (
          <div
            key={note._id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {note.title}
            </h3>
            <p className="text-gray-600 mt-2">{note.content}</p>
            <small className="text-gray-400 block mt-2">
              {new Date(note.createdAt).toLocaleString()}
            </small>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => deleteNote(note._id)}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NoteList;

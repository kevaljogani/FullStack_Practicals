import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });  // automatically adds createdAt & updatedAt

export default mongoose.model("Note", noteSchema);

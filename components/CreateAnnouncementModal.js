// components/CreateAnnouncementModal.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ANNOUNCEMENT_BUCKET = "announcements_files";

export default function CreateAnnouncementModal({ open, setOpen }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const title = form.get("title");
    const message = form.get("message");
    const pinned = form.get("pinned") === "on";
    const file = form.get("attachment");

    let file_url = null;

    try {
      setUploading(true);

      // If a file is attached, upload to Supabase Storage
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(ANNOUNCEMENT_BUCKET)
          .upload(path, file);

        if (uploadError) {
          console.error(uploadError);
          alert("Failed to upload attachment: " + uploadError.message);
        } else {
          const { data } = supabase.storage
            .from(ANNOUNCEMENT_BUCKET)
            .getPublicUrl(path);

          file_url = data.publicUrl;
        }
      }

      const { error } = await supabase.from("announcements").insert({
        title,
        message,
        pinned,
        file_url,
      });

      if (error) {
        alert(error.message);
      } else {
        setOpen(false);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    if (!uploading) setOpen(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 w-full max-w-md rounded-xl p-6 border border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">New Announcement</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 text-sm">Title</label>
          <input
            name="title"
            required
            className="w-full p-2 mb-4 rounded bg-neutral-800 border border-neutral-600"
          />

          <label className="block mb-1 text-sm">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full p-2 mb-4 rounded bg-neutral-800 border border-neutral-600"
          />

          <label className="block mb-1 text-sm">Attachment (optional)</label>
          <input
            type="file"
            name="attachment"
            accept=".pdf,image/*"
            className="w-full text-sm mb-2"
            onChange={(e) =>
              setFileName(e.target.files?.[0]?.name || "")
            }
          />
          {fileName && (
            <p className="text-xs text-gray-400 mb-4">Selected: {fileName}</p>
          )}

          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" name="pinned" />
            <span className="text-sm">Pin announcement</span>
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 bg-neutral-700 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {uploading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

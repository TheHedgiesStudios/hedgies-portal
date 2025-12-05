// components/EditAnnouncementModal.js
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

const ANNOUNCEMENT_BUCKET = "announcements_files";

export default function EditAnnouncementModal({
  open,
  setOpen,
  announcement,
  onUpdated,
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [pinned, setPinned] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (announcement && open) {
      setTitle(announcement.title || "");
      setMessage(announcement.message || "");
      setPinned(Boolean(announcement.pinned));
      setFileUrl(announcement.file_url || null);
      setNewFile(null);
    }
  }, [announcement, open]);

  if (!open || !announcement) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    let finalFileUrl = fileUrl;

    try {
      setUploading(true);

      // If a new file was chosen, upload and override file_url
      if (newFile && newFile.size > 0) {
        const ext = newFile.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(ANNOUNCEMENT_BUCKET)
          .upload(path, newFile);

        if (uploadError) {
          alert("Failed to upload attachment: " + uploadError.message);
        } else {
          const { data } = supabase.storage
            .from(ANNOUNCEMENT_BUCKET)
            .getPublicUrl(path);
          finalFileUrl = data.publicUrl;
        }
      }

      const { error } = await supabase
        .from("announcements")
        .update({
          title,
          message,
          pinned,
          file_url: finalFileUrl,
        })
        .eq("id", announcement.id);

      if (error) {
        alert(error.message);
      } else {
        if (onUpdated) onUpdated();
        setOpen(false);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveAttachment() {
    setFileUrl(null);
    setNewFile(null);
  }

  function handleClose() {
    if (!uploading) setOpen(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 w-full max-w-md rounded-xl p-6 border border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1 text-sm">Title</label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-neutral-800 border border-neutral-600"
          />

          <label className="block mb-1 text-sm">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-neutral-800 border border-neutral-600"
          />

          <div className="mb-4">
            <label className="block mb-1 text-sm">Attachment</label>

            {fileUrl && (
              <div className="mb-2 text-xs text-gray-300 flex items-center gap-2">
                <span>Current:</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline"
                >
                  Open attachment
                </a>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="file"
              accept=".pdf,image/*"
              className="w-full text-sm"
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            />
            {newFile && (
              <p className="text-xs text-gray-400 mt-1">
                New file: {newFile.name}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
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
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

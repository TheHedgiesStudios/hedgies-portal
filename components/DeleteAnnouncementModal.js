// components/DeleteAnnouncementModal.js
import { supabase } from "../lib/supabaseClient";

export default function DeleteAnnouncementModal({
  open,
  setOpen,
  announcement,
  onDeleted,
}) {
  if (!open || !announcement) return null;

  async function handleDelete() {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcement.id);

    if (error) {
      alert(error.message);
    } else {
      if (onDeleted) onDeleted();
      setOpen(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 w-full max-w-sm rounded-xl p-6 border border-neutral-700">
        <h2 className="text-lg font-semibold mb-3">Delete Announcement</h2>
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            “{announcement.title}”
          </span>
          ? This cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-neutral-700 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

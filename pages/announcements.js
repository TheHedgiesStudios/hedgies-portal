// pages/announcements.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import EditAnnouncementModal from "../components/EditAnnouncementModal";
import DeleteAnnouncementModal from "../components/DeleteAnnouncementModal";
import CreateAnnouncementModal from "../components/CreateAnnouncementModal";
import AttachmentViewerModal from "../components/AttachmentViewerModal";
import Link from "next/link";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState(null);

  function sortAnnouncements(list) {
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  async function loadAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    }

    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setAnnouncements(data || []);
  }

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel("announcements_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          loadAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function togglePinned(a) {
    await supabase
      .from("announcements")
      .update({ pinned: !a.pinned })
      .eq("id", a.id);
    await loadAll();
  }

  const sorted = sortAnnouncements(announcements);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Announcements</h1>
          <p className="text-sm text-gray-400">
            Studio-wide updates, changes, and important notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-300 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
            >
              + New Announcement
            </button>
          )}
        </div>
      </div>

      {sorted.length === 0 && (
        <p className="text-gray-400 text-sm">No announcements yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {sorted.map((a) => (
          <div
            key={a.id}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {a.pinned && (
                    <span className="px-2 py-1 bg-yellow-500 text-black text-[10px] rounded-md uppercase">
                      Pinned
                    </span>
                  )}
                  <h2 className="text-xl font-semibold">{a.title}</h2>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePinned(a)}
                    className="px-2 py-1 text-xs rounded bg-neutral-700 hover:bg-neutral-600"
                  >
                    {a.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => setEditTarget(a)}
                    className="px-2 py-1 text-xs rounded bg-neutral-700 hover:bg-neutral-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-200 whitespace-pre-wrap mb-3">
              {a.message}
            </p>

            {a.file_url && (
              <div className="mt-1">
                <button
                  onClick={() => setAttachmentUrl(a.file_url)}
                  className="text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-600"
                >
                  📎 View Attachment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateAnnouncementModal open={showCreate} setOpen={setShowCreate} />

      <EditAnnouncementModal
        open={Boolean(editTarget)}
        setOpen={() => setEditTarget(null)}
        announcement={editTarget}
        onUpdated={loadAll}
      />

      <DeleteAnnouncementModal
        open={Boolean(deleteTarget)}
        setOpen={() => setDeleteTarget(null)}
        announcement={deleteTarget}
        onDeleted={loadAll}
      />

      <AttachmentViewerModal
        open={Boolean(attachmentUrl)}
        setOpen={() => setAttachmentUrl(null)}
        url={attachmentUrl}
      />
    </div>
  );
}

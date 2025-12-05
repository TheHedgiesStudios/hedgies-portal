import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AnnouncementsWidget({ profile }) {
  const [announcements, setAnnouncements] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const userId = profile?.id;

  async function loadAnnouncements() {
    let { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    setAnnouncements(data || []);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  }

  async function uploadFile() {
    if (!attachedFile) return null;

    const fileName = `${Date.now()}-${attachedFile.name}`;
    const { data, error } = await supabase.storage
      .from("announcements")
      .upload(fileName, attachedFile);

    if (error) {
      console.error(error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("announcements")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function sendAnnouncement() {
    if (!newMessage.trim() && !attachedFile) return;

    let fileUrl = null;
    if (attachedFile) {
      fileUrl = await uploadFile();
    }

    const { error } = await supabase.from("announcements").insert({
      message: newMessage || null,
      file_url: fileUrl || null,
      created_by: userId,
    });

    if (!error) {
      setNewMessage("");
      setAttachedFile(null);
      setUploadPreview(null);
      loadAnnouncements();
    } else {
      console.error("Insert error:", error);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnnouncement();
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-5 w-[360px] shadow-lg">
      <div className="mb-3">
        <h2 className="text-sm font-bold tracking-widest text-blue-300">
          ANNOUNCEMENTS
        </h2>
        <div className="w-full h-[1px] bg-gradient-to-r from-blue-400/40 to-transparent mt-1"></div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {announcements.length === 0 && (
          <p className="text-xs text-gray-400">No announcements yet.</p>
        )}

        {announcements.map((a) => (
          <div
            key={a.id}
            className="text-xs bg-white/5 border border-white/10 rounded p-2"
          >
            {a.message && <p className="mb-1">{a.message}</p>}

            {a.file_url && (
              <a
                href={a.file_url}
                target="_blank"
                className="text-blue-300 underline text-[11px]"
              >
                📎 Attached File
              </a>
            )}
          </div>
        ))}
      </div>

      {uploadPreview && (
        <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
          <img src={uploadPreview} className="w-full" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer bg-white/10 border border-white/20 px-2 py-2 rounded-md hover:bg-white/20 transition flex items-center justify-center">
          📎
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>

        <input
          className="flex-1 px-3 py-2 bg-black/30 border border-white/20 text-xs rounded outline-none focus:border-blue-400/60 focus:bg-black/40 transition"
          placeholder="Write announcement..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={sendAnnouncement}
          className="px-4 py-2 rounded-md border border-white/30 bg-blue-500/20 hover:bg-blue-500/40 text-xs transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}

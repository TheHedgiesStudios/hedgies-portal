import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// MAIN FOLDER NAME IN SUPABASE
const ROOT_FOLDER = "Hedgies_Studios_Audio_Library/";

export default async function handler(req, res) {
  try {
    const { folder = ROOT_FOLDER } = req.query;

    const { data, error } = await supabase.storage
      .from("audio-library")
      .list(folder, { limit: 2000 });

    if (error) {
      console.error("Storage Error:", error);
      return res.status(500).json({ error: "Failed to read storage" });
    }

    // Convert each file/folder into a clean object
    const items = data.map((item) => ({
      name: item.name,
      type: item.metadata ? "file" : "folder",
      path: folder + item.name,
      url: item.metadata
        ? supabase.storage.from("audio-library").getPublicUrl(folder + item.name).data.publicUrl
        : null,
      size: item.metadata?.size || 0,
    }));

    return res.status(200).json({ items });
  } catch (e) {
    console.error("API Error:", e);
    return res.status(500).json({ error: "Server Error" });
  }
}

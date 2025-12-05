// pages/api/audio-browser.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Bucket name you confirmed:
const BUCKET = "audio-library";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path = "" } = req.query;
    const decodedPath = typeof path === "string" ? path : "";

    // Ensure prefix ends with "/" if not empty
    const prefix =
      decodedPath === "" ? "" : decodedPath.endsWith("/") ? decodedPath : decodedPath + "/";

    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 2000,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      console.error("Supabase storage list error:", error);
      return res.status(500).json({ error: "Failed to read storage" });
    }

    const items =
      data?.map((item) => {
        const isFile = !!item.metadata; // Supabase: folders have null metadata
        const itemPath = prefix + item.name;

        const publicUrl = isFile
          ? supabase.storage.from(BUCKET).getPublicUrl(itemPath).data.publicUrl
          : null;

        return {
          name: item.name,
          path: itemPath,
          type: isFile ? "file" : "folder",
          size: item.metadata?.size || 0,
          url: publicUrl,
        };
      }) || [];

    return res.status(200).json({ items, path: decodedPath });
  } catch (err) {
    console.error("Audio browser API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// components/AudioLibraryWindow.js
import { useEffect, useState, useRef } from "react";

export default function AudioLibraryWindow({ onClose }) {
  const [currentPath, setCurrentPath] = useState("Hedgies_Studios_Audio_Library");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState("");

  // Window position & drag
  const [position, setPosition] = useState({ top: 80, left: 120 });
  const [size] = useState({ width: 900, height: 520 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  useEffect(() => {
    loadFolder(currentPath);
  }, [currentPath]);

  async function loadFolder(path) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/audio-browser?path=${encodeURIComponent(path || "")}`
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load audio library");
        setItems([]);
      } else {
        setItems(json.items || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to audio library.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(item) {
    if (item.type === "folder") {
      setCurrentPath(item.path);
      return;
    }
    if (item.type === "file" && item.url) {
      setPreviewUrl(item.url);
      setPreviewName(item.name);
    }
  }

  function handleBack() {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    if (parts.length <= 1) {
      setCurrentPath("");
      return;
    }
    const parent = parts.slice(0, -1).join("/");
    setCurrentPath(parent);
  }

  // Drag handlers
  function onMouseDownTitle(e) {
    draggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    };
    window.addEventListener("mousemove", onMouseMoveWindow);
    window.addEventListener("mouseup", onMouseUpWindow);
  }

  function onMouseMoveWindow(e) {
    if (!draggingRef.current) return;
    setPosition({
      left: e.clientX - dragOffsetRef.current.x,
      top: e.clientY - dragOffsetRef.current.y,
    });
  }

  function onMouseUpWindow() {
    draggingRef.current = false;
    window.removeEventListener("mousemove", onMouseMoveWindow);
    window.removeEventListener("mouseup", onMouseUpWindow);
  }

  const pathLabel = currentPath || "Root (audio-library)";

  return (
    <div
      className="window-frame"
      style={{
        top: position.top,
        left: position.left,
        width: size.width,
        height: size.height,
        zIndex: 50,
      }}
    >
      {/* Titlebar */}
      <div
        className="window-titlebar"
        onMouseDown={onMouseDownTitle}
      >
        <span className="text-xs uppercase tracking-[0.2em]">
          AUDIO LIBRARY
        </span>

        <div className="flex items-center gap-2 ml-4 text-[10px] opacity-70">
          <span>{pathLabel}</span>
        </div>

        <div className="ml-auto flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setViewMode("list")}
            className={`px-2 py-1 rounded ${
              viewMode === "list" ? "bg-white/20" : "bg-transparent"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2 py-1 rounded ${
              viewMode === "grid" ? "bg-white/20" : "bg-transparent"
            }`}
          >
            Grid
          </button>
          <div
            className="window-close-btn"
            onClick={onClose}
            title="Close"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 text-xs text-gray-100 h-[calc(100%-38px)] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleBack}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            ⬅ Back
          </button>
          {loading && <span className="opacity-70">Loading…</span>}
          {error && <span className="text-red-400">{error}</span>}
        </div>

        <div className="flex-1 overflow-auto">
          {items.length === 0 && !loading && !error && (
            <div className="opacity-60">No files or folders here yet.</div>
          )}

          {viewMode === "list" ? (
            /* LIST VIEW */
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="py-1 pr-2">Name</th>
                  <th className="py-1 pr-2 w-16">Type</th>
                  <th className="py-1 pr-2 w-24">Size</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.path}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleOpen(item)}
                  >
                    <td className="py-1 pr-2">
                      {item.type === "folder" ? "📁 " : "🎧 "}
                      {item.name}
                    </td>
                    <td className="py-1 pr-2">{item.type}</td>
                    <td className="py-1 pr-2">
                      {item.type === "file"
                        ? `${(item.size / 1024).toFixed(1)} KB`
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.path}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex flex-col items-start gap-1 text-left"
                  onClick={() => handleOpen(item)}
                >
                  <div className="text-lg">
                    {item.type === "folder" ? "📁" : "🎧"}
                  </div>
                  <div className="text-[11px] font-semibold break-all">
                    {item.name}
                  </div>
                  {item.type === "file" && (
                    <div className="text-[10px] opacity-70">
                      {(item.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio preview player */}
        {previewUrl && (
          <div className="mt-3 border-t border-white/10 pt-2">
            <div className="text-[10px] mb-1 opacity-80">
              Previewing: {previewName}
            </div>
            <audio controls src={previewUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

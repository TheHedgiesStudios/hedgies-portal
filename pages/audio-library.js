import { useEffect, useState } from "react";

export default function AudioLibrary() {
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("Hedgies_Studios_Audio_Library/");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load(currentFolder);
  }, [currentFolder]);

  async function load(folder) {
    setLoading(true);
    const res = await fetch(`/api/audio-assets?folder=${encodeURIComponent(folder)}`);
    const { items } = await res.json();
    setItems(items);
    setLoading(false);
  }

  const navigate = (item) => {
    if (item.type === "folder") {
      setCurrentFolder(item.path + "/");
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl mb-4">Audio Library</h1>

      <p className="mb-4 opacity-70">{currentFolder}</p>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.path}
            className="p-4 bg-black/20 backdrop-blur rounded-lg hover:bg-black/40 cursor-pointer"
            onClick={() => navigate(item)}
          >
            <p className="font-bold">{item.name}</p>

            {item.type === "file" && (
              <audio controls src={item.url} className="w-full mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

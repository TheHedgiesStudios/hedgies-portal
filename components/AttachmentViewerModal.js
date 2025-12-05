// components/AttachmentViewerModal.js

export default function AttachmentViewerModal({ open, setOpen, url }) {
  if (!open || !url) return null;

  const lower = url.toLowerCase();
  const isPdf = lower.endsWith(".pdf");
  const isImage =
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp");

  function handleClose() {
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 w-full max-w-4xl h-[80vh] rounded-xl border border-neutral-700 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
          <span className="text-sm font-semibold">Attachment Viewer</span>
          <div className="flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-300 underline"
            >
              Open in new tab
            </a>
            <button
              onClick={handleClose}
              className="px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black/60 overflow-hidden flex items-center justify-center">
          {isPdf && (
            <iframe
              src={url}
              title="PDF Attachment"
              className="w-full h-full border-0"
            />
          )}

          {isImage && !isPdf && (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img src={url} alt="Attachment" className="max-w-full max-h-full" />
            </div>
          )}

          {!isPdf && !isImage && (
            <div className="text-sm text-gray-300 p-6 text-center">
              <p>Cannot preview this file type.</p>
              <p className="mt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 underline"
                >
                  Download attachment
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) return; // DO NOT show in the installed app

    // Listen for PWA install availability
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 1200); // show popup after 1.2 sec
    });
  }, []);

  if (!show || !deferredPrompt) return null;

  // Hologram sci-fi modal
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[5000]">
      <div className="relative w-[420px] p-6 rounded-2xl border border-cyan-400/50 shadow-[0_0_30px_cyan] bg-black/70">

        <h2 className="text-cyan-300 text-xl font-semibold tracking-widest mb-3">
          INSTALL HEDGIES STUDIOS OS
        </h2>

        <p className="text-gray-200 text-sm leading-relaxed mb-6">
          For better performance, stable sound playback, and a desktop-app
          experience, we recommend installing Hedgies OS.
        </p>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-xs uppercase tracking-wide rounded-md border border-gray-400/40 text-gray-300 hover:bg-white/10"
          >
            Later
          </button>

          <button
            onClick={async () => {
              deferredPrompt.prompt();
              const choice = await deferredPrompt.userChoice;
              if (choice.outcome === "accepted") {
                setDeferredPrompt(null);
                setShow(false);
              }
            }}
            className="px-4 py-2 text-xs uppercase tracking-wide rounded-md bg-cyan-400 text-black font-semibold hover:bg-cyan-300"
          >
            Install
          </button>
        </div>

      </div>
    </div>
  );
}

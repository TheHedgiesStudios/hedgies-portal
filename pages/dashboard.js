// pages/dashboard.js
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import { supabase } from "../lib/supabaseClient";

import AudioLibraryWindow from "../components/AudioLibraryWindow";
import AnnouncementsWidget from "../components/AnnouncementsWidget";
import CalendarWindow from "../components/CalendarWindow";
import DraggableResizableWindow from "../components/DraggableResizableWindow";
import BootSplash from "../components/BootSplash";

// ----------------------------------------------------------
// SOUND EFFECTS
// ----------------------------------------------------------
function playBootSound() {
  try {
    const audio = new Audio("/sounds/logoopen.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn("Boot sound error:", e);
  }
}

function playNotificationSound() {
  try {
    const audio = new Audio("/sounds/Announcement_Notification.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn("Notification error:", e);
  }
}

// ----------------------------------------------------------
// MAIN DASHBOARD
// ----------------------------------------------------------
export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [bootDone, setBootDone] = useState(false);
  const [announcementsReady, setAnnouncementsReady] = useState(false);

  const [search, setSearch] = useState("");
  const [showAudioWindow, setShowAudioWindow] = useState(false);
  const [showCalendarWindow, setShowCalendarWindow] = useState(false);

  // PWA install stuff
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowInstallPopup(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    setShowInstallPopup(false);
  }

  // Unlock audio for Chrome autoplay
  const audioUnlockedRef = useRef(false);
  useEffect(() => {
    function unlockAudio() {
      if (audioUnlockedRef.current) return;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();

      audioUnlockedRef.current = true;

      window.removeEventListener("mousedown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    }

    window.addEventListener("mousedown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("mousedown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // ----------------------------------------------------------
  // REALTIME ANNOUNCEMENTS
  // ----------------------------------------------------------
  function subscribeToAnnouncements() {
    return supabase
      .channel("realtime:public:announcements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        (payload) => {
          console.log("🔔 Announcement received:", payload);
          playNotificationSound();
        }
      )
      .subscribe((status) => console.log("Realtime status:", status));
  }

  // ----------------------------------------------------------
  // BOOT + USER LOADING
  // ----------------------------------------------------------
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/");
      setUser(user);

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!data || !data.username) return router.push("/setup");
      setProfile(data);

      // Boot animation logic
      const seen = sessionStorage.getItem("hedgiesBootSeen");
      if (!seen) {
        sessionStorage.setItem("hedgiesBootSeen", "1");
        setTimeout(() => setBootDone(true), 2600);
      } else {
        setBootDone(true);
      }

      playBootSound();

      // Load announcements realtime after boot
      setTimeout(() => {
        subscribeToAnnouncements();
        setAnnouncementsReady(true);
      }, 5000);
    }

    load();
  }, []);

  // ----------------------------------------------------------
  // MOUSE TRAIL
  // ----------------------------------------------------------
  useEffect(() => {
    function handleMove(e) {
      const dot = document.createElement("div");
      dot.className = "trail-dot";
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 150);
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // ----------------------------------------------------------
  // LOADING STATE
  // ----------------------------------------------------------
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading dashboard...
      </div>
    );
  }

  const displayName = profile.username.toUpperCase();
  const roleText = profile.role.toUpperCase();

  function handleIconClick(label) {
    if (label === "Audio Library") setShowAudioWindow(true);
    if (label === "Calendar") setShowCalendarWindow(true);
  }

  // ----------------------------------------------------------
  // UI RENDER
  // ----------------------------------------------------------
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className={`dashboard-bg ${bootDone ? "dashboard-visible" : ""}`} />

      {/* Boot splash */}
      {!bootDone && <BootSplash />}

      <div className="relative z-10 flex flex-col min-h-screen px-10 py-6">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-6">
          <Image src="/logo.png" width={120} height={120} alt="Logo" />
          <span className="text-xs tracking-[0.35em] uppercase text-gray-200">
            HEDGIES STUDIOS
          </span>
        </div>

        {/* User + OS Info */}
        <div className="text-[11px] tracking-[0.3em] uppercase text-gray-300 mb-10">
          HEDGIES OS · INTERNAL
          <div className="mt-1 text-[10px] tracking-[0.22em]">
            SIGNED IN AS <span className="font-semibold">{displayName}</span> ·{" "}
            <span className="opacity-80">{roleText}</span>
          </div>
        </div>

        {/* Desktop icons grid */}
        <div
          className="
            flex-1
            grid
            grid-cols-3
            gap-y-20
            gap-x-10
            px-4
            select-none
            desktop-grid
          "
        >
          <div className="flex flex-col items-start gap-24">
            <DesktopIcon label="Projects" onClick={handleIconClick} />
            <DesktopIcon label="Audio Library" onClick={handleIconClick} />
          </div>

          <div className="flex flex-col items-center gap-24">
            <DesktopIcon label="Studio Docs" onClick={handleIconClick} />
            <DesktopIcon label="Calendar" onClick={handleIconClick} />
          </div>

          <div className="flex flex-col items-end gap-24">
            <DesktopIcon label="Team Directory" onClick={handleIconClick} />
            <DesktopIcon label="My Account" onClick={handleIconClick} />
          </div>
        </div>

        {/* Taskbar */}
        <div className="taskbar">
          <input
            className="taskbar-search"
            placeholder="Search apps, files, or settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={handleLogout}
            className="ml-auto text-xs uppercase tracking-[0.25em] text-gray-300 hover:text-white"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENTS WIDGET */}
      {announcementsReady && (
        <DraggableResizableWindow title="ANNOUNCEMENTS">
          <AnnouncementsWidget profile={profile} />
        </DraggableResizableWindow>
      )}

      {/* CALENDAR WINDOW */}
      {showCalendarWindow && (
        <DraggableResizableWindow title="CALENDAR">
          <CalendarWindow profile={profile} />
        </DraggableResizableWindow>
      )}

      {/* AUDIO LIBRARY WINDOW */}
      {showAudioWindow && (
        <AudioLibraryWindow onClose={() => setShowAudioWindow(false)} />
      )}

      {/* INSTALL MODAL */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] animate-fadeIn">
          <div className="bg-[#0b0c10]/90 border border-white/20 rounded-2xl p-8 w-[360px] text-center animate-popup">
            <Image
              src="/icons/icon-192.png"
              width={80}
              height={80}
              alt="Hedgies Studios"
              className="mx-auto mb-4"
            />

            <h2 className="text-lg font-semibold tracking-wider mb-3">
              Install Hedgies Studios OS?
            </h2>

            <p className="text-sm text-gray-300 mb-6">
              Add HedgiesOS to your desktop for faster access and full-screen
              studio experience.
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="px-5 py-2 rounded-md border border-white/30 bg-white/10 hover:bg-white/20 transition"
                onClick={installApp}
              >
                Install
              </button>

              <button
                className="px-5 py-2 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition"
                onClick={() => setShowInstallPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------
// DESKTOP ICON COMPONENT
// ----------------------------------------------------------
function DesktopIcon({ label, onClick }) {
  return (
    <button
      onClick={() => onClick(label)}
      className="desktop-icon flex flex-col items-center gap-2"
    >
      <div className="w-16 h-16 rounded-2xl border border-white/25 flex items-center justify-center bg-black/10">
        <div className="w-10 h-10 rounded-xl border border-white/40" />
      </div>

      <span className="text-[10px] tracking-[0.2em] uppercase text-gray-200">
        {label}
      </span>
    </button>
  );
}

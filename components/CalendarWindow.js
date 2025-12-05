// components/CalendarWindow.js
import { useState, useEffect } from "react";
import Holidays from "date-holidays";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function CalendarWindow({ profile }) {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [holidays, setHolidays] = useState([]);

  const isAdmin =
    profile?.role === "admin" ||
    profile?.role === "director" ||
    profile?.role === "founder";

  // Fetch existing events (admin events are global, user events are personal)
  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .or(`created_by.eq.${profile.id},is_global.eq.true`)
        .order("date", { ascending: true });

      setEvents(data || []);
    }

    fetchEvents();
  }, [profile]);

  // Load US holidays
  useEffect(() => {
    const hd = new Holidays("US");
    const hol = hd.getHolidays(new Date().getFullYear());
    setHolidays(hol);
  }, []);

  async function createEvent() {
    if (!newEvent || !newDate) return;

    const { error } = await supabase.from("calendar_events").insert({
      title: newEvent,
      date: newDate,
      created_by: profile.id,
      is_global: isAdmin,
    });

    setNewEvent("");
    setNewDate("");
  }

  async function deleteEvent(id) {
    await supabase.from("calendar_events").delete().eq("id", id);
  }

  return (
    <div className="p-4 text-white text-sm space-y-4">

      {/* Title */}
      <div className="flex items-center gap-2 text-lg tracking-wide font-semibold">
        <CalendarDays size={20} /> Studio Calendar
      </div>

      {/* Add events */}
      <div className="bg-white/10 p-3 rounded-lg space-y-2">
        <input
          type="text"
          placeholder="Event title..."
          className="w-full p-2 rounded bg-black/20"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-2 rounded bg-black/20"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />

        <button
          onClick={createEvent}
          className="w-full flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 transition p-2 rounded-md"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Holidays */}
      <div>
        <h3 className="text-xs uppercase opacity-80 mb-1">US Holidays</h3>
        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
          {holidays.map((h) => (
            <div
              key={h.date}
              className="bg-white/10 p-2 rounded-md flex justify-between"
            >
              <span>{h.name}</span>
              <span className="opacity-70">{h.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div>
        <h3 className="text-xs uppercase opacity-80 mb-1">Your Events</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {events.length === 0 && (
            <div className="opacity-60 text-center">No events yet.</div>
          )}

          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white/10 p-2 rounded-md flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{ev.title}</div>
                <div className="text-xs opacity-70">{ev.date}</div>
              </div>

              {(isAdmin || ev.created_by === profile.id) && (
                <button
                  className="opacity-70 hover:opacity-100 transition"
                  onClick={() => deleteEvent(ev.id)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Setup() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user + check if username already exists
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUser(user);

      // Fetch the user's existing row
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile check error:", profileError);
        return;
      }

      // If username already exists → go to dashboard
      if (profile && profile.username) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    }

    load();
  }, [router]);

  // Save username to DB
  async function handleSave(e) {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    // Check if username already taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (existing) {
      setError("That username is already taken.");
      return;
    }

    // Update the user's row with the username
    const { error: updateError } = await supabase
      .from("users")
      .update({
        username: username.toLowerCase(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      setError("Failed to save username. Please try again.");
      return;
    }

    // SUCCESS → dashboard
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1116] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1116] flex items-center justify-center text-white">
      <div className="bg-white text-black p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-300">
        <h1 className="text-3xl font-bold mb-4">Choose Your Username</h1>

        <p className="text-gray-700 mb-6 text-sm">
          This will be your permanent username inside Hedgies Studios.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-4 bg-gray-100 rounded-xl border border-gray-300 text-lg
                       focus:outline-none focus:ring-2 focus:ring-hedgieRed"
          />

          <button
            className="bg-hedgieRed text-white font-semibold py-3 rounded-xl
                       hover:bg-red-700 transition"
          >
            Save Username
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

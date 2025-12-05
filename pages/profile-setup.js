import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'

export default function ProfileSetup() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  // --------------------------------------------------
  // LOAD USER + PROFILE ON PAGE LOAD
  // --------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      setInfo(null)

      // 1) Get Supabase auth session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error(sessionError)
      }

      if (!session || !session.user) {
        // Not logged in → send back to login
        window.location.href = '/'
        return
      }

      setUser(session.user)

      // 2) Load profile row from "profiles" table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, role, approved')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError) {
        console.error(profileError)
        setError('Could not load your profile. Please contact a studio admin.')
        setLoading(false)
        return
      }

      if (!profile) {
        // Trigger didn’t create a row / table misconfigured
        setError(
          'No profile record was found for this account. ' +
            'Please contact a studio admin so they can fix your profile entry.'
        )
        setLoading(false)
        return
      }

      setUsername(profile.username || '')
      setRole(profile.role || 'pending')
      setApproved(Boolean(profile.approved))
      setLoading(false)
    }

    load()
  }, [])

  // --------------------------------------------------
  // SAVE USERNAME
  // --------------------------------------------------
  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!username.trim()) {
      setError('Please enter a username before saving.')
      return
    }

    if (!user) {
      setError('You are not logged in.')
      return
    }

    setSaving(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id)

    setSaving(false)

    if (updateError) {
      console.error(updateError)
      setError('Could not save your username. Please try again.')
      return
    }

    setInfo('Your username has been saved.')
  }

  // --------------------------------------------------
  // LOG OUT (optional quick access)
  // --------------------------------------------------
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1116] text-white flex items-center justify-center">
        Loading your profile…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E1116] text-white">
      {/* NAVBAR — same as dashboard, loggedIn = true */}
      <Navbar loggedIn={true} />

      {/* Centered white card like login, NO comets */}
      <main className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div
          className="
            max-w-xl w-full mx-auto p-8
            bg-white text-black
            rounded-2xl shadow-2xl
            border border-gray-300
          "
        >
          <h1 className="text-3xl font-bold mb-3 tracking-wide">
            Hedgies Account Setup
          </h1>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            This page lets you set your display username and review your studio
            access status.
          </p>

          {/* BASIC ACCOUNT INFO */}
          <div className="mb-4 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span>{' '}
              {user?.email || 'Unknown'}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span>{' '}
              {role ? role : 'pending'}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Approval:</span>{' '}
              {approved ? 'Approved' : 'Pending admin approval'}
            </p>
          </div>

          <hr className="my-4 border-gray-300" />

          {/* USERNAME FORM */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-800">
              Username
            </label>

            <input
              type="text"
              placeholder="Choose your studio username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full p-3 bg-gray-100
                rounded-xl border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-hedgieRed
                placeholder-gray-500
              "
            />

            <button
              type="submit"
              disabled={saving}
              className="
                w-full bg-hedgieRed text-white
                font-semibold py-3 rounded-xl
                transition-all duration-200 hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? 'Saving…' : 'Save Username'}
            </button>

            {/* MESSAGES */}
            {info && (
              <p className="text-xs text-green-600 mt-1 text-center">
                {info}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1 text-center">
                {error}
              </p>
            )}
          </form>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between mt-6 text-xs text-gray-600">
            <span>
              If anything looks wrong, contact a Hedgies Studios admin.
            </span>
            <button
              onClick={handleLogout}
              className="text-hedgieRed hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

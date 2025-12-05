import { useState } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  // ----------------------------------------------------
  // LOGIN WITH EMAIL + PASSWORD
  // ----------------------------------------------------
  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      console.error(error)
      setError(error.message || 'Login failed. Please try again.')
      return
    }

    // TODO: optional: check "profiles.approved" here later
    // For now, just send them to the dashboard.
    if (data.session) {
      window.location.href = '/dashboard'
    } else {
      setError('Login successful, but no session was created.')
    }
  }

  // ----------------------------------------------------
  // SIGN UP (CREATE ACCOUNT)
  // ----------------------------------------------------
  async function handleSignUp(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      console.error(error)
      setError(error.message || 'Sign-up failed. Please try again.')
      return
    }

    setInfo(
      'Account created. Please check your email to verify your address. ' +
        'After that, a studio admin will approve your account.'
    )
  }

  // ----------------------------------------------------
  // FORGOT PASSWORD (RESET EMAIL)
  // ----------------------------------------------------
  async function handleForgotPassword(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email) {
      setError('Please enter your email first so we know where to send the reset link.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Optional: where Supabase should send the user after they click the reset link
      redirectTo: `${window.location.origin}/dashboard`,
    })

    setLoading(false)

    if (error) {
      console.error(error)
      setError(error.message || 'Could not send reset email. Please try again.')
      return
    }

    setInfo('Password reset email sent. Please check your inbox.')
  }

  return (
    <div className="relative min-h-screen">

      {/* NAVBAR (unchanged, big logo, no buttons on login page) */}
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar loggedIn={false} />
      </div>

      {/* ======================================================
          CINEMATIC COMETS (same positions, just faster)
         ====================================================== */}

      {/* BLUE COMET */}
      <div
        className="comet comet-blue"
        style={{ top: '12%', left: '-35%', animationDuration: '6s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-blue"
        style={{ top: '10%', left: '-32%', animationDuration: '7s' }}
      ></div>

      {/* LIGHT BLUE COMET */}
      <div
        className="comet comet-lightblue"
        style={{ top: '38%', left: '-40%', animationDuration: '7s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-lightblue"
        style={{ top: '36%', left: '-38%', animationDuration: '8s' }}
      ></div>

      {/* RED COMET */}
      <div
        className="comet comet-red"
        style={{ top: '60%', left: '-45%', animationDuration: '4s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-red"
        style={{ top: '58%', left: '-42%', animationDuration: '5s' }}
      ></div>

      {/* ORANGE COMET */}
      <div
        className="comet comet-orange"
        style={{ top: '78%', left: '-30%', animationDuration: '5s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-orange"
        style={{ top: '76%', left: '-28%', animationDuration: '6s' }}
      ></div>

      {/* EXTRA BLUE COMET */}
      <div
        className="comet comet-blue"
        style={{ top: '25%', left: '-50%', animationDuration: '3s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-blue"
        style={{ top: '23%', left: '-48%', animationDuration: '4s' }}
      ></div>

      {/* EXTRA RED COMET */}
      <div
        className="comet comet-red"
        style={{ top: '5%', left: '-25%', animationDuration: '8s' }}
      ></div>
      <div
        className="comet-sparks comet-sparks-red"
        style={{ top: '3%', left: '-23%', animationDuration: '9s' }}
      ></div>

      {/* ======================================================
          CENTERED LOGIN BOX (SAME LOOK, EMAIL + PASSWORD NOW)
         ====================================================== */}
      <div
        className="
          fixed inset-0
          flex items-center justify-center
          z-30
        "
      >
        <div
          className="
            max-w-xl w-full mx-auto p-8
            bg-white text-black
            rounded-2xl shadow-2xl
            border border-gray-300
          "
        >
          <h1 className="text-3xl font-bold mb-4 tracking-wide">
            Welcome to Hedgies Studios
          </h1>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            This portal is restricted to Hedgies Studios team members.
            Please enter your secure access credentials below to continue.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full p-4 bg-gray-100
                rounded-xl border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-hedgieRed
                placeholder-gray-500
              "
              required
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full p-4 bg-gray-100
                rounded-xl border border-gray-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-hedgieRed
                placeholder-gray-500
              "
              required
            />

            {/* MAIN LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-hedgieRed text-white
                font-semibold py-3 rounded-xl
                transition-all duration-200 hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Working…' : 'Access Portal'}
            </button>

            {/* MAINTENANCE NOTICE (unchanged + your new line) */}
            <p className="text-gray-500 text-xs mt-1">
              Maintenance is performed between <strong>9 PM – 3 AM</strong>.
              Please do <strong>NOT</strong> log on during these times.
            </p>

            {/* LINKS: CREATE ACCOUNT + FORGOT PASSWORD */}
            <div className="flex items-center justify-between text-xs mt-2">
              <button
                type="button"
                onClick={handleSignUp}
                className="text-hedgieRed hover:underline"
                disabled={loading}
              >
                Create account
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-gray-600 hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* INFO / ERROR MESSAGES */}
            {info && (
              <p className="text-xs text-green-600 mt-2 text-center">{info}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

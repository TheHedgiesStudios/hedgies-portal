import { useRouter } from "next/router";

export default function Navbar({ loggedIn }) {
  const router = useRouter();
  const onDashboard = router.pathname === "/dashboard";

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between p-4 text-white z-50">
      {/* Left side (logo + text) */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="w-10 h-10 opacity-80 select-none" />
        <span className="font-semibold tracking-wider">HEDGIES STUDIOS</span>
      </div>

      {/* Right side (hidden on dashboard) */}
      {!onDashboard && (
        <div className="flex gap-8 text-sm opacity-90">
          <a href="/projects" className="hover:text-orange-300">Projects</a>
          <a href="/documents" className="hover:text-orange-300">Documents</a>
          <a href="/team" className="hover:text-orange-300">Team</a>

          {loggedIn && (
            <a className="font-bold hover:text-orange-300">Dashboard</a>
          )}
        </div>
      )}
    </nav>
  );
}

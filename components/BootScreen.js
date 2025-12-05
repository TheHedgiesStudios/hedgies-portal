import { useEffect } from "react";

export default function BootScreen({ username, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDone) onDone();
      // mark boot as played this session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hedgiesBootPlayed", "yes");
      }
    }, 1500); // ~1.5s total

    return () => clearTimeout(timer);
  }, [onDone]);

  const displayName = (username || "HEDGIES USER").toUpperCase();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        {/* central glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,140,255,0.35),_transparent_55%)]" />

        {/* comet streaks */}
        <div className="boot-comet boot-comet-1" />
        <div className="boot-comet boot-comet-2" />
        <div className="boot-comet boot-comet-3" />

        {/* logo + text */}
        <div className="relative z-20 flex flex-col items-center gap-3">
          <div className="boot-logo-circle">
            <div className="boot-logo-inner" />
          </div>

          <div className="text-center mt-2">
            <div className="text-sm tracking-[0.35em] text-gray-300">
              HEDGIES OS
            </div>
            <div className="text-xs text-gray-500 mt-1">
              INITIALIZING · {displayName}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .boot-logo-circle {
          width: 96px;
          height: 96px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 0 30px rgba(0, 200, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .boot-logo-inner {
          width: 70%;
          height: 70%;
          border-radius: 999px;
          border: 2px solid rgba(0, 200, 255, 0.9);
          border-top-color: rgba(255, 120, 40, 1);
          border-right-color: rgba(255, 60, 60, 1);
          animation: bootSpin 1.2s ease-in-out infinite;
        }

        @keyframes bootSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .boot-comet {
          position: absolute;
          width: 300px;
          height: 4px;
          border-radius: 999px;
          filter: blur(2px);
        }

        .boot-comet-1 {
          top: 40%;
          left: -40%;
          background: linear-gradient(
            to right,
            rgba(0, 200, 255, 0.9),
            transparent
          );
          animation: cometFly1 0.7s ease-out;
        }

        .boot-comet-2 {
          top: 55%;
          left: -50%;
          background: linear-gradient(
            to right,
            rgba(0, 255, 180, 0.9),
            transparent
          );
          animation: cometFly2 0.9s ease-out 0.05s;
        }

        .boot-comet-3 {
          top: 50%;
          left: -60%;
          background: linear-gradient(
            to right,
            rgba(255, 120, 40, 0.95),
            transparent
          );
          animation: cometFly3 1s ease-out 0.1s;
        }

        @keyframes cometFly1 {
          0% {
            transform: translateX(0) translateY(0) rotate(8deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateX(160%) translateY(-25%) rotate(8deg);
            opacity: 0;
          }
        }

        @keyframes cometFly2 {
          0% {
            transform: translateX(0) translateY(0) rotate(-5deg);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: translateX(180%) translateY(-10%) rotate(-5deg);
            opacity: 0;
          }
        }

        @keyframes cometFly3 {
          0% {
            transform: translateX(0) translateY(0) rotate(4deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%) translateY(-35%) rotate(4deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

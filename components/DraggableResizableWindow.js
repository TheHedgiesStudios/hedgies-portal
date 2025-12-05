// components/DraggableResizableWindow.js
import { useState, useRef, useEffect } from "react";

export default function DraggableResizableWindow({ children, title = "WINDOW" }) {
  const windowRef = useRef(null);

  const [pos, setPos] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(title + "-pos"));
    return saved || { x: 40, y: window.innerHeight - 420 };
  });

  const [size, setSize] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(title + "-size"));
    return saved || { width: 360, height: 380 };
  });

  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  function startDrag(e) {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }

  function handleDrag(e) {
    if (!dragging) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    setPos({ x: newX, y: newY });
    localStorage.setItem(title + "-pos", JSON.stringify({ x: newX, y: newY }));
  }

  function stopDrag() {
    setDragging(false);
  }

  const resizing = useRef(false);
  const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

  function startResize(e) {
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = {
      w: size.width,
      h: size.height,
      x: e.clientX,
      y: e.clientY,
    };
  }

  function handleResize(e) {
    if (!resizing.current) return;

    const deltaX = e.clientX - resizeStart.current.x;
    const deltaY = e.clientY - resizeStart.current.y;

    const newSize = {
      width: Math.max(260, resizeStart.current.w + deltaX),
      height: Math.max(220, resizeStart.current.h + deltaY),
    };

    setSize(newSize);
    localStorage.setItem(title + "-size", JSON.stringify(newSize));
  }

  function stopResize() {
    resizing.current = false;
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
    };
  });

  return (
    <div
      ref={windowRef}
      className="fixed bg-[#0b0c10]/90 border border-white/20 rounded-xl shadow-xl backdrop-blur-md select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        zIndex: 999,
      }}
    >
      {/* Drag top bar */}
      <div
        className="w-full h-8 cursor-move flex items-center px-3 text-xs tracking-wider border-b border-white/10 bg-white/5"
        onMouseDown={startDrag}
      >
        {title}
      </div>

      <div className="overflow-y-auto h-[calc(100%-2rem)] p-3">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize opacity-70 hover:opacity-100"
        onMouseDown={startResize}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      </div>
    </div>
  );
}

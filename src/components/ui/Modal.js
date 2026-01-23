"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[550px]
          min-h-[520px] 
          rounded-[10px]
          bg-[#ffff]
          
          
          border border-black/30
          shadow-[0_18px_40px_rgba(0,0,0,0.45)]
        "
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[18px] font-semibold text-black">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-black/90 hover:text-black text-[22px] leading-none cursor-pointer scale-100 active:scale-95 transition-all ease-in-out"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="border-b border-black/15" />
        <div className="px-6 py-8 space-y-6">{children}</div>
      </div>
    </div>
  );
}

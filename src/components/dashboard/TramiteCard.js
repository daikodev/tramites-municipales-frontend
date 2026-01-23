import { Plus, Clock3, Settings } from "lucide-react";

const ICONS = {
  plus: Plus,
  clock: Clock3,
  gear: Settings,
};

export default function TramiteCard({
  title,
  subtitle,
  ctaText,
  onClick,
  icon = "plus",
  active,
}) {
  const Icon = ICONS[icon] ?? Plus;

  return (
    <article
      className="
        w-[200px]
        rounded-[10px]
        bg-[#e1e1e1]
        border border-black/30
        shadow-[0_10px_18px_rgba(0,0,0,0.42)]
        px-5 py-5
        text-center
      "
    >
      <div className="flex justify-center mb-4">
        <div
          className={`
            h-12 w-12 rounded-[8px] flex items-center justify-center
            border border-black/30
            ${active ? "bg-[#0b3a77] text-white" : "bg-[#dcdcdc] text-black/60"}
          `}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-black leading-snug">
        {title}
      </h3>
      <p className="text-[13px] text-black/60 mt-2 min-h-[34px]">{subtitle}</p>

      <button
        onClick={onClick}
        type="button"
        className={`
          mt-5 w-full h-[30px] rounded-md text-[12px] font-semibold
          border border-black/10
          ${active ? "bg-[#0b3a77] text-white" : "bg-[#dcdcdc] text-black/70"}
          shadow-[0_3px_0_rgba(0,0,0,0.18)]
          hover:brightness-95
          cursor-pointer
          scale-100 active:scale-95
          transition-all ease-in-out
        `}
      >
        {ctaText}
      </button>
    </article>
  );
}

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  variant: "filled" | "outlined";
  onClick?: () => void;
}

export default function ActionCard({
  icon,
  title,
  description,
  variant,
  onClick,
}: ActionCardProps) {
  const isFilled = variant === "filled";

  const containerStyle = isFilled
    ? { backgroundColor: "#1B2A6B" }
    : { backgroundColor: "#ffffff", border: "2px solid #1B2A6B" };

  const textColor = isFilled ? "text-white" : "";
  const titleColor = isFilled ? "text-white" : "";
  const descColor = isFilled ? "text-blue-100" : "text-gray-600";
  const iconBg = isFilled
    ? "bg-white/20"
    : "bg-[#1B2A6B]/10";
  const iconColor = isFilled ? "text-white" : "";

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-4 rounded-2xl px-5 py-4 min-h-[56px] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${textColor}`}
      style={containerStyle}
    >
      {/* Icon circle */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full text-3xl ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <span
          className={`text-lg font-bold uppercase tracking-wide ${titleColor}`}
          style={!isFilled ? { color: "#1B2A6B" } : undefined}
        >
          {title}
        </span>
        <span className={`text-sm leading-snug ${descColor}`}>
          {description}
        </span>
      </div>
    </div>
  );
}

const RING_SRC = "/images/loader/tp-loader-ring.svg";
const LOGO_SRC = "/images/loader/tp-loader-logo.svg";

const GRADIENT =
  "linear-gradient(145deg, #FCE001 0%, #FDB813 100%)";

type TPLoaderProps = {
  className?: string;
  variant?: "fullscreen" | "inline";
  size?: number;
  label?: string;
};

export default function TPLoader({
  className = "",
  variant = "inline",
  size = 120,
  label,
}: TPLoaderProps) {
  const boxSize = variant === "fullscreen" ? 140 : size;
  const ringInsetPx = 4;

  const disc = (
    <div
      className="tp-loader-stage"
      style={{ width: boxSize, height: boxSize }}
    >
      <span className="tp-loader-glow" aria-hidden />
      <span className="tp-loader-ground" aria-hidden />
      <div className="tp-loader-badge">
        <div className="tp-loader-disc" style={{ backgroundImage: GRADIENT }}>
          <span className="tp-loader-gloss" aria-hidden />
          <span className="tp-loader-shade" aria-hidden />
          <span className="tp-loader-rim" aria-hidden />
          <div className="pointer-events-none absolute" style={{ inset: ringInsetPx }}>
            <div className="tp-loader-ring absolute inset-0">
              <img src={RING_SRC} alt="" className="h-full w-full object-contain" draggable={false} />
            </div>
          </div>
          <div className="tp-loader-logo absolute inset-[24%]">
            <img src={LOGO_SRC} alt="Traveling Partner" className="h-full w-full object-contain" draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background ${className}`}
        role="status"
        aria-live="polite"
        aria-label={label || "Loading"}
      >
        {disc}
        <span className="sr-only">{label || "Loading…"}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      {disc}
      {label ? (
        <p className="text-sm font-medium text-[#6b6960]">{label}</p>
      ) : null}
      <span className="sr-only">{label || "Loading…"}</span>
    </div>
  );
}

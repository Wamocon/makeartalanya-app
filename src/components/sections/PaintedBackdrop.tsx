type PaintTone = "rose" | "aqua" | "lilac" | "canvas";
type PaintFlow = "left" | "right";
type PaintComposition = "sweep" | "burst" | "ribbons" | "palette";

interface PaintedBackdropProps {
  tone: PaintTone;
  flow?: PaintFlow;
  composition?: PaintComposition;
}

export function PaintedBackdrop({ tone, flow = "left", composition = "sweep" }: PaintedBackdropProps) {
  return (
    <div
      className={`painted-backdrop painted-backdrop--${tone} painted-backdrop--${flow} painted-backdrop--${composition}`}
      aria-hidden="true"
    >
      <span className="painted-backdrop__stroke painted-backdrop__stroke--primary" />
      <span className="painted-backdrop__stroke painted-backdrop__stroke--secondary" />
      <span className="painted-backdrop__stroke painted-backdrop__stroke--accent" />
      <span className="painted-backdrop__stroke painted-backdrop__stroke--deep" />
      <span className="painted-backdrop__bristle painted-backdrop__bristle--one" />
      <span className="painted-backdrop__bristle painted-backdrop__bristle--two" />
      <span className="painted-backdrop__specks" />
      <span className="painted-backdrop__grain" />
    </div>
  );
}

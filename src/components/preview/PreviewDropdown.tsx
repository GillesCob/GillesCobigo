import { useRef, useState, type ReactNode } from "react";

// Reproduit .dropdown/.dropdown-summary/.dropdown-body de
// Projets/V1-Echanges/mockups/preview-prospect.html (variante A5/4, tranchee avec Gilles le
// 20/08) : locked=true (ex. "Les plus") reste toujours ouvert et non interactif, chevron cache.
// Sinon (ex. "Besoin de plus d'infos ?") : accordeon ferme par defaut, anime en JS a l'ouverture/
// fermeture (les <details> natifs n'animent pas nativement de facon fiable multi-navigateurs).
export default function PreviewDropdown({
  title,
  locked,
  children,
}: {
  title: string;
  locked?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(locked));
  const bodyRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  function toggle() {
    if (locked || animatingRef.current) return;
    const body = bodyRef.current;
    if (!body) return;
    animatingRef.current = true;
    function finish() {
      body!.removeEventListener("transitionend", finish);
      body!.style.height = "";
      body!.style.transition = "";
      animatingRef.current = false;
    }
    if (open) {
      const closedFrom = body.scrollHeight;
      body.style.transition = "none";
      body.style.height = closedFrom + "px";
      body.getBoundingClientRect();
      body.style.transition = "height .25s ease";
      body.style.height = "0px";
      body.addEventListener("transitionend", function onClose() {
        body.removeEventListener("transitionend", onClose);
        setOpen(false);
        finish();
      });
    } else {
      setOpen(true);
      requestAnimationFrame(() => {
        const openTo = body.scrollHeight;
        body.style.transition = "none";
        body.style.height = "0px";
        body.getBoundingClientRect();
        body.style.transition = "height .25s ease";
        body.style.height = openTo + "px";
        body.addEventListener("transitionend", finish);
      });
    }
  }

  return (
    <div className="max-w-[420px] mx-auto mt-5 rounded-2xl border border-border bg-[rgba(127,127,127,0.22)] text-left overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`w-full flex items-center gap-2 px-5 py-4 text-sm font-semibold text-foreground ${
          locked ? "cursor-default" : "cursor-pointer"
        }`}
      >
        {title}
        {!locked && (
          <span
            className={`ml-auto text-[10px] text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        )}
      </button>
      <div
        ref={bodyRef}
        style={locked ? undefined : { height: open ? undefined : 0, overflow: "hidden" }}
        className="px-5"
      >
        <div className="pb-[18px] text-[13.5px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

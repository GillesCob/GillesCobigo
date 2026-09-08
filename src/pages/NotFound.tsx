import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center overflow-hidden">
      <img
        src="/images/logo-gc-white.png"
        alt=""
        className="absolute inset-0 m-auto h-[95vh] w-auto max-w-none opacity-[0.06] select-none pointer-events-none"
      />
      <p className="relative text-[8rem] font-bold leading-none text-muted-foreground/20 select-none mb-6">
        404
      </p>
      <h1 className="relative text-2xl font-semibold mb-3">Cette page n&apos;existe pas (ou plus).</h1>
      <p className="relative text-muted-foreground text-sm mb-8 max-w-xs">
        Le lien est peut-être cassé, ou tu t&apos;es perdu en chemin.
      </p>
      <Button asChild className="relative">
        <Link to="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}

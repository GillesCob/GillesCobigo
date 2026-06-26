import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center">
      <p className="text-[8rem] font-bold leading-none text-muted-foreground/20 select-none mb-6">
        404
      </p>
      <h1 className="text-2xl font-semibold mb-3">Cette page n&apos;existe pas (ou plus).</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">
        Le lien est peut-être cassé, ou tu t&apos;es perdu en chemin.
      </p>
      <Button asChild>
        <Link to="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}

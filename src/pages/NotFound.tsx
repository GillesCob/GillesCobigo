import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center overflow-hidden bg-white">
      <img
        src="/images/logo-gc-black.png"
        alt=""
        className="absolute inset-0 m-auto h-[95vh] w-auto max-w-none opacity-[0.06] select-none pointer-events-none"
      />
      <p className="relative text-[8rem] font-bold leading-none text-gray-900/10 select-none mb-6">
        404
      </p>
      <h1 className="relative text-2xl font-semibold mb-3 text-gray-900">Cette page n&apos;existe pas (ou plus).</h1>
      <p className="relative text-gray-500 text-sm mb-8 max-w-xs">
        Le lien est peut-être cassé, ou tu t&apos;es perdu en chemin.
      </p>
      <Button asChild className="relative bg-gray-900 text-white hover:bg-gray-800">
        <Link to="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}

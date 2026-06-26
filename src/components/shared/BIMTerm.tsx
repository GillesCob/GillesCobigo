import { useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IBIMTermProps {
  children?: ReactNode;
}

export default function BIMTerm({ children = "BIM" }: IBIMTermProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        className="border-b border-dotted border-muted-foreground/50 cursor-help hover:border-foreground transition-colors"
        onClick={() => setOpen(true)}
      >
        {children}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Le BIM, qu&apos;est-ce que c&apos;est ?</DialogTitle>
          </DialogHeader>
          <img src="/images/bim-illustration.png" alt="Maquette numérique BIM" className="w-full rounded-lg" />
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              BIM signifie Building Information Modeling. C&apos;est une maquette numérique 3D d&apos;un bâtiment qui
              contient bien plus que de la géométrie. Chaque élément (mur, gaine, équipement) porte ses propres données
              techniques, son fournisseur, ses dimensions, sa résistance au feu, son coût.
            </p>
            <p>
              Sur un projet, plusieurs maquettes (architecte, structure, fluides, électricité) sont agrégées dans un
              environnement commun. Le BIM Manager pilote cette coordination, détecte les conflits entre lots, apporte
              des éléments de modélisations communs, accompagne les BE dans l'utilisation du logiciel de modélisation et
              garantit la cohérence des données du projet, de la conception jusqu&apos;à l&apos;exploitation du
              bâtiment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

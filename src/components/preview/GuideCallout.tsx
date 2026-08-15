interface IGuideCalloutProps {
  children: React.ReactNode;
}

// Bulle d'aide pointant vers l'element qui suit immediatement dans le flux (fleche vers le bas).
// Affichee uniquement tant qu'un projet est en phase de decouverte (project.coldIntro present sur
// les donnees, cf previewProjects.ts) : une fois contractualise, coldIntro disparait des donnees et
// toutes les bulles disparaissent avec, un seul flag pilote l'ensemble plutot qu'un etat par bulle.
export default function GuideCallout({ children }: IGuideCalloutProps) {
  return (
    <div className="relative inline-block bg-foreground text-background text-xs font-medium rounded-lg px-3 py-2 mb-3 shadow-md">
      {children}
      <span className="absolute -bottom-1.5 left-4 w-3 h-3 bg-foreground rotate-45" aria-hidden="true" />
    </div>
  );
}

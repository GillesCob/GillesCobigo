import { useState, useRef, useEffect } from "react";
import HeroSide from "./HeroSide";
import ProjectModal from "./ProjectModal";
import BIMTerm from "@/components/shared/BIMTerm";
import { btpProjects, type IBTPProject } from "@/data/btpProjects";
import { devProjects, type IDevProject } from "@/data/devProjects";

type ActiveModal = { side: "btp"; project: IBTPProject } | { side: "dev"; project: IDevProject } | null;

export default function HeroSplit() {
  const [modal, setModal] = useState<ActiveModal>(null);
  const [activePanel, setActivePanel] = useState<"dev" | "btp">("dev");
  const scrollRef = useRef<HTMLDivElement>(null);
  const devRef = useRef<HTMLDivElement>(null);
  const btpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (entry.target === devRef.current) setActivePanel("dev");
            else if (entry.target === btpRef.current) setActivePanel("btp");
          }
        });
      },
      { root: container, threshold: 0.5 },
    );

    if (devRef.current) observer.observe(devRef.current);
    if (btpRef.current) observer.observe(btpRef.current);

    return () => observer.disconnect();
  }, []);

  function scrollToPanel(ref: React.RefObject<HTMLDivElement>) {
    ref.current?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function handleBTPClick(id: string) {
    const project = btpProjects.find((p) => p.id === id);
    if (project) setModal({ side: "btp", project });
  }

  function handleDevClick(id: string) {
    const project = devProjects.find((p) => p.id === id);
    if (project) setModal({ side: "dev", project });
  }

  return (
    <section className="relative w-full h-screen">
      {/* Scroll container - horizontal carousel on mobile, standard flex on desktop */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain md:overflow-visible md:snap-none h-full"
      >
        {/* Dev panel - first in DOM (mobile default), right side on desktop via md:order-2 */}
        <HeroSide
          ref={devRef}
          side="dev"
          dates="2022 - aujourd'hui · DEV"
          title="Développeur"
          subtitle="TypeScript, Node.js, React, Prisma"
          tags={["Claude Code", "Docker", "Nginx"]}
          projectItems={devProjects.map((p) => ({ id: p.id, name: p.name }))}
          onProjectClick={handleDevClick}
          bgColor="#0A0A0A"
          className="order-1 md:order-2"
        />

        {/* BIM panel - second in DOM, left side on desktop via md:order-1 */}
        <HeroSide
          ref={btpRef}
          side="btp"
          dates="2008 - 2022 · BTP"
          title={
            <>
              <BIMTerm>BIM</BIMTerm> Manager
            </>
          }
          subtitle="Bouygues Construction"
          tags={["Maquette numérique", "100+ modèles", "2 milliards €"]}
          projectItems={btpProjects.map((p) => ({ id: p.id, name: p.name }))}
          onProjectClick={handleBTPClick}
          bgColor="#2C1810"
          className="order-2 md:order-1"
        />
      </div>

      {/*
        Navigation dots - mobile only.
        Left dot = BIM (desktop mental model: BIM is on the left).
        Right dot = Dev (desktop mental model: Dev is on the right).
        Default: Dev is visible → right dot active.
      */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 md:hidden">
        <button
          className={`rounded-full transition-all duration-300 ${
            activePanel === "btp" ? "w-3 h-3 bg-white/90" : "w-2 h-2 bg-white/30"
          }`}
          onClick={() => scrollToPanel(btpRef)}
          aria-label="Voir BIM Manager"
        />
        <button
          className={`rounded-full transition-all duration-300 ${
            activePanel === "dev" ? "w-3 h-3 bg-white/90" : "w-2 h-2 bg-white/30"
          }`}
          onClick={() => scrollToPanel(devRef)}
          aria-label="Voir Développeur"
        />
      </div>

      <ProjectModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        project={modal?.project ?? null}
        side={modal?.side ?? "btp"}
      />
    </section>
  );
}

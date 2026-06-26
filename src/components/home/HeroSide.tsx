interface IProjectItem {
  id: string;
  name: string;
}

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IHeroSideProps {
  side: "btp" | "dev";
  dates: string;
  title: ReactNode;
  subtitle: string;
  tags: string[];
  projectItems: IProjectItem[];
  bgColor: string;
  onProjectClick: (id: string) => void;
  className?: string;
}

const HeroSide = forwardRef<HTMLDivElement, IHeroSideProps>(
  ({ dates, title, subtitle, projectItems, bgColor, onProjectClick, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col shrink-0 w-screen snap-start md:w-1/2 md:shrink h-screen pt-24 md:pt-96 pb-16 px-8 md:px-16 md:overflow-hidden",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full max-w-xl">
        <p className="text-white/40 text-sm font-mono tracking-widest uppercase mb-10">{dates}</p>

        <div className="flex flex-col gap-2 mb-10">
          <h2 className="text-white text-5xl md:text-6xl font-bold leading-[1.1]" style={{ opacity: 0.4 }}>
            {title}
          </h2>
          <p className="text-white/90 text-2xl md:text-3xl font-medium">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {projectItems.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectClick(project.id)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-sm text-sm transition-colors"
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

HeroSide.displayName = "HeroSide";

export default HeroSide;

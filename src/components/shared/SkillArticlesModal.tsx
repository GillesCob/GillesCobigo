import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { getArticles } from "@/lib/articles";

interface ISkillArticlesModalProps {
  skillName: string;
  tags: string[];
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function SkillArticlesModal({ skillName, tags, onClose }: ISkillArticlesModalProps) {
  const articles = getArticles().filter((a) => a.tags.some((t) => tags.includes(t.toLowerCase())));
  const navigate = useNavigate();

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70 }} onClick={onClose} />
      <div
        className="bg-card border border-border rounded-xl shadow-xl flex flex-col"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, 90vw)",
          maxHeight: "80vh",
          zIndex: 70,
        }}
      >
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{skillName}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun article sur ce sujet pour l'instant.</p>
          ) : (
            <ul>
              {articles.map((a) => (
                <li key={a.slug} className="border-b border-border/50 last:border-0">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/articles/${a.slug}`, { state: { from: 'skills', skillName, tags } });
                    }}
                    className="flex items-center justify-between gap-4 py-2.5 w-full group text-left"
                  >
                    <span className="text-sm text-foreground group-hover:text-[#E8734A] transition-colors">
                      {a.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{formatDate(a.date)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex-none px-5 py-3 border-t border-border">
            <button
              onClick={() => {
                onClose();
                const tagParams = tags.map((t) => `tag=${encodeURIComponent(t)}`).join('&');
                navigate(`/articles?${tagParams}`, { state: { from: 'skills', skillName, tags } });
              }}
              className="text-sm text-[#E8734A] hover:underline transition-colors"
            >
              Voir tous les articles sur ce sujet →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

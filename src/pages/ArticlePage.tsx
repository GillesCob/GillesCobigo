import { useState, useEffect, useMemo, type ComponentType } from "react";
import { useParams, Navigate, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { getArticles, getArticleBySlug, isScheduled, slugify } from "@/lib/articles";
import ArticleSidebar from "@/components/articles/ArticleSidebar";
import ArticleToc from "@/components/articles/ArticleToc";

const mdxModules = import.meta.glob("/content/articles/**/*.mdx");

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs transition-colors hover:border-[#E8734A]/50"
    >
      {copied ? (
        <>
          <Check size={12} className="text-[#E8734A]" /> Copié
        </>
      ) : (
        <>
          <Copy size={12} className="text-muted-foreground" /> {label}
        </>
      )}
    </button>
  );
}

function CopyableLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm font-mono transition-colors hover:border-[#E8734A]/50"
    >
      <span className="flex-1 select-all break-all">{text}</span>
      {copied ? (
        <Check size={14} className="flex-shrink-0 text-[#E8734A]" />
      ) : (
        <Copy size={14} className="flex-shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

export default function ArticlePage() {
  const { slug, "*": rest } = useParams<{ slug: string; "*": string }>();
  const fullSlug = rest ? `${slug}/${rest}` : slug;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const { from, skillName, tags: skillTags } = (location.state ?? {}) as { from?: string; skillName?: string; tags?: string[] };
  const [Content, setContent] = useState<ComponentType<{ components?: Record<string, ComponentType> }> | null>(null);
  const articles = useMemo(
    () => getArticles(isPreview ? { includeScheduled: true } : undefined),
    [isPreview],
  );
  const existingMeta = useMemo(
    () => (fullSlug ? getArticleBySlug(fullSlug, { includeScheduled: true }) : undefined),
    [fullSlug],
  );
  const meta = useMemo(
    () => (fullSlug ? getArticleBySlug(fullSlug, isPreview ? { includeScheduled: true } : undefined) : undefined),
    [fullSlug, isPreview],
  );

  const headingIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of meta?.headings ?? []) {
      map.set(h.text.toLowerCase().trim(), h.id);
    }
    return map;
  }, [meta]);

  const mdxComponents = useMemo(
    () => ({
      h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
        const text = Array.isArray(children)
          ? children.map((c) => (typeof c === "string" ? c : "")).join("")
          : typeof children === "string"
            ? children
            : "";
        const id = headingIdMap.get(text.toLowerCase().trim()) ?? slugify(text);
        return (
          <h2 id={id} className="scroll-mt-20 mt-12 mb-4 text-2xl font-bold tracking-tight" {...props}>
            {" "}
            {children}
          </h2>
        );
      },
      h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
        const text = Array.isArray(children)
          ? children.map((c) => (typeof c === "string" ? c : "")).join("")
          : typeof children === "string"
            ? children
            : "";
        const id = headingIdMap.get(text.toLowerCase().trim()) ?? slugify(text);
        return (
          <h3 id={id} className="scroll-mt-20 mt-8 mb-3 text-xl font-semibold" {...props}>
            {" "}
            {children}
          </h3>
        );
      },
      img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // max-height evite qu'une capture au format portrait (ex. un formulaire centre sur une
        // page vide) s'affiche demesurement grande ; les captures deja larges/paysage restent
        // sous ce plafond et gardent leur taille actuelle (w-auto laisse le ratio decider)
        <img {...props} className="max-h-[700px] w-auto mx-auto" />
      ),
    }),
    [headingIdMap],
  );

  useEffect(() => {
    if (!fullSlug || !meta) return;
    setContent(null);
    const path = `/content/articles/${fullSlug}.mdx`;
    const loader = mdxModules[path];
    if (loader) {
      loader().then((mod) => setContent(() => (mod as { default: ComponentType }).default));
    }
  }, [fullSlug, meta]);

  if (!existingMeta) return <Navigate to="/articles" replace />;

  if (!meta) {
    return (
      <div className="flex min-h-screen pt-16">
        <ArticleSidebar articles={articles} activeSlug={fullSlug} />
        <main className="flex-1 min-w-0 md:ml-64 px-6 lg:px-12 py-12">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/articles"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Tous les articles
            </Link>
            <h1 className="text-3xl font-bold mb-3">{existingMeta.title}</h1>
            <p className="text-muted-foreground">
              Article programmé pour le {formatDate(existingMeta.date)} à {formatTime(existingMeta.date)}.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-16">
      <ArticleSidebar articles={articles} activeSlug={fullSlug} />

      <main className="flex-1 min-w-0 md:ml-64 xl:mr-56 px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          {from === "skills" ? (
            <button
              onClick={() =>
                navigate("/", {
                  state: { reopenSkill: { skillName, tags: skillTags } },
                })
              }
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Retour
            </button>
          ) : from === "filtered" ? (
            <button
              onClick={() => {
                const tagParams = skillTags?.map((t) => `tag=${encodeURIComponent(t)}`).join("&") ?? "";
                navigate(`/articles${tagParams ? `?${tagParams}` : ""}`, {
                  state: { from: "skills", skillName, tags: skillTags },
                });
              }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Retour aux articles
            </button>
          ) : from === "tag-filtered" ? (
            <button
              onClick={() => {
                const tagParams = skillTags?.map((t) => `tag=${encodeURIComponent(t)}`).join("&") ?? "";
                navigate(`/articles${tagParams ? `?${tagParams}` : ""}`);
              }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Retour aux articles
            </button>
          ) : (
            <Link
              to="/articles"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Tous les articles
            </Link>
          )}

          <header className="mb-10">
            <h1 className="text-3xl font-bold leading-tight mb-3">{meta.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(meta.date)}</span>
              {isPreview && isScheduled(meta.date) && (
                <span className="text-xs font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#E8734A]/10 text-[#E8734A]">
                  Programmé · {formatTime(meta.date)}
                </span>
              )}
              {meta.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {meta.post && isScheduled(meta.date) && (
            <section className="mb-10 rounded-lg border border-[#E8734A]/30 bg-[#E8734A]/5 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-mono uppercase tracking-widest text-[#E8734A]">
                  Post LinkedIn (visible tant que l'article n'est pas publié)
                </p>
                <CopyButton text={meta.post} label="Copier le post" />
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground mb-4">{meta.post}</p>
              <p className="text-xs text-muted-foreground mb-1">À coller en 1er commentaire :</p>
              <CopyableLine text={`Lien vers l'article : https://gillescobigo.com/articles/${fullSlug}`} />
            </section>
          )}

          {Content ? (
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <Content components={mdxComponents} />
            </article>
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted rounded animate-pulse"
                  style={{ width: `${70 + (i % 3) * 10}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ArticleToc headings={meta.headings} />
    </div>
  );
}

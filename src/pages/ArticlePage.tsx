import { useState, useEffect, useMemo, type ComponentType } from "react";
import { useParams, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getArticles, getArticleBySlug, slugify } from "@/lib/articles";
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

export default function ArticlePage() {
  const { slug, "*": rest } = useParams<{ slug: string; "*": string }>();
  const fullSlug = rest ? `${slug}/${rest}` : slug;
  const location = useLocation();
  const navigate = useNavigate();
  const { from, skillName, tags: skillTags } = (location.state ?? {}) as { from?: string; skillName?: string; tags?: string[] };
  const [Content, setContent] = useState<ComponentType<{ components?: Record<string, ComponentType> }> | null>(null);
  const articles = getArticles();
  const meta = fullSlug ? getArticleBySlug(fullSlug) : undefined;

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
    }),
    [headingIdMap],
  );

  useEffect(() => {
    if (!fullSlug) return;
    setContent(null);
    const path = `/content/articles/${fullSlug}.mdx`;
    const loader = mdxModules[path];
    if (loader) {
      loader().then((mod) => setContent(() => (mod as { default: ComponentType }).default));
    }
  }, [fullSlug]);

  if (!meta) return <Navigate to="/articles" replace />;

  return (
    <div className="flex min-h-screen pt-16">
      <ArticleSidebar articles={articles} activeSlug={fullSlug} />

      <main className="flex-1 min-w-0 px-6 lg:px-12 py-12">
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
              {meta.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </header>

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

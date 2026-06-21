import { useState } from "react";
import { useForm } from "react-hook-form";
import { Github, Linkedin, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IContactForm {
  name: string;
  email: string;
  message: string;
}

// Remplacer par ton ID Formspree après création du compte : https://formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykarjar";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IContactForm>();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(data: IContactForm) {
    setSubmitError(null);
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      setSubmitError("Envoi échoué. Contacte-moi directement sur LinkedIn.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 mt-11">
      <h1 className="text-3xl font-bold mb-3">Contact</h1>
      <p className="text-muted-foreground mb-12">Pour une mission, un projet, ou juste échanger sur la stack.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          {submitted ? (
            <div className="rounded-xl border border-border p-8 text-center">
              <p className="text-lg font-medium mb-2">Message envoyé.</p>
              <p className="text-muted-foreground text-sm">Je reviens vers toi sous 48h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="name">
                  Nom
                </label>
                <input
                  id="name"
                  {...register("name", { required: "Champ obligatoire" })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  placeholder="Votre nom"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: "Champ obligatoire" })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  {...register("message", { required: "Champ obligatoire" })}
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                  placeholder="Votre message..."
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message.message}</p>}
              </div>

              {submitError && <p className="text-destructive text-sm">{submitError}</p>}

              <Button type="submit" disabled={isSubmitting} className="self-start">
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-semibold mb-4">Liens</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://linkedin.com/in/gillescobigo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin size={16} /> linkedin.com/in/gillescobigo
              </a>
              <a
                href="https://github.com/gillescob"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={16} /> github.com/gillescob
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Disponibilité + mobilité</h3>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock size={14} className="flex-shrink-0" />
                <span>Disponible - ouvert aux missions freelance et CDI</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="flex-shrink-0" />
                <span>Nouvelle Aquitaine + remote (France entière)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

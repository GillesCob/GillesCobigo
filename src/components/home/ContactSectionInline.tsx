import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

interface IContactForm {
  name: string;
  email: string;
  message: string;
}

// Même endpoint que la page /contact existante (src/pages/Contact.tsx) : un seul formulaire à
// maintenir côté Formspree, pas un doublon avec des données bidon.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykarjar";

// Section Contact inline, mode-agnostique (même contenu en mode Dev ou Bâtiment), placée en bas
// de page comme dans le mockup de référence. Reprend la logique réelle de /contact (react-hook-form
// + Formspree) plutôt que le formulaire non fonctionnel du mockup HTML statique.
export default function ContactSectionInline() {
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
    <section id="contact" className="scroll-mt-[90px]">
      <motion.div
        className="mp-contact mx-auto flex min-h-0 w-full max-w-[880px] flex-col justify-center border-t border-border px-5 pt-12 sm:min-h-[82vh] sm:px-10"
        style={{ marginTop: 130 }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2>Contact</h2>
        <p className="sub">Pour une mission, un projet, ou juste échanger sur la stack.</p>

        <div className="mp-contact-grid">
          {submitted ? (
            <div className="rounded-xl border border-border p-8 text-center">
              <p className="text-lg font-medium mb-2">Message envoyé.</p>
              <p className="text-muted-foreground text-sm">Je reviens vers toi sous 48h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label htmlFor="new-contact-name">Nom</label>
                <input id="new-contact-name" {...register("name", { required: "Champ obligatoire" })} placeholder="Votre nom" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="field">
                <label htmlFor="new-contact-email">Email</label>
                <input
                  id="new-contact-email"
                  type="email"
                  {...register("email", { required: "Champ obligatoire" })}
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="field">
                <label htmlFor="new-contact-message">Message</label>
                <textarea
                  id="new-contact-message"
                  {...register("message", { required: "Champ obligatoire" })}
                  rows={4}
                  placeholder="Votre message"
                />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message.message}</p>}
              </div>

              {submitError && <p className="text-destructive text-sm">{submitError}</p>}

              {/* Mockup : <a class="btn primary" style="align-self:flex-start;margin-top:6px;">, styles
                  inline sur cet élément précis, pas une classe. Ici un vrai <button> (formulaire
                  fonctionnel, contrairement au mockup statique). */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mp-btn mp-btn-primary disabled:pointer-events-none disabled:opacity-60"
                style={{ alignSelf: "flex-start", marginTop: 6 }}
              >
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          )}

          <div className="mp-contact-links">
            <a href="https://github.com/GillesCob" target="_blank" rel="noopener noreferrer">
              <Github size={16} /> github.com/GillesCob
            </a>
            <a href="https://www.linkedin.com/in/gillescobigo" target="_blank" rel="noopener noreferrer">
              <Linkedin size={16} /> linkedin.com/in/gillescobigo
            </a>
            <a href="mailto:contact@gillescobigo.com">
              <Mail size={16} /> contact@gillescobigo.com
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

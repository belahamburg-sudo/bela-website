import { Button } from "@/components/button";

type LegalSection = {
  heading: string;
  copy?: string;
  items?: string[];
};

function sectionId(heading: string) {
  return heading
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function LegalPage({
  eyebrow = "Rechtliches",
  title,
  intro,
  sections,
  cta,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container-shell mx-auto max-w-4xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 font-heading text-5xl font-black text-cream">{title}</h1>
        <p className="mt-6 text-lg leading-9 text-muted">{intro}</p>
        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <article id={sectionId(section.heading)} key={section.heading} className="panel-surface rounded-[1.35rem] p-6">
              <h2 className="font-heading text-2xl font-black text-cream">{section.heading}</h2>
              {section.copy ? (
                <p className="mt-4 leading-8 text-muted">{section.copy}</p>
              ) : null}
              {section.items && section.items.length > 0 ? (
                <ul className="mt-4 grid gap-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-7 text-muted">
                      <span className="mt-1 h-2 w-2 flex-none rounded-full bg-gold-300/60" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        {cta ? (
          <div className="mt-12 text-center">
            <Button href={cta.href}>{cta.label}</Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

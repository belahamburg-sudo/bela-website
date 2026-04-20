export function LegalPage({
  title,
  intro,
  sections
}: {
  title: string;
  intro: string;
  sections: Array<{ heading: string; copy: string }>;
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell mx-auto max-w-4xl">
        <p className="eyebrow">Rechtlicher Platzhalter</p>
        <h1 className="mt-5 font-heading text-5xl font-black text-cream">{title}</h1>
        <p className="mt-6 text-lg leading-9 text-muted">{intro}</p>
        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <article key={section.heading} className="panel-surface rounded-[1.35rem] p-6">
              <h2 className="font-heading text-2xl font-black text-cream">{section.heading}</h2>
              <p className="mt-4 leading-8 text-muted">{section.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

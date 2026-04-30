export type Lesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  videoUrl: string;
  resources: Array<{
    label: string;
    type: "PDF" | "Template" | "Prompt";
    href: string;
  }>;
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  priceCents: number;
  image: string;
  level: "Start" | "Aufbau" | "System" | "Bundle";
  audience: string;
  outcome: string;
  featured?: boolean;
  includes: string[];
  modules: Array<{
    id: string;
    title: string;
    lessons: Lesson[];
  }>;
};

const sharedResources = [
  {
    label: "Arbeitsblatt zur Lektion",
    type: "PDF" as const,
    href: "/downloads/demo-workbook.pdf"
  },
  {
    label: "Prompt-Sammlung",
    type: "Prompt" as const,
    href: "/downloads/demo-prompts.txt"
  }
];

export const courses: Course[] = [
  {
    slug: "ai-goldmining-starter",
    title: "AI Goldmining Starter",
    tagline: "Dein erstes digitales Produkt mit AI",
    description:
      "Von der vagen Idee zum klaren Angebot. Kein Theorie-Marathon — du gehst mit einem verkaufsfertigen Produkt raus.",
    priceCents: 2900,
    image: "/assets/generated/course-starter.svg",
    level: "Start",
    audience: "Einsteiger ohne eigenes Business",
    outcome:
      "Produktidee, Struktur, Name, Nutzenversprechen und erste Verkaufsseite. Alles real, alles deins.",
    featured: true,
    includes: [
      "Produktideen-Framework",
      "AI-Prompt-System für Produktstruktur",
      "Verkaufsseiten-Checkliste",
      "Starter-Workbooks als PDF"
    ],
    modules: [
      {
        id: "m1",
        title: "Von Idee zu Goldmine",
        lessons: [
          {
            id: "l1",
            title: "Warum digitale Produkte der schlankste Einstieg sind",
            duration: "12 Min.",
            summary:
              "Der Vergleich zu Dropshipping, Agenturen und SaaS — und warum digitale Produkte die höchste Marge pro eingesetzter Stunde haben.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Deine erste Produktidee finden",
            duration: "18 Min.",
            summary:
              "Skills × Interessen × Zielgruppenproblem. Das Mapping-Framework, mit dem du aus drei Rohinputs eine kaufbare Idee ableitest.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      },
      {
        id: "m2",
        title: "Packaging mit AI",
        lessons: [
          {
            id: "l3",
            title: "Name, Promise und Inhaltsstruktur",
            duration: "21 Min.",
            summary:
              "Aus rohen Gedanken wird ein Angebot: Titel, Ergebnis, Module, Kaufmotivation. Alles in einem Prompt-Loop.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "template-goldmine",
    title: "Template Goldmine",
    tagline: "Vorlagen bauen und verkaufen",
    description:
      "Notion, Canva, Sheets, Framer. Templates, die einen echten Workflow lösen — keine schicken Dateien ohne Zweck.",
    priceCents: 3900,
    image: "/assets/generated/course-template.svg",
    level: "Aufbau",
    audience: "Creator und Umsetzer mit ersten Skills",
    outcome:
      "Template-Konzept, klare Produktlogik und Store-ready Beschreibung in deinem Portfolio.",
    includes: [
      "Template-Ideenmatrix",
      "Canva/Notion/Sheets Produktlogik",
      "AI-Copy-Prompts",
      "Quality-Check vor Launch"
    ],
    modules: [
      {
        id: "m1",
        title: "Template-Produkt bauen",
        lessons: [
          {
            id: "l1",
            title: "Was ein Template kaufbar macht",
            duration: "15 Min.",
            summary:
              "Unterschied zwischen hübscher Datei und echtem Prozessgewinn. Käufer bezahlen für gesparte Stunden, nicht für Ästhetik allein.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Aus einem Workflow ein Produkt machen",
            duration: "24 Min.",
            summary:
              "Wiederholbare Abläufe zerlegen und in eine Template-Struktur gießen, die auch ohne dich funktioniert.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "mini-kurs-maschine",
    title: "Mini-Kurs Maschine",
    tagline: "Kursidee bis Verkaufsseite",
    description:
      "Ein schlanker Kurs mit einem klaren Ergebnis — nicht 100 Lektionen Content-Friedhof.",
    priceCents: 4900,
    image: "/assets/generated/course-minikurs.svg",
    level: "System",
    audience: "Menschen mit Wissen, das produktisiert werden soll",
    outcome:
      "Kurskonzept mit Modulen, Lektionen, Ressourcen und Verkaufsargumenten in einem kohärenten Angebot.",
    includes: [
      "Mini-Kurs-Struktur",
      "Lektionsskript mit AI",
      "Bonus- und Workbook-System",
      "Salespage-Rohfassung"
    ],
    modules: [
      {
        id: "m1",
        title: "Der schlanke Kurs",
        lessons: [
          {
            id: "l1",
            title: "Ein Ergebnis, nicht 100 Lektionen",
            duration: "17 Min.",
            summary:
              "Fokus schlägt Umfang. Wie du das eine Ergebnis definierst und alles entfernst, was den Kauf blockiert.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Module und Skripte mit AI bauen",
            duration: "27 Min.",
            summary:
              "AI als Strukturhilfe — nicht als Content-Generator. Der Prompt-Workflow vom Outline bis zur fertigen Lektion.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "funnel-store-system",
    title: "Funnel & Store System",
    tagline: "Automatisiert verkaufen",
    description:
      "Store, Lead-Magnet, Webinar und Community als ein kohärentes System, das ohne dich arbeitet.",
    priceCents: 5900,
    image: "/assets/generated/course-funnel.svg",
    level: "System",
    audience: "Alle, die nicht nur bauen, sondern verkaufen wollen",
    outcome:
      "Eine Funnel-Map — du weißt, welche Seite welchen Job macht und wo die Metriken hängen.",
    includes: [
      "Funnel-Map",
      "Lead-Formel",
      "Checkout-Checkliste",
      "E-Mail-Sequenz für den Start"
    ],
    modules: [
      {
        id: "m1",
        title: "Vom Klick zum Kauf",
        lessons: [
          {
            id: "l1",
            title: "Die 5 Seiten im System",
            duration: "20 Min.",
            summary:
              "Landingpage, Webinar, Store, Kursdetailseite, Dashboard — jede mit einem einzigen klaren Job.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Newsletter und Community als Verkaufsmotor",
            duration: "22 Min.",
            summary:
              "Vertrauen vor Verkauf. Der Follow-up-Prozess ohne aggressive Push-Mechanik.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "ai-content-factory",
    title: "AI Content Factory",
    tagline: "Content-System mit AI aufbauen",
    description:
      "Von einer Idee zu 30 Tagen geplanten Content — ohne täglich neu nachdenken zu müssen. Dein AI-getriebenes Content-System.",
    priceCents: 3400,
    image: "/assets/generated/course-starter.svg",
    level: "Aufbau",
    audience: "Creator, die konsistent publizieren wollen",
    outcome:
      "Ein vollständiges Content-System: Themenplanung, Formate, Distribution und AI-Prompts für 30 Tage.",
    includes: [
      "Content-Planung Framework",
      "AI-Prompt-System für Texte und Skripte",
      "Redaktionskalender Vorlage",
      "Multi-Format-Recycling-System"
    ],
    modules: [
      {
        id: "m1",
        title: "Das Content-System bauen",
        lessons: [
          {
            id: "l1",
            title: "Warum die meisten Content-Pläne scheitern",
            duration: "14 Min.",
            summary:
              "Der Unterschied zwischen einem Content-Plan und einem Content-System. Systeme produzieren sich halb selbst.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Themen-Mining mit AI",
            duration: "19 Min.",
            summary:
              "Wie du aus deinem Wissen 90 Themen in 20 Minuten ableitest — und welche davon wirklich geklickt werden.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      },
      {
        id: "m2",
        title: "Produktion und Recycling",
        lessons: [
          {
            id: "l3",
            title: "Ein Asset, fünf Formate",
            duration: "22 Min.",
            summary:
              "Newsletter → LinkedIn Post → Reel → Thread → Carousel. Der Multiplikationsworkflow mit einem AI-Prompt-Loop.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "prompt-engineering-pro",
    title: "Prompt Engineering Pro",
    tagline: "AI wirklich steuern lernen",
    description:
      "Nicht die nächste Prompt-Sammlung — sondern das mentale Modell dahinter. Wie du AI-Outputs reproduzierbar gut machst.",
    priceCents: 2900,
    image: "/assets/generated/course-minikurs.svg",
    level: "Start",
    audience: "Alle, die mit AI arbeiten und besser werden wollen",
    outcome:
      "Ein eigenes Prompt-Framework, das auf deine Use Cases passt — übertragbar auf jedes AI-Tool.",
    includes: [
      "Prompt-Struktur Mastersheet",
      "50 bewährte Basis-Prompts",
      "Role-Prompting-System",
      "Output-Debugging-Guide"
    ],
    modules: [
      {
        id: "m1",
        title: "Wie AI wirklich funktioniert",
        lessons: [
          {
            id: "l1",
            title: "Das mentale Modell hinter Prompts",
            duration: "16 Min.",
            summary:
              "AI ist kein Suchmaschinen-Ersatz. Das richtige Framing macht den Unterschied zwischen mittelmäßigem und exzellentem Output.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Struktur, Kontext und Constraints",
            duration: "21 Min.",
            summary:
              "Die drei Hebel jedes starken Prompts — und warum die meisten nur einen benutzen.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "digital-product-launch",
    title: "Digital Product Launch",
    tagline: "Launch-System in 14 Tagen",
    description:
      "Kein Launch ohne Plan. Die 14-Tage-Launch-Sequenz: Warm-up, Presale, Launch, Follow-up — alles strukturiert mit AI.",
    priceCents: 4400,
    image: "/assets/generated/course-funnel.svg",
    level: "System",
    audience: "Alle, die ein fertiges Produkt endlich launchen wollen",
    outcome:
      "Eine vollständige Launch-Sequenz in 14 Tagen — mit AI-generierten Texten für jeden Schritt.",
    includes: [
      "14-Tage Launch-Kalender",
      "E-Mail-Sequenz (7 Mails)",
      "Social-Media-Launch-Texte",
      "Checkout-Optimierungs-Checkliste"
    ],
    modules: [
      {
        id: "m1",
        title: "Launch-Vorbereitung",
        lessons: [
          {
            id: "l1",
            title: "Die Psychologie eines erfolgreichen Launch",
            duration: "18 Min.",
            summary:
              "Warum Launches scheitern — und wie du Dringlichkeit aufbaust, ohne unecht zu wirken.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          },
          {
            id: "l2",
            title: "Presale und Warm-up aufbauen",
            duration: "25 Min.",
            summary:
              "Die ersten 7 Tage entscheiden. Der Warm-up-Prozess, der echtes Interesse erzeugt bevor das Produkt live geht.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      },
      {
        id: "m2",
        title: "Launch und Follow-up",
        lessons: [
          {
            id: "l3",
            title: "Launch-Tag: Was wirklich passiert",
            duration: "20 Min.",
            summary:
              "Stunde für Stunde am Launch-Tag — worauf du achtest, was du sendest und wie du auf Einwände reagierst.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  },
  {
    slug: "ai-goldmining-starter-pack",
    title: "AI Goldmining Starter Pack",
    tagline: "Alle Startkurse im Bundle",
    description:
      "Der kompakte Komplettstart: Produktidee, Template, Mini-Kurs und Funnel-System als eine zusammenhängende Roadmap.",
    priceCents: 9700,
    image: "/assets/generated/course-bundle.svg",
    level: "Bundle",
    audience: "Ernsthafte Starter, die direkt das ganze System sehen wollen",
    outcome:
      "Die komplette Produktleiter — von Idee bis Verkaufsprozess in einer Umgebung.",
    featured: true,
    includes: [
      "Alle vier Mini-Kurse",
      "Bundle-Workbook",
      "90-Tage Umsetzungsplan",
      "Launch-Checkliste"
    ],
    modules: [
      {
        id: "m1",
        title: "Starter Pack Roadmap",
        lessons: [
          {
            id: "l1",
            title: "Deine 90-Tage AI-Goldmining-Roadmap",
            duration: "31 Min.",
            summary:
              "Kurs-Reihenfolge, Meilensteine, was in den ersten 30, 60 und 90 Tagen gebaut wird.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            resources: sharedResources
          }
        ]
      }
    ]
  }
];

export const featuredCourses = courses.filter((course) => course.featured);

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export const navItems = [
  { href: "/kurse", label: "Kurse" },
  { href: "/webinar", label: "Webinar" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "Über mich" }
];

export const faqItems = [
  {
    q: "Brauche ich Vorerfahrung in Marketing oder AI?",
    a: "Nein. Die Methode funktioniert ab null. Was du brauchst: Bereitschaft, wirklich umzusetzen. Es gibt Menschen, die scheitern mit 10 Jahren Marketing-Erfahrung, und andere, die in 6 Wochen ihr erstes Produkt launchen ohne Vorwissen. Der Unterschied ist nie das Vorwissen."
  },
  {
    q: "Ist das wieder so ein Reichtums-Versprechen?",
    a: "Nein. Das erste realistische Ziel ist 3.000 € monatlich selbstständig — nicht 20K in 30 Tagen. Kein Zertifikat garantiert dir Umsatz. Was du bekommst, ist ein System, das funktioniert, wenn du es durchziehst. Keine Garantie, aber eine ehrliche Roadmap."
  },
  {
    q: "Wie viel Startkapital brauche ich?",
    a: "Für das erste digitale Produkt: effektiv 0 €. Du brauchst Notion/Canva/Google Docs (alles Gratis-Tier) und einen Store wie Gumroad oder Stripe Payment Links. Werbebudget ist optional und erst ab Produkt-Launch relevant."
  },
  {
    q: "Wie viel Zeit muss ich investieren?",
    a: "Realistisch 5–10 Stunden pro Woche, um in 8–12 Wochen das erste Produkt fertig im Store zu haben. Mehr Zeit = schneller. Weniger als 3 Stunden pro Woche reicht nicht — das ist keine Nebenbei-5-Minuten-Methode."
  },
  {
    q: "Brauche ich Reichweite oder Follower?",
    a: "Nein. Die ersten 3.000 € machst du ohne Publikum, weil du nicht auf Virality angewiesen bist. Mit Newsletter + Direct Outreach + kleinem Ad-Budget reicht das. Reichweite hilft später beim Skalieren, ist aber kein Startbedingung."
  },
  {
    q: "Was unterscheidet AI Goldmining von anderen AI-Kursen?",
    a: "Die meisten AI-Kurse sind Tool-Rundgänge. Hier geht es um den Verkaufsprozess. Das Tool ändert sich alle 3 Monate, die Methode bleibt. Du lernst, wie du aus AI-Output verkaufbare Produkte machst — nicht, welches Tool gerade trending ist."
  },
  {
    q: "Kann ich den Kurs mit Ratenzahlung kaufen?",
    a: "Ja. Mini-Kurse ab 49 € sind in 2 Raten buchbar, das Bundle in 3 Raten. Details im Checkout. Keine versteckten Gebühren, keine Abo-Falle."
  }
];

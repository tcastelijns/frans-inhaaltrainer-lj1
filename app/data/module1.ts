export type Category = "reading" | "listening" | "vocab" | "grammar" | "writing";

export type StepId =
  | "learn"
  | "reading"
  | "vocab-context"
  | "listening"
  | "vocab-practice"
  | "grammar"
  | "articles"
  | "checkpoint"
  | "remediation"
  | "speaking"
  | "writing"
  | "modulecheck"
  | "final-practice";

export type QuestionKind = "single" | "multi" | "text" | "fill" | "reorder";

export type Question = {
  id: string;
  category: Category;
  kind: QuestionKind;
  prompt: string;
  instruction?: string;
  options?: string[];
  answer: string | string[];
  acceptable?: string[];
  feedback: {
    correct: string;
    wrong: string;
  };
};

export type StepMeta = {
  id: StepId;
  title: string;
  shortTitle: string;
  subtitle: string;
};

export const moduleMeta = {
  title: "Bonjour, je me présente",
  subtitle: "Module 1",
  localStorageKey: "frans-inhaaltrainer-module-1-v1",
};

export const steps: StepMeta[] = [
  {
    id: "learn",
    title: "Dit ga je leren",
    shortTitle: "Start",
    subtitle: "Een korte blik op de route.",
  },
  {
    id: "reading",
    title: "Lezen",
    shortTitle: "Lezen",
    subtitle: "Eerst de hoofdlijn, daarna pas details.",
  },
  {
    id: "vocab-context",
    title: "Vocabulaire in context",
    shortTitle: "Woorden",
    subtitle: "Bruikbare zinnen uit de tekst herkennen.",
  },
  {
    id: "grammar",
    title: "Het werkwoord être",
    shortTitle: "Être",
    subtitle: "Leer zeggen wie of wat iemand is.",
  },
  {
    id: "listening",
    title: "Luisteren",
    shortTitle: "Luisteren",
    subtitle: "John en Léa stellen zich voor.",
  },
  {
    id: "vocab-practice",
    title: "Vocabulaire verder oefenen",
    shortTitle: "Oefenen",
    subtitle: "Korte, afwisselende oefeningen.",
  },
  {
    id: "articles",
    title: "De Franse lidwoorden",
    shortTitle: "Lidwoorden",
    subtitle: "Oefen de Franse woorden voor de, het en een.",
  },
  {
    id: "checkpoint",
    title: "Checkpoint",
    shortTitle: "Check",
    subtitle: "Kijken wat al stevig genoeg staat.",
  },
  {
    id: "remediation",
    title: "Gerichte extra oefening",
    shortTitle: "Extra",
    subtitle: "Alleen wat jij nog nodig hebt.",
  },
  {
    id: "speaking",
    title: "Spreken",
    shortTitle: "Spreken",
    subtitle: "Nazeggen en jezelf kort voorstellen.",
  },
  {
    id: "writing",
    title: "Schrijven",
    shortTitle: "Schrijven",
    subtitle: "Iets over een ander schrijven.",
  },
  {
    id: "modulecheck",
    title: "Modulecheck",
    shortTitle: "Modulecheck",
    subtitle: "Een nieuwe context met Noor.",
  },
  {
    id: "final-practice",
    title: "Gerichte extra oefening",
    shortTitle: "Extra",
    subtitle: "Alleen als de modulecheck dat vraagt.",
  },
];

export const readingText =
  "Salut ! Je m'appelle Lina. Je suis française et je suis en cinquième. J'habite à Lille, une grande ville en France. Je suis nouvelle au collège Victor Hugo. Voici Adam, un garçon néerlandais. Il habite aussi à Lille et il est en cinquième. Madame Dupont est professeure au collège. Elle est française. Au revoir !";

export const usefulSentences = [
  ["Bonjour / Salut.", "Hallo / hoi."],
  ["Au revoir.", "Tot ziens."],
  ["Ça va ?", "Hoe gaat het?"],
  ["Je m'appelle...", "Ik heet..."],
  ["J'habite à...", "Ik woon in..."],
  ["Tu habites où ?", "Waar woon jij?"],
  ["Je suis en...", "Ik zit in..."],
  ["Et toi ?", "En jij?"],
  ["Il / Elle habite à...", "Hij / zij woont in..."],
];

export const activeVocabulary = [
  ["bonjour", "goedendag, hallo"],
  ["salut", "hoi"],
  ["au revoir", "tot ziens"],
  ["merci", "bedankt"],
  ["oui", "ja"],
  ["non", "nee"],
  ["français / française", "Frans"],
  ["néerlandais / néerlandaise", "Nederlands"],
  ["nouveau / nouvelle", "nieuw"],
  ["le collège", "de middelbare school"],
  ["la classe", "de klas"],
  ["la ville", "de stad"],
  ["comment ?", "hoe?"],
  ["où ?", "waar?"],
  ["qui ?", "wie?"],
] as const;

export const receptiveVocabulary = [
  ["monsieur", "meneer"],
  ["madame", "mevrouw"],
  ["le garçon", "de jongen"],
  ["la fille", "het meisje"],
  ["l’ami / l’amie", "de vriend / vriendin"],
  ["le prénom", "de voornaam"],
  ["le nom de famille", "de achternaam"],
  ["l’adresse", "het adres"],
  ["la nationalité", "de nationaliteit"],
  ["le pays", "het land"],
  ["la rue", "de straat"],
  ["l’école", "de school"],
  ["voici", "hier is / zijn"],
  ["voilà", "daar is / zijn"],
  ["grand / grande", "groot"],
  ["joli / jolie", "mooi, leuk"],
  ["près de", "dicht bij"],
  ["là-bas", "daar"],
  ["aussi", "ook"],
  ["avec", "met"],
] as const;

export const lessonQuestions: Record<string, Question[]> = {
  reading: [
    {
      id: "read-1",
      category: "reading",
      kind: "single",
      prompt: "Wie stelt zich voor?",
      options: ["Lina", "Adam", "Madame Dupont"],
      answer: "Lina",
      feedback: {
        correct: "Goed. De tekst begint met: Je m'appelle Lina.",
        wrong: "Kijk nog eens naar de eerste zin met Je m'appelle.",
      },
    },
    {
      id: "read-2",
      category: "reading",
      kind: "single",
      prompt: "Waar woont Lina?",
      options: ["In Lille", "In Paris", "In Nederland"],
      answer: "In Lille",
      feedback: {
        correct: "Ja. J'habite à Lille betekent: ik woon in Lille.",
        wrong: "Zoek in de tekst naar J'habite à...",
      },
    },
    {
      id: "read-3",
      category: "reading",
      kind: "single",
      prompt: "Wie is Adam?",
      options: ["Een Nederlandse jongen", "Een Franse docent", "Een meisje uit Lille"],
      answer: "Een Nederlandse jongen",
      feedback: {
        correct: "Precies. Voici Adam, un garçon néerlandais.",
        wrong: "Let op de woorden un garçon néerlandais.",
      },
    },
    {
      id: "read-4",
      category: "reading",
      kind: "multi",
      prompt: "Wat weet je over Madame Dupont?",
      instruction: "Kies alles wat klopt.",
      options: ["Ze is docente", "Ze is Frans", "Ze woont in Nederland", "Ze heet Lina"],
      answer: ["Ze is docente", "Ze is Frans"],
      feedback: {
        correct: "Mooi. Je haalt twee details uit korte Franse zinnen.",
        wrong: "Lees de laatste twee zinnen nog eens rustig.",
      },
    },
  ],
  "vocab-context": [
    {
      id: "ctx-1",
      category: "vocab",
      kind: "single",
      prompt: "Welke bruikbare zin past bij: Ik heet Lina?",
      options: ["Je m'appelle Lina.", "J'habite à Lina.", "Au revoir Lina."],
      answer: "Je m'appelle Lina.",
      feedback: {
        correct: "Ja. Je m'appelle gebruik je voor je naam.",
        wrong: "Voor je naam gebruik je Je m'appelle...",
      },
    },
    {
      id: "ctx-2",
      category: "vocab",
      kind: "single",
      prompt: "Wat betekent J'habite à Lille?",
      options: ["Ik woon in Lille", "Ik heet Lille", "Ik ben Frans"],
      answer: "Ik woon in Lille",
      feedback: {
        correct: "Goed gezien.",
        wrong: "Habite lijkt op habitat: waar je woont.",
      },
    },
    {
      id: "ctx-3",
      category: "vocab",
      kind: "fill",
      prompt: "Vul de bruikbare zin aan: Tu habites ___ ?",
      answer: "ou",
      acceptable: ["ou", "où"],
      feedback: {
        correct: "Ja. Tu habites où ? betekent: waar woon jij?",
        wrong: "Het vraagwoord voor waar is où.",
      },
    },
  ],
  listening: [
    {
      id: "listen-round-1",
      category: "listening",
      kind: "multi",
      prompt: "Vraag 1 – Welke Franse zinnen hoor je?",
      instruction: "Vink alle zinnen aan die je hoort.",
      options: [
        "Bonjour !",
        "Salut !",
        "Ça va ?",
        "Je m'appelle…",
        "J'habite à…",
        "Au revoir !",
      ],
      answer: ["Bonjour !", "Je m'appelle…", "J'habite à…", "Au revoir !"],
      feedback: {
        correct: "Goed herkend.",
        wrong: "Vergelijk jouw keuze met de zinnen die hieronder worden gemarkeerd.",
      },
    },
    {
      id: "listen-round-2-greeting",
      category: "listening",
      kind: "text",
      prompt: "Vraag 3 – Welke begroeting hoor je aan het begin?",
      answer: "bonjour",
      acceptable: ["bonjour", "bonjour!"],
      feedback: {
        correct: "Goed. Je herkent de begroeting aan het begin.",
        wrong: "Luister nog eens goed naar het begin van het gesprek.",
      },
    },
    {
      id: "listen-round-2-name-question",
      category: "listening",
      kind: "single",
      prompt: "Vraag 4 – Wat vraagt één persoon om te weten hoe de ander heet?",
      options: ["Ça va ?", "Comment tu t'appelles ?", "Au revoir !"],
      answer: "Comment tu t'appelles ?",
      feedback: {
        correct: "Goed gekozen.",
        wrong: "Luister nog eens naar de vraag waarmee iemand naar een naam vraagt.",
      },
    },
    {
      id: "listen-round-2-fill",
      category: "listening",
      kind: "fill",
      prompt: "Vraag 5 – Vul aan wat je hoort: Je _____ John.",
      answer: "m'appelle",
      acceptable: ["m'appelle", "m’appelle"],
      feedback: {
        correct: "Goed. Je hebt het ontbrekende deel herkend.",
        wrong: "Luister nog eens naar de zin waarin John zijn naam zegt.",
      },
    },
  ],
  "vocab-practice": [
    {
      id: "voc-1",
      category: "vocab",
      kind: "single",
      prompt: "Welke zin gebruik je als je iemand begroet?",
      options: ["Bonjour.", "Merci.", "La ville."],
      answer: "Bonjour.",
      feedback: {
        correct: "Ja, Bonjour is een begroeting.",
        wrong: "Een begroeting is iets wat je zegt als je iemand ziet.",
      },
    },
    {
      id: "voc-2",
      category: "vocab",
      kind: "single",
      prompt: "Kies de juiste Franse vraag: Hoe heet jij?",
      options: ["Comment tu t'appelles ?", "Tu habites où ?", "Tu es en quelle classe ?"],
      answer: "Comment tu t'appelles ?",
      feedback: {
        correct: "Goed. Comment helpt hier bij naam vragen.",
        wrong: "Voor een naam vraag je Comment tu t'appelles ?",
      },
    },
    {
      id: "voc-3",
      category: "vocab",
      kind: "fill",
      prompt: "Vul aan: Je suis ___ cinquième.",
      answer: "en",
      feedback: {
        correct: "Ja. Je suis en cinquième.",
        wrong: "Voor de klas gebruik je: Je suis en...",
      },
    },
  ],
  grammar: [
    {
      id: "etre-1",
      category: "grammar",
      kind: "fill",
      prompt: "Je ___ française. (Ik ben Frans.)",
      answer: "suis",
      feedback: {
        correct: "Goed: Je suis française.",
        wrong: "Kijk in het overzicht welke vorm bij je hoort.",
      },
    },
    {
      id: "etre-2",
      category: "grammar",
      kind: "fill",
      prompt: "Tu ___ en cinquième. (Jij zit in de brugklas.)",
      answer: "es",
      feedback: {
        correct: "Goed: Tu es en cinquième.",
        wrong: "Kijk in het overzicht welke vorm bij tu hoort.",
      },
    },
    {
      id: "etre-3",
      category: "grammar",
      kind: "fill",
      prompt: "Nous ___ au collège Victor Hugo. (Wij zijn op het collège Victor Hugo.)",
      answer: "sommes",
      feedback: {
        correct: "Goed: Nous sommes au collège Victor Hugo.",
        wrong: "Kijk in het overzicht welke vorm bij nous hoort.",
      },
    },
    {
      id: "etre-4",
      category: "grammar",
      kind: "fill",
      prompt: "Vous ___ dans la même classe. (Jullie zitten in dezelfde klas.)",
      answer: "êtes",
      acceptable: ["êtes", "etes"],
      feedback: {
        correct: "Goed: Vous êtes dans la même classe.",
        wrong: "Kijk in het overzicht welke vorm bij vous hoort.",
      },
    },
    {
      id: "etre-5",
      category: "grammar",
      kind: "fill",
      prompt: "Lina = elle. Elle ___ française. (Zij is Frans.)",
      answer: "est",
      feedback: {
        correct: "Goed. Lina vervang je door elle; bij elle hoort est.",
        wrong: "Vervang Lina eerst door elle. Kijk daarna welke vorm daarbij hoort.",
      },
    },
    {
      id: "etre-6",
      category: "grammar",
      kind: "fill",
      prompt: "Adam = il. Il ___ néerlandais. (Hij is Nederlands.)",
      answer: "est",
      feedback: {
        correct: "Goed. Adam vervang je door il; bij il hoort est.",
        wrong: "Vervang Adam eerst door il. Kijk daarna welke vorm daarbij hoort.",
      },
    },
    {
      id: "etre-7",
      category: "grammar",
      kind: "fill",
      prompt: "Madame Dupont = elle. Elle ___ professeure. (Zij is docente.)",
      answer: "est",
      feedback: {
        correct: "Goed. Madame Dupont = elle, dus elle est.",
        wrong: "Madame Dupont vervang je door elle. Welke vorm hoort bij elle?",
      },
    },
    {
      id: "etre-8",
      category: "grammar",
      kind: "fill",
      prompt: "Lina et Emma = elles. Elles ___ françaises. (Zij zijn Frans.)",
      answer: "sont",
      feedback: {
        correct: "Goed. Lina et Emma = elles, dus elles sont.",
        wrong: "Twee meisjes vervang je door elles. Welke vorm hoort daarbij?",
      },
    },
    {
      id: "etre-9",
      category: "grammar",
      kind: "fill",
      prompt: "Adam et Tom = ils. Ils ___ néerlandais. (Zij zijn Nederlands.)",
      answer: "sont",
      feedback: {
        correct: "Goed. Adam et Tom = ils, dus ils sont.",
        wrong: "Twee jongens vervang je door ils. Welke vorm hoort daarbij?",
      },
    },
    {
      id: "etre-10",
      category: "grammar",
      kind: "fill",
      prompt: "Lina et Adam = ils. Ils ___ en cinquième. (Zij zitten in de brugklas.)",
      answer: "sont",
      feedback: {
        correct: "Goed. Een gemengde groep wordt ils, dus ils sont.",
        wrong: "Een gemengde groep vervang je door ils. Welke vorm hoort daarbij?",
      },
    },
    {
      id: "article-1",
      category: "grammar",
      kind: "fill",
      prompt: "___ collège est à Lille. (Het collège staat in Lille.)",
      answer: "le",
      feedback: {
        correct: "Goed: le collège.",
        wrong: "Collège is een mannelijk woord. Kijk nog eens in het overzicht.",
      },
    },
    {
      id: "article-2",
      category: "grammar",
      kind: "fill",
      prompt: "___ classe est grande. (De klas is groot.)",
      answer: "la",
      feedback: {
        correct: "Ja: la classe.",
        wrong: "Classe is een vrouwelijk woord. Kijk nog eens in het overzicht.",
      },
    },
    {
      id: "article-3",
      category: "grammar",
      kind: "fill",
      prompt: "___ école s'appelle Victor Hugo. (De school heet Victor Hugo.)",
      answer: "l'",
      acceptable: ["l'", "l’", "l"],
      feedback: {
        correct: "Goed: l'école. Voor een klinker wordt le of la verkort tot l'.",
        wrong: "École begint met een klinker. Welk verkort lidwoord gebruik je dan?",
      },
    },
    {
      id: "article-4",
      category: "grammar",
      kind: "fill",
      prompt: "J'aime ___ ville de Lille. (Ik houd van de stad Lille.)",
      answer: "la",
      feedback: {
        correct: "Goed: la ville.",
        wrong: "Ville is een vrouwelijk woord.",
      },
    },
    {
      id: "article-5",
      category: "grammar",
      kind: "fill",
      prompt: "___ professeur s'appelle monsieur Martin. (De docent heet meneer Martin.)",
      answer: "le",
      feedback: {
        correct: "Goed: le professeur.",
        wrong: "Hier gaat het om een mannelijke docent: le professeur.",
      },
    },
    {
      id: "article-6",
      category: "grammar",
      kind: "fill",
      prompt: "___ professeure s'appelle madame Dupont. (De docente heet mevrouw Dupont.)",
      answer: "la",
      feedback: {
        correct: "Goed: la professeure.",
        wrong: "Hier gaat het om een vrouwelijke docent: la professeure.",
      },
    },
    {
      id: "article-7",
      category: "grammar",
      kind: "fill",
      prompt: "___ ami de Lina habite à Lille. (De vriend van Lina woont in Lille.)",
      answer: "l'",
      acceptable: ["l'", "l’", "l"],
      feedback: {
        correct: "Goed: l'ami. Ami begint met een klinker.",
        wrong: "Ami begint met een klinker. Gebruik de verkorte vorm.",
      },
    },
    {
      id: "article-8",
      category: "grammar",
      kind: "fill",
      prompt: "___ élèves sont dans la classe. (De leerlingen zijn in de klas.)",
      answer: "les",
      feedback: {
        correct: "Goed: les élèves. Het woord staat in het meervoud.",
        wrong: "Élèves is meervoud. Welk lidwoord gebruik je bij alle meervoudsvormen?",
      },
    },
    {
      id: "article-9",
      category: "grammar",
      kind: "fill",
      prompt: "___ garçons sont néerlandais. (De jongens zijn Nederlands.)",
      answer: "les",
      feedback: {
        correct: "Goed: les garçons.",
        wrong: "Garçons is meervoud. Gebruik het lidwoord voor het meervoud.",
      },
    },
    {
      id: "article-10",
      category: "grammar",
      kind: "fill",
      prompt: "___ filles sont françaises. (De meisjes zijn Frans.)",
      answer: "les",
      feedback: {
        correct: "Goed: les filles.",
        wrong: "Filles is meervoud. Gebruik het lidwoord voor het meervoud.",
      },
    },
    {
      id: "pronoun-1",
      category: "grammar",
      kind: "single",
      prompt: "Lina est française. ___ habite à Lille.",
      options: ["Elle", "Il", "Ils"],
      answer: "Elle",
      feedback: {
        correct: "Ja. Lina is een meisje: elle.",
        wrong: "Lina vervang je door elle.",
      },
    },
    {
      id: "pronoun-2",
      category: "grammar",
      kind: "single",
      prompt: "Lina et Manon sont françaises. ___ sont au collège.",
      options: ["Elles", "Ils", "Elle"],
      answer: "Elles",
      feedback: {
        correct: "Goed. Twee meisjes: elles.",
        wrong: "Lina et Manon = elles. Welke vorm hoort daarbij?",
      },
    },
    {
      id: "indefinite-1",
      category: "grammar",
      kind: "fill",
      prompt: "Lina est ___ fille française. (Lina is een Frans meisje.)",
      answer: "une",
      feedback: {
        correct: "Goed: une fille.",
        wrong: "Fille is vrouwelijk enkelvoud. Kijk nog eens naar het overzicht.",
      },
    },
    {
      id: "indefinite-2",
      category: "grammar",
      kind: "fill",
      prompt: "Adam est ___ garçon néerlandais. (Adam is een Nederlandse jongen.)",
      answer: "un",
      feedback: {
        correct: "Goed: un garçon.",
        wrong: "Garçon is mannelijk enkelvoud. Kijk nog eens naar het overzicht.",
      },
    },
    {
      id: "indefinite-3",
      category: "grammar",
      kind: "fill",
      prompt: "Madame Dupont est ___ professeure. (Mevrouw Dupont is een docente.)",
      answer: "une",
      feedback: {
        correct: "Goed: une professeure.",
        wrong: "Professeure is vrouwelijk enkelvoud.",
      },
    },
    {
      id: "indefinite-4",
      category: "grammar",
      kind: "fill",
      prompt: "Victor Hugo est ___ collège à Lille. (Victor Hugo is een school in Lille.)",
      answer: "un",
      feedback: {
        correct: "Goed: un collège.",
        wrong: "Collège is mannelijk enkelvoud.",
      },
    },
    {
      id: "indefinite-5",
      category: "grammar",
      kind: "fill",
      prompt: "Ce sont ___ élèves français. (Dat zijn Franse leerlingen.)",
      answer: "des",
      feedback: {
        correct: "Goed: des élèves.",
        wrong: "Élèves staat in het meervoud. Gebruik het onbepaalde lidwoord voor meervoud.",
      },
    },
    {
      id: "indefinite-6",
      category: "grammar",
      kind: "fill",
      prompt: "Lina a ___ amie à Lille. (Lina heeft een vriendin in Lille.)",
      answer: "une",
      feedback: {
        correct: "Goed: une amie. Bij un en une gebruik je geen apostrof.",
        wrong: "Amie is vrouwelijk enkelvoud. Het onbepaalde lidwoord wordt niet verkort.",
      },
    },
  ],
};

export const checkpointQuestions: Question[] = [
  {
    id: "check-r1",
    category: "reading",
    kind: "text",
    prompt: "Mila schrijft: Bonjour, je m'appelle Mila. J'habite à Dijon. Welke stad noemt Mila?",
    answer: "Dijon",
    feedback: {
      correct: "Goed. J'habite à Dijon geeft haar woonplaats.",
      wrong: "Zoek naar J'habite à...",
    },
  },
  {
    id: "check-l1",
    category: "vocab",
    kind: "text",
    prompt: "Welke Franse begroeting kun je gebruiken als je iemand tegenkomt?",
    answer: "bonjour",
    acceptable: ["Bonjour", "bonjour!", "salut", "Salut", "salut!"],
    feedback: {
      correct: "Goed. Bonjour en salut zijn allebei mogelijk.",
      wrong: "Denk aan een Franse begroeting uit de woordenlijst.",
    },
  },
  {
    id: "check-v1",
    category: "vocab",
    kind: "text",
    prompt: "Vertaal naar het Frans: bedankt",
    answer: "merci",
    feedback: {
      correct: "Goed: merci.",
      wrong: "Zoek het woord op in Vocabulaire en probeer opnieuw.",
    },
  },
  {
    id: "check-v2",
    category: "vocab",
    kind: "text",
    prompt: "Vertaal naar het Frans: de stad",
    answer: "la ville",
    feedback: {
      correct: "Goed: la ville.",
      wrong: "Leer een zelfstandig naamwoord samen met zijn lidwoord.",
    },
  },
  {
    id: "check-v3",
    category: "vocab",
    kind: "text",
    prompt: "Wat betekent: la nationalité?",
    answer: "de nationaliteit",
    acceptable: ["nationaliteit"],
    feedback: {
      correct: "Goed.",
      wrong: "Je kunt dit receptieve woord opzoeken via Vocabulaire.",
    },
  },
  {
    id: "check-v4",
    category: "vocab",
    kind: "text",
    prompt: "Vertaal naar het Frans: nieuw (mannelijk)",
    answer: "nouveau",
    feedback: {
      correct: "Goed: nouveau.",
      wrong: "Kijk naar de mannelijke vorm in de woordenlijst.",
    },
  },
  {
    id: "check-v5",
    category: "vocab",
    kind: "fill",
    prompt: "Vul aan: Je m'_____ Sofia. (Ik heet Sofia.)",
    answer: "appelle",
    feedback: {
      correct: "Goed: Je m'appelle Sofia.",
      wrong: "Denk aan de bruikbare zin waarmee je je naam zegt.",
    },
  },
  {
    id: "check-v6",
    category: "vocab",
    kind: "text",
    prompt: "Schrijf in het Frans: Waar woon jij?",
    answer: "Tu habites où ?",
    acceptable: ["Tu habites où?", "tu habites ou", "tu habites où"],
    feedback: {
      correct: "Goed: Tu habites où ?",
      wrong: "Gebruik tu + habites + het Franse vraagwoord voor waar.",
    },
  },
  {
    id: "check-v7", category: "vocab", kind: "text",
    prompt: "Wat betekent: au revoir?", answer: "tot ziens",
    feedback: { correct: "Goed.", wrong: "Dit zeg je wanneer je afscheid neemt." },
  },
  {
    id: "check-g1", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Je ___ au collège Jules Ferry.", answer: "suis",
    feedback: { correct: "Goed: je suis.", wrong: "Welke vorm van être hoort bij je?" },
  },
  {
    id: "check-g2", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Vous ___ en cinquième.", answer: "êtes", acceptable: ["etes"],
    feedback: { correct: "Goed: vous êtes.", wrong: "Welke vorm van être hoort bij vous?" },
  },
  {
    id: "check-g3", category: "grammar", kind: "text",
    prompt: "Vervang het onderwerp door een persoonlijk voornaamwoord: Mila et Zoé → ___",
    answer: "elles",
    feedback: { correct: "Goed. Twee meisjes vervang je door elles.", wrong: "Het gaat om meerdere meisjes." },
  },
  {
    id: "check-g4", category: "grammar", kind: "text",
    prompt: "Vervang het onderwerp door een persoonlijk voornaamwoord: Youssef et Hugo → ___",
    answer: "ils",
    feedback: { correct: "Goed. Twee jongens vervang je door ils.", wrong: "Het gaat om meerdere jongens." },
  },
  {
    id: "check-g5", category: "grammar", kind: "fill",
    prompt: "___ école est près de la ville. (De school)", answer: "l'", acceptable: ["l’", "l"],
    feedback: { correct: "Goed: l'école.", wrong: "École begint met een klinker." },
  },
  {
    id: "check-g6", category: "grammar", kind: "fill",
    prompt: "___ garçons sont dans la classe. (De jongens)", answer: "les",
    feedback: { correct: "Goed: les garçons.", wrong: "Garçons staat in het meervoud." },
  },
  {
    id: "check-g7", category: "grammar", kind: "fill",
    prompt: "C'est ___ fille française. (een meisje)", answer: "une",
    feedback: { correct: "Goed: une fille.", wrong: "Fille is vrouwelijk enkelvoud." },
  },
  {
    id: "check-g8", category: "grammar", kind: "fill",
    prompt: "Ce sont ___ amis. (vrienden)", answer: "des",
    feedback: { correct: "Goed: des amis.", wrong: "Gebruik het onbepaalde lidwoord voor meervoud." },
    },
];

export const remediationQuestions: Record<Category, Question[]> = {
  reading: [
    {
      id: "rem-read",
      category: "reading",
      kind: "single",
      prompt: "Mehdi schrijft: Je suis en cinquième. Wat weet je?",
      options: ["Hij zit in de brugklas", "Hij woont in Frankrijk", "Hij neemt afscheid"],
      answer: "Hij zit in de brugklas",
      feedback: {
        correct: "Goed. Je suis en... geeft de klas.",
        wrong: "Let op de bruikbare zin Je suis en...",
      },
    },
    {
      id: "rem-read-2", category: "reading", kind: "text",
      prompt: "Inès schrijft: J'habite à Toulouse. Waar woont Inès?", answer: "Toulouse",
      feedback: { correct: "Goed.", wrong: "Zoek de plaats na J'habite à." },
    },
    {
      id: "rem-read-3", category: "reading", kind: "text",
      prompt: "Voici Lucas, un garçon français. Is Lucas Frans of Nederlands?", answer: "Frans",
      acceptable: ["frans"],
      feedback: { correct: "Goed.", wrong: "Let op het woord français." },
    },
    {
      id: "rem-read-4", category: "reading", kind: "text",
      prompt: "Madame Petit est professeure. Wat is haar beroep?", answer: "docente",
      acceptable: ["lerares", "een docente", "een lerares"],
      feedback: { correct: "Goed.", wrong: "Professeure vertelt welk beroep ze heeft." },
    },
    {
      id: "rem-read-5", category: "reading", kind: "text",
      prompt: "L'école est près de la ville. Ligt de school dichtbij of ver van de stad?", answer: "dichtbij",
      acceptable: ["dicht bij", "dichtbij de stad"],
      feedback: { correct: "Goed. Près de betekent dicht bij.", wrong: "Zoek près de op in de woordenlijst." },
    },
  ],
  listening: [
    {
      id: "rem-listen",
      category: "listening",
      kind: "single",
      prompt: "Luister nog eens naar John. Welke bruikbare zin hoor je vlak voor New York?",
      options: ["J'habite à", "Je m'appelle", "Au revoir"],
      answer: "J'habite à",
      feedback: {
        correct: "Ja. Dat is de bruikbare zin voor een woonplaats.",
        wrong: "Luister gericht naar het stukje vlak voor New York.",
      },
    },
    {
      id: "rem-listen-2", category: "listening", kind: "text",
      prompt: "Welke begroeting hoor je aan het begin?", answer: "bonjour",
      acceptable: ["Bonjour", "bonjour!"],
      feedback: { correct: "Goed.", wrong: "Luister opnieuw naar het eerste woord." },
    },
    {
      id: "rem-listen-3", category: "listening", kind: "text",
      prompt: "Welke naam noemt de jongen?", answer: "John",
      acceptable: ["john"],
      feedback: { correct: "Goed.", wrong: "Luister naar Je m'appelle..." },
    },
    {
      id: "rem-listen-4", category: "listening", kind: "text",
      prompt: "Welke naam noemt het meisje?", answer: "Léa",
      acceptable: ["Lea", "léa", "lea"],
      feedback: { correct: "Goed.", wrong: "Luister naar de tweede naam." },
    },
    {
      id: "rem-listen-5", category: "listening", kind: "text",
      prompt: "Welke afscheidszin hoor je?", answer: "au revoir",
      acceptable: ["Au revoir", "au revoir!"],
      feedback: { correct: "Goed.", wrong: "Luister naar het einde van het gesprek." },
    },
  ],
  vocab: [
    {
      id: "rem-vocab",
      category: "vocab",
      kind: "single",
      prompt: "Je wilt weten waar iemand woont. Wat vraag je?",
      options: ["Tu habites où ?", "Ça va ?", "Tu t'appelles où ?"],
      answer: "Tu habites où ?",
      feedback: {
        correct: "Goed. Dit is de woonplaatsvraag.",
        wrong: "Voor wonen gebruik je habites.",
      },
    },
    {
      id: "rem-vocab-2", category: "vocab", kind: "text",
      prompt: "Vertaal naar het Frans: bedankt", answer: "merci",
      feedback: { correct: "Goed: merci.", wrong: "Zoek het actieve woord op en probeer opnieuw." },
    },
    {
      id: "rem-vocab-3", category: "vocab", kind: "text",
      prompt: "Vertaal naar het Frans: de klas", answer: "la classe",
      feedback: { correct: "Goed: la classe.", wrong: "Typ het woord samen met het lidwoord." },
    },
    {
      id: "rem-vocab-4", category: "vocab", kind: "text",
      prompt: "Wat betekent: le nom de famille?", answer: "de achternaam",
      acceptable: ["achternaam"],
      feedback: { correct: "Goed.", wrong: "Dit is een receptief woord uit de woordenlijst." },
    },
    {
      id: "rem-vocab-5", category: "vocab", kind: "fill",
      prompt: "Vul aan: Je m'_____ Amir. (Ik heet Amir.)", answer: "appelle",
      feedback: { correct: "Goed: Je m'appelle Amir.", wrong: "Gebruik de bruikbare zin voor je naam." },
    },
  ],
  grammar: [
    {
      id: "rem-grammar",
      category: "grammar",
      kind: "fill",
      prompt: "Lina et Manon ___ françaises.",
      answer: "sont",
      feedback: {
        correct: "Ja. Elles sont.",
        wrong: "Lina et Manon = elles. Bij elles hoort sont.",
      },
    },
    {
      id: "rem-grammar-2", category: "grammar", kind: "fill",
      prompt: "Vul een vorm van être in: Nous ___ au collège.", answer: "sommes",
      feedback: { correct: "Goed: nous sommes.", wrong: "Kijk welke vorm bij nous hoort." },
    },
    {
      id: "rem-grammar-3", category: "grammar", kind: "text",
      prompt: "Vervang het onderwerp: Emma et Chloé → ___", answer: "elles",
      feedback: { correct: "Goed: elles.", wrong: "Het gaat om meerdere meisjes." },
    },
    {
      id: "rem-grammar-4", category: "grammar", kind: "fill",
      prompt: "___ école est grande. (De school)", answer: "l'", acceptable: ["l’", "l"],
      feedback: { correct: "Goed: l'école.", wrong: "École begint met een klinker." },
    },
    {
      id: "rem-grammar-5", category: "grammar", kind: "fill",
      prompt: "Voici ___ élèves français. (enkele leerlingen)", answer: "des",
      feedback: { correct: "Goed: des élèves.", wrong: "Gebruik het onbepaalde lidwoord voor meervoud." },
    },
  ],
  writing: [
    {
      id: "rem-writing",
      category: "writing",
      kind: "reorder",
      prompt: "Zet de zin goed.",
      options: ["Elle", "s'appelle", "Noor."],
      answer: "Elle s'appelle Noor.",
      feedback: {
        correct: "Goed. De persoonsvorm staat op de juiste plek.",
        wrong: "Begin met Elle en maak daarna de naam-zin af.",
      },
    },
    {
      id: "rem-writing-2", category: "writing", kind: "fill",
      prompt: "Elle _____ à Lyon. (Zij woont in Lyon.)", answer: "habite",
      feedback: { correct: "Goed.", wrong: "Gebruik het werkwoord voor wonen." },
    },
    {
      id: "rem-writing-3", category: "writing", kind: "fill",
      prompt: "Elle _____ française. (Zij is Frans.)", answer: "est",
      feedback: { correct: "Goed.", wrong: "Gebruik een vorm van être." },
    },
    {
      id: "rem-writing-4", category: "writing", kind: "reorder",
      prompt: "Zet de vraag in de goede volgorde.",
      options: ["Tu", "habites", "où ?"], answer: "Tu habites où ?",
      feedback: { correct: "Goed.", wrong: "Begin met Tu en zet het vraagwoord achteraan." },
    },
    {
      id: "rem-writing-5", category: "writing", kind: "reorder",
      prompt: "Zet de zin in de goede volgorde.",
      options: ["Je", "suis", "néerlandaise."], answer: "Je suis néerlandaise.",
      feedback: { correct: "Goed.", wrong: "Begin met Je en kies daarna de vorm van être." },
    },
  ],
};

export const writingQuestions: Question[] = [
  {
    id: "write-1",
    category: "writing",
    kind: "reorder",
    prompt: "Zet de zin goed.",
    options: ["Lina.", "s'appelle", "Elle"],
    answer: "Elle s'appelle Lina.",
    feedback: {
      correct: "Ja. Elle s'appelle Lina.",
      wrong: "Begin met Elle, daarna s'appelle, daarna de naam.",
    },
  },
  {
    id: "write-2",
    category: "writing",
    kind: "fill",
    prompt: "Elle ______ à Lille. (Zij woont in Lille.)",
    answer: "habite",
    feedback: {
      correct: "Goed. Elle habite à Lille.",
      wrong: "Voor wonen gebruik je habite.",
    },
  },
  {
    id: "write-3",
    category: "writing",
    kind: "fill",
    prompt: "Elle ______ française. (Zij is Frans.)",
    answer: "est",
    feedback: {
      correct: "Ja. Elle est française.",
      wrong: "Bij elle hoort est.",
    },
  },
];

export const moduleCheckQuestions: Question[] = [
  {
    id: "mod-r1",
    category: "reading",
    kind: "text",
    prompt: "Noor habite à Nantes et elle est française. Waar woont Noor?",
    answer: "Nantes",
    feedback: {
      correct: "Goed. Noor woont in Nantes.",
      wrong: "Zoek de zin met habite.",
    },
  },
  {
    id: "mod-v1", category: "vocab", kind: "text",
    prompt: "Vertaal naar het Frans: goedendag", answer: "bonjour",
    feedback: { correct: "Goed: bonjour.", wrong: "Dit is een begroeting." },
  },
  {
    id: "mod-v2", category: "vocab", kind: "text",
    prompt: "Vertaal naar het Frans: de middelbare school", answer: "le collège",
    acceptable: ["le college"],
    feedback: { correct: "Goed: le collège.", wrong: "Typ ook het lidwoord." },
  },
  {
    id: "mod-v3", category: "vocab", kind: "text",
    prompt: "Wat betekent: le prénom?", answer: "de voornaam", acceptable: ["voornaam"],
    feedback: { correct: "Goed.", wrong: "Zoek dit receptieve woord eventueel op." },
  },
  {
    id: "mod-v4", category: "vocab", kind: "text",
    prompt: "Wat betekent: près de?", answer: "dicht bij",
    feedback: { correct: "Goed.", wrong: "Dit zegt iets over afstand." },
  },
  {
    id: "mod-v5", category: "vocab", kind: "fill",
    prompt: "Vul aan: J'_____ à Nantes. (Ik woon in Nantes.)", answer: "habite",
    feedback: { correct: "Goed: J'habite à Nantes.", wrong: "Gebruik het werkwoord voor wonen." },
  },
  {
    id: "mod-v6", category: "vocab", kind: "text",
    prompt: "Schrijf in het Frans: Hoe heet jij?", answer: "Comment tu t'appelles ?",
    acceptable: ["Comment tu t'appelles?", "comment tu t’appelles", "comment tu t'appelles"],
    feedback: { correct: "Goed.", wrong: "Begin met Comment en gebruik t'appelles." },
  },
  {
    id: "mod-v7", category: "vocab", kind: "text",
    prompt: "Vertaal naar het Frans: Nederlands (vrouwelijk)", answer: "néerlandaise",
    acceptable: ["neerlandaise"],
    feedback: { correct: "Goed: néerlandaise.", wrong: "Gebruik de vrouwelijke vorm." },
  },
  {
    id: "mod-g1", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Noor ___ française.", answer: "est",
    feedback: { correct: "Goed: Noor est française.", wrong: "Noor = elle." },
  },
  {
    id: "mod-g2", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Nous ___ au collège Jules Verne.", answer: "sommes",
    feedback: { correct: "Goed: nous sommes.", wrong: "Welke vorm van être hoort bij nous?" },
  },
  {
    id: "mod-g3", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Tu ___ nouveau dans la classe.", answer: "es",
    feedback: { correct: "Goed: tu es.", wrong: "Welke vorm van être hoort bij tu?" },
  },
  {
    id: "mod-g4", category: "grammar", kind: "fill",
    prompt: "Vul een vorm van être in: Hugo et Noor = ils. Ils ___ en cinquième.", answer: "sont",
    feedback: { correct: "Goed: ils sont.", wrong: "Een gemengde groep wordt ils." },
  },
  {
    id: "mod-g5", category: "grammar", kind: "fill",
    prompt: "___ classe est grande. (De klas)", answer: "la",
    feedback: { correct: "Goed: la classe.", wrong: "Classe is vrouwelijk enkelvoud." },
  },
  {
    id: "mod-g6", category: "grammar", kind: "fill",
    prompt: "___ amis habitent à Nantes. (De vrienden)", answer: "les",
    feedback: { correct: "Goed: les amis.", wrong: "Amis staat in het meervoud." },
  },
  {
    id: "mod-g7", category: "grammar", kind: "fill",
    prompt: "Noor a ___ amie néerlandaise. (een vriendin)", answer: "une",
    feedback: { correct: "Goed: une amie.", wrong: "Amie is vrouwelijk enkelvoud." },
  },
  {
    id: "mod-g8", category: "grammar", kind: "fill",
    prompt: "Voici ___ garçons français. (enkele jongens)", answer: "des",
    feedback: { correct: "Goed: des garçons.", wrong: "Gebruik het onbepaalde lidwoord voor meervoud." },
  },
  {
    id: "mod-g9", category: "grammar", kind: "text",
    prompt: "Vervang Zoé door een Frans persoonlijk voornaamwoord.", answer: "elle",
    feedback: {
      correct: "Goed: Zoé wordt elle.",
      wrong: "Zoé is één meisje.",
    },
  },
];

export const speechLines = [
  { french: "Bonjour !", dutch: "Hallo!" },
  { french: "Je m'appelle Lina.", dutch: "Ik heet Lina." },
  { french: "J'habite à Lille.", dutch: "Ik woon in Lille." },
  { french: "Je suis française.", dutch: "Ik ben Frans." },
  { french: "Je suis en cinquième.", dutch: "Ik zit in de brugklas." },
  { french: "Au revoir !", dutch: "Tot ziens!" },
] as const;

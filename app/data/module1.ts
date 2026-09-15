export type Category = "reading" | "listening" | "vocab" | "grammar" | "writing";

export type StepId =
  | "learn"
  | "reading"
  | "vocab-context"
  | "listening"
  | "vocab-practice"
  | "grammar"
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
    subtitle: "Chunks uit de tekst herkennen.",
  },
  {
    id: "listening",
    title: "Luisteren",
    shortTitle: "Luisteren",
    subtitle: "Manon stelt zich voor.",
  },
  {
    id: "vocab-practice",
    title: "Vocabulaire verder oefenen",
    shortTitle: "Oefenen",
    subtitle: "Korte, afwisselende oefeningen.",
  },
  {
    id: "grammar",
    title: "Grammatica",
    shortTitle: "Grammatica",
    subtitle: "Être, lidwoorden en il/elle/ils/elles.",
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
    subtitle: "Nazeggen, antwoorden en zelf vragen stellen.",
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

export const activeChunks = [
  ["Bonjour / Salut.", "Hallo / hoi."],
  ["Au revoir.", "Tot ziens."],
  ["Ça va ?", "Hoe gaat het?"],
  ["Je m'appelle...", "Ik heet..."],
  ["J'habite à...", "Ik woon in..."],
  ["Je suis en...", "Ik zit in..."],
  ["Et toi ?", "En jij?"],
  ["Il / Elle habite à...", "Hij / zij woont in..."],
];

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
      prompt: "Welke chunk past bij: Ik heet Lina?",
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
      prompt: "Vul de chunk aan: Tu habites ___ ?",
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
      id: "listen-1",
      category: "listening",
      kind: "single",
      prompt: "Wie hoor je?",
      options: ["een jongen", "een meisje", "twee personen"],
      answer: "een meisje",
      feedback: {
        correct: "Goed. Je hoort Manon.",
        wrong: "Luister nog eens naar de stem en de titel: Manon se présente.",
      },
    },
    {
      id: "listen-2",
      category: "listening",
      kind: "single",
      prompt: "Waar gaat het fragment vooral over?",
      options: ["een meisje dat iets over zichzelf vertelt", "eten", "vakantie"],
      answer: "een meisje dat iets over zichzelf vertelt",
      feedback: {
        correct: "Precies. Se présente betekent: stelt zich voor.",
        wrong: "Luister globaal: welke informatie geeft Manon over zichzelf?",
      },
    },
    {
      id: "listen-3",
      category: "listening",
      kind: "multi",
      prompt: "Welke soort informatie hoor je?",
      instruction: "Meerdere antwoorden kunnen kloppen.",
      options: ["leeftijd", "woonplaats", "familie", "favoriete kleding"],
      answer: ["leeftijd", "woonplaats", "familie"],
      feedback: {
        correct: "Goed. Je hoeft niet ieder woord te verstaan om de soorten informatie te herkennen.",
        wrong: "Luister nog eens. Manon zegt onder andere haar leeftijd, Paris en iets over familie.",
      },
    },
    {
      id: "listen-4",
      category: "listening",
      kind: "text",
      prompt: "Waar woont Manon?",
      answer: "paris",
      acceptable: ["paris", "a paris", "à paris", "in paris"],
      feedback: {
        correct: "Ja. Luister naar het stukje vlak voor Paris: J'habite à...",
        wrong: "Luister nog eens naar wat Manon vlak voor Paris zegt.",
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
      id: "gram-1",
      category: "grammar",
      kind: "fill",
      prompt: "Je ___ française.",
      answer: "suis",
      feedback: {
        correct: "Goed. Bij je hoort suis.",
        wrong: "Bij je gebruik je suis.",
      },
    },
    {
      id: "gram-2",
      category: "grammar",
      kind: "fill",
      prompt: "Tu ___ en cinquième.",
      answer: "es",
      feedback: {
        correct: "Ja. Bij tu hoort es.",
        wrong: "Bij tu gebruik je es.",
      },
    },
    {
      id: "gram-3",
      category: "grammar",
      kind: "fill",
      prompt: "Adam et Jules ___ français.",
      answer: "sont",
      feedback: {
        correct: "Klopt. Adam et Jules = ils, dus sont.",
        wrong: "Adam et Jules zijn samen ils. Welke vorm hoort bij ils?",
      },
    },
    {
      id: "gram-4",
      category: "grammar",
      kind: "single",
      prompt: "Kies het juiste lidwoord: ___ classe",
      options: ["la", "le", "l'"],
      answer: "la",
      feedback: {
        correct: "Ja: la classe.",
        wrong: "Leer het lidwoord samen met het woord: la classe.",
      },
    },
    {
      id: "gram-5",
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
      id: "gram-6",
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
  ],
};

export const checkpointQuestions: Question[] = [
  {
    id: "check-r1",
    category: "reading",
    kind: "single",
    prompt: "Nora schrijft: Salut, je m'appelle Nora. J'habite à Lyon. Waar woont Nora?",
    options: ["Lyon", "Lille", "Paris"],
    answer: "Lyon",
    feedback: {
      correct: "Goed. J'habite à Lyon geeft de woonplaats.",
      wrong: "Zoek naar J'habite à...",
    },
  },
  {
    id: "check-r2",
    category: "reading",
    kind: "single",
    prompt: "In de zin Voici Tom, un garçon néerlandais is Tom...",
    options: ["een Nederlandse jongen", "een Franse docent", "een stad"],
    answer: "een Nederlandse jongen",
    feedback: {
      correct: "Ja. Un garçon néerlandais.",
      wrong: "Un garçon betekent een jongen.",
    },
  },
  {
    id: "check-l1",
    category: "listening",
    kind: "single",
    prompt: "In het luisterfragment: welke naam hoor je?",
    options: ["Manon", "Lina", "Adam"],
    answer: "Manon",
    feedback: {
      correct: "Goed. De titel helpt ook: Manon se présente.",
      wrong: "Luister nog een keer naar het begin.",
    },
  },
  {
    id: "check-l2",
    category: "listening",
    kind: "single",
    prompt: "Welke stad hoor je bij Manon?",
    options: ["Paris", "Lille", "Amsterdam"],
    answer: "Paris",
    feedback: {
      correct: "Ja. Luister naar J'habite à Paris.",
      wrong: "Luister naar het woord vlak na J'habite à.",
    },
  },
  {
    id: "check-v1",
    category: "vocab",
    kind: "single",
    prompt: "Welke chunk hoort bij: En jij?",
    options: ["Et toi ?", "Voici ?", "Ça va bien ?"],
    answer: "Et toi ?",
    feedback: {
      correct: "Ja. Et toi ? is handig in gesprekjes.",
      wrong: "En jij? = Et toi ?",
    },
  },
  {
    id: "check-v2",
    category: "vocab",
    kind: "fill",
    prompt: "Vul aan: Comment tu t'___ ?",
    answer: "appelles",
    feedback: {
      correct: "Klopt. Comment tu t'appelles ?",
      wrong: "De hele chunk is: Comment tu t'appelles ?",
    },
  },
  {
    id: "check-g1",
    category: "grammar",
    kind: "fill",
    prompt: "Vous ___ en cinquième.",
    answer: "êtes",
    acceptable: ["etes", "êtes"],
    feedback: {
      correct: "Goed. Bij vous hoort êtes.",
      wrong: "Bij vous gebruik je êtes.",
    },
  },
  {
    id: "check-g2",
    category: "grammar",
    kind: "single",
    prompt: "Kies het juiste lidwoord: ___ école",
    options: ["l'", "la", "le"],
    answer: "l'",
    feedback: {
      correct: "Ja. Voor een klinker schrijf je l'école.",
      wrong: "Ecole begint met een klinker, dus gebruik je l'.",
    },
  },
  {
    id: "check-g3",
    category: "grammar",
    kind: "single",
    prompt: "Le garçon habite à Lille. ___ est néerlandais.",
    options: ["Il", "Elle", "Elles"],
    answer: "Il",
    feedback: {
      correct: "Ja. Le garçon wordt il.",
      wrong: "Le garçon vervang je door il.",
    },
  },
];

export const remediationQuestions: Record<Category, Question[]> = {
  reading: [
    {
      id: "rem-read",
      category: "reading",
      kind: "single",
      prompt: "Mehdi schrijft: Je suis en cinquième. Wat weet je?",
      options: ["Hij zit in de vijfde klas", "Hij woont in Frankrijk", "Hij neemt afscheid"],
      answer: "Hij zit in de vijfde klas",
      feedback: {
        correct: "Goed. Je suis en... geeft de klas.",
        wrong: "Let op de chunk Je suis en...",
      },
    },
  ],
  listening: [
    {
      id: "rem-listen",
      category: "listening",
      kind: "single",
      prompt: "Luister nog eens naar Manon. Welke chunk hoor je vlak voor Paris?",
      options: ["J'habite à", "Je m'appelle", "Au revoir"],
      answer: "J'habite à",
      feedback: {
        correct: "Ja. Dat is de woonplaats-chunk.",
        wrong: "Luister gericht naar het stukje vlak voor Paris.",
      },
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
  ],
};

export const writingQuestions: Question[] = [
  {
    id: "write-1",
    category: "writing",
    kind: "reorder",
    prompt: "Zet de zin goed.",
    options: ["Elle", "s'appelle", "Lina."],
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
    prompt: "Elle ______ à Lille.",
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
    prompt: "Elle ______ française.",
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
    kind: "single",
    prompt: "Profiel: Voici Noor. Elle habite à Rouen. Elle est néerlandaise. Waar woont Noor?",
    options: ["Rouen", "Lille", "Paris"],
    answer: "Rouen",
    feedback: {
      correct: "Goed. Je haalt de woonplaats uit de profieltekst.",
      wrong: "Zoek de zin met habite.",
    },
  },
  {
    id: "mod-l1",
    category: "listening",
    kind: "single",
    prompt: "Luister naar de voorbeeldstem bij Noor. Welke klas hoor je?",
    options: ["cinquième", "sixieme", "quatrieme"],
    answer: "cinquième",
    feedback: {
      correct: "Ja. Noor zegt: Je suis en cinquième.",
      wrong: "Luister naar de woorden na Je suis en...",
    },
  },
  {
    id: "mod-v1",
    category: "vocab",
    kind: "single",
    prompt: "Welke vraag past bij de woonplaats van Noor?",
    options: ["Tu habites où ?", "Comment tu t'appelles ?", "Ça va ?"],
    answer: "Tu habites où ?",
    feedback: {
      correct: "Goed. Dit is de vraag naar woonplaats.",
      wrong: "Voor woonplaats gebruik je habites.",
    },
  },
  {
    id: "mod-g1",
    category: "grammar",
    kind: "fill",
    prompt: "Noor ___ néerlandaise.",
    answer: "est",
    feedback: {
      correct: "Ja. Noor = elle, dus est.",
      wrong: "Noor kun je vervangen door elle.",
    },
  },
  {
    id: "mod-g2",
    category: "grammar",
    kind: "single",
    prompt: "Kies het juiste lidwoord: ___ ville",
    options: ["la", "le", "l'"],
    answer: "la",
    feedback: {
      correct: "Klopt. La ville.",
      wrong: "Leer dit als vaste combinatie: la ville.",
    },
  },
];

export const speechLines = [
  "Je suis française.",
  "Je m'appelle Lina.",
  "J'habite à Lille.",
  "Elle est française.",
  "Comment tu t'appelles ?",
  "Tu habites où ?",
];

export const speakingPrompts = [
  {
    cue: "Je wilt weten hoe ze heet.",
    answer: "Comment tu t'appelles ?",
  },
  {
    cue: "Je wilt weten waar ze woont.",
    answer: "Tu habites où ?",
  },
  {
    cue: "Je wilt weten in welke klas ze zit.",
    answer: "Tu es en quelle classe ?",
  },
];

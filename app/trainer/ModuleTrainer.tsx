"use client";

import Image from "next/image";
import {
  activeVocabulary,
  usefulSentences,
  checkpointQuestions,
  lessonQuestions,
  moduleCheckQuestions,
  moduleMeta,
  readingText,
  receptiveVocabulary,
  remediationQuestions,
  speechLines,
  steps,
  writingQuestions,
  type Category,
  type Question,
  type StepId,
} from "../data/module1";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Result = {
  category: Category;
  correct: boolean;
  firstTry: boolean;
};

type SavedProgress = {
  currentStepId: StepId;
  completed: StepId[];
  results: Record<string, Result>;
  checkpointNeeds: Category[];
  finalNeeds: Category[];
  listenCount: number;
  recordingDone: boolean;
  moduleCheckRecordingDone: boolean;
  writingDraft: string;
  moduleCheckDraft: string;
  selfIntroDone: boolean;
};

const categoryLabels: Record<Category, string> = {
  reading: "lezen",
  listening: "luisteren",
  vocab: "woorden en bruikbare zinnen",
  grammar: "grammatica",
  writing: "schrijven",
};

const defaultProgress: SavedProgress = {
  currentStepId: "learn",
  completed: [],
  results: {},
  checkpointNeeds: [],
  finalNeeds: [],
  listenCount: 0,
  recordingDone: false,
  moduleCheckRecordingDone: false,
  writingDraft: "",
  moduleCheckDraft: "",
  selfIntroDone: false,
};

const listeningVideoEmbed =
  "https://www.youtube.com/embed/1ob3A8KAGTw?rel=0&modestbranding=1&playsinline=1";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .replace(/[?.!,]/g, "")
    .replace(/\s+/g, " ");
}

function editDistance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, row) =>
    Array.from({ length: right.length + 1 }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
  }

  return rows[left.length][right.length];
}

function isCorrectAnswer(question: Question, value: string | string[]) {
  if (Array.isArray(question.answer)) {
    if (!Array.isArray(value)) return false;
    return (
      value.length === question.answer.length &&
      question.answer.every((item) => value.includes(item))
    );
  }

  if (Array.isArray(value)) return false;
  const possible = [question.answer, ...(question.acceptable ?? [])].map(normalize);
  return possible.includes(normalize(value));
}

function getNeeds(
  questions: Question[],
  results: Record<string, Result>,
  categories: Category[],
) {
  return categories.filter((category) => {
    const categoryQuestions = questions.filter((question) => question.category === category);
    if (!categoryQuestions.length) return false;
    const answered = categoryQuestions.map((question) => results[question.id]);
    const correct = answered.filter((result) => result?.correct).length;
    return correct < categoryQuestions.length;
  });
}

function scoreSummary(results: Record<string, Result>) {
  const totals: Record<Category, { correct: number; total: number }> = {
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    vocab: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
  };

  Object.values(results).forEach((result) => {
    totals[result.category].total += 1;
    if (result.correct) totals[result.category].correct += 1;
  });

  return totals;
}

export function ModuleTrainer() {
  const [progress, setProgress] = useState<SavedProgress>(defaultProgress);
  const [view, setView] = useState<"home" | "module">("home");
  const [hydrated, setHydrated] = useState(false);
  const [resetNotice, setResetNotice] = useState("");
  const [vocabularyOpen, setVocabularyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      const saved = window.localStorage.getItem(moduleMeta.localStorageKey);
      if (cancelled) return;

      if (saved) {
        try {
          setProgress({ ...defaultProgress, ...JSON.parse(saved) });
        } catch {
          setProgress(defaultProgress);
        }
      }

      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(moduleMeta.localStorageKey, JSON.stringify(progress));
  }, [hydrated, progress]);

  const visibleSteps = useMemo(() => {
    return steps.filter((step) => {
      if (step.id === "remediation") return progress.checkpointNeeds.length > 0;
      if (step.id === "final-practice") return progress.finalNeeds.length > 0;
      return true;
    });
  }, [progress.checkpointNeeds.length, progress.finalNeeds.length]);

  const currentStep =
    visibleSteps.find((step) => step.id === progress.currentStepId) ?? visibleSteps[0];
  const currentIndex = visibleSteps.findIndex((step) => step.id === currentStep.id);
  const completedCount = visibleSteps.filter((step) => progress.completed.includes(step.id)).length;
  const moduleOneComplete = progress.completed.includes("modulecheck");
  const finalPracticeComplete = progress.completed.includes("final-practice");
  const percentage = moduleOneComplete
    ? progress.finalNeeds.length > 0 && !finalPracticeComplete
      ? 92
      : 100
    : Math.round((completedCount / visibleSteps.length) * 100);
  const allStepsCompleted = visibleSteps
    .filter((step) => step.id !== "modulecheck" && step.id !== "final-practice")
    .every((step) => progress.completed.includes(step.id));
  const categoriesPractised = (["reading", "listening", "vocab", "grammar"] as Category[])
    .every((category) => Object.values(progress.results).some((result) => result.category === category));
  const moduleCheckUnlocked =
    allStepsCompleted ||
    (categoriesPractised && progress.writingDraft.trim().length > 0);
  const summary = scoreSummary(progress.results);
  if (progress.writingDraft.trim()) {
    summary.writing.correct += 1;
    summary.writing.total += 1;
  }
  const primaryActionLabel =
    currentStep.id === "listening" && progress.listenCount < 2
      ? "Rond de luisteroefening af"
      : currentStep.id === "final-practice" ||
    (currentStep.id === "modulecheck" && progress.completed.includes("modulecheck"))
      ? "Afronden"
      : "Verder";
  const canContinue = currentStep.id !== "listening" || progress.listenCount >= 2;

  function updateProgress(patch: Partial<SavedProgress>) {
    setProgress((current) => ({ ...current, ...patch }));
  }

  function recordResult(question: Question, correct: boolean, firstTry: boolean) {
    setProgress((current) => ({
      ...current,
      results: {
        ...current.results,
        [question.id]: { category: question.category, correct, firstTry },
      },
    }));
  }

  function goTo(stepId: StepId) {
    if (stepId === "checkpoint" || stepId === "modulecheck") setVocabularyOpen(false);
    setProgress((current) => ({ ...current, currentStepId: stepId }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (currentStep.id === "final-practice") {
      setProgress((current) => ({
        ...current,
        completed: current.completed.includes("final-practice")
          ? current.completed
          : [...current.completed, "final-practice"],
        finalNeeds: [],
      }));
      goHome();
      return;
    }

    if (currentStep.id === "modulecheck" && progress.completed.includes("modulecheck")) {
      goHome();
      return;
    }

    const checkpointNeeds =
      currentStep.id === "checkpoint"
        ? getNeeds(checkpointQuestions, progress.results, [
            "reading",
            "listening",
            "vocab",
            "grammar",
          ])
        : currentStep.id === "remediation"
          ? []
        : progress.checkpointNeeds;
    const finalNeeds =
      currentStep.id === "modulecheck"
        ? getNeeds(moduleCheckQuestions, progress.results, [
            "reading",
            "listening",
            "vocab",
            "grammar",
          ])
        : currentStep.id === "final-practice"
          ? []
        : progress.finalNeeds;

    const completed = progress.completed.includes(currentStep.id)
      ? progress.completed
      : [...progress.completed, currentStep.id];

    const nextVisibleSteps = steps.filter((step) => {
      if (step.id === "remediation") return checkpointNeeds.length > 0;
      if (step.id === "final-practice") return finalNeeds.length > 0;
      return true;
    });
    const currentMasterIndex = steps.findIndex((step) => step.id === currentStep.id);
    let nextStep =
      nextVisibleSteps.find(
        (step) => steps.findIndex((candidate) => candidate.id === step.id) > currentMasterIndex,
      ) ?? nextVisibleSteps[nextVisibleSteps.length - 1];

    if (nextStep.id === "modulecheck") {
      const firstIncomplete = nextVisibleSteps.find(
        (step) =>
          step.id !== "modulecheck" &&
          step.id !== "final-practice" &&
          !completed.includes(step.id),
      );
      if (firstIncomplete) nextStep = firstIncomplete;
    }

    if (nextStep.id === "checkpoint" || nextStep.id === "modulecheck") {
      setVocabularyOpen(false);
    }

    setProgress((current) => ({
      ...current,
      completed,
      checkpointNeeds,
      finalNeeds,
      currentStepId: nextStep.id,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevious() {
    const previous = visibleSteps[Math.max(currentIndex - 1, 0)];
    goTo(previous.id);
  }

  function resetProgress() {
    window.localStorage.removeItem(moduleMeta.localStorageKey);
    setProgress(defaultProgress);
    setResetNotice("Je voortgang is opnieuw gestart op dit apparaat.");
    window.setTimeout(() => setResetNotice(""), 2400);
  }

  if (!hydrated) {
    return <main className="home-shell" aria-label="Modules laden" />;
  }

  if (view === "home") {
    return (
      <ModuleHome
        percentage={percentage}
        hasStarted={progress.completed.length > 0 || progress.currentStepId !== "learn"}
        moduleOneComplete={moduleOneComplete}
        onOpen={() => setView("module")}
      />
    );
  }

  return (
    <>
    <main className="trainer-shell" data-testid="trainer-shell">
      <aside className="progress-rail" aria-label="Voortgang Module 1">
        <div>
          <button className="home-link" type="button" onClick={goHome}>
            <span className="home-link-icon" aria-hidden="true">←</span>
            <span>Naar moduleoverzicht</span>
          </button>
          <p className="module-kicker">{moduleMeta.subtitle}</p>
          <h1>{moduleMeta.title}</h1>
          <p className="rail-copy">
            Een rustige inhaalroute voor de basis die je nodig hebt in leerjaar 2.
          </p>
        </div>

        <div className="progress-meter" aria-label={`${percentage}% afgerond`}>
          <span style={{ width: `${percentage}%` }} />
        </div>

        <nav className="step-list" aria-label="Onderdelen">
          {visibleSteps.map((step, index) => {
            const isCurrent = step.id === currentStep.id;
            const isDone = progress.completed.includes(step.id);
            const canOpen = step.id !== "modulecheck" || moduleCheckUnlocked;
            return (
              <button
                key={step.id}
                className={isCurrent ? "active" : isDone ? "done" : ""}
                disabled={!canOpen}
                title={!canOpen ? "Rond eerst alle andere onderdelen af." : undefined}
                onClick={() => goTo(step.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.shortTitle}
              </button>
            );
          })}
        </nav>

        <div className="attention-box">
          <strong>Extra aandacht</strong>
          {progress.checkpointNeeds.length || progress.finalNeeds.length ? (
            <p>
              {[...new Set([...progress.checkpointNeeds, ...progress.finalNeeds])]
                .map((category) => categoryLabels[category])
                .join(", ")}
            </p>
          ) : (
            <p>Nog niets gemarkeerd.</p>
          )}
        </div>
      </aside>

      <section className="lesson-panel">
        <header className="lesson-header">
          <div>
            <p className="module-kicker">{currentStep.subtitle}</p>
            <h2>{currentStep.title}</h2>
          </div>
          <button className="quiet-button" type="button" onClick={resetProgress}>
            Opnieuw starten
          </button>
        </header>

        {resetNotice ? <p className="notice">{resetNotice}</p> : null}

        <StepContent
          stepId={currentStep.id}
          progress={progress}
          updateProgress={updateProgress}
          recordResult={recordResult}
          summary={summary}
        />

        <footer className="lesson-actions">
          <button type="button" onClick={goPrevious} disabled={currentIndex === 0}>
            Terug
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={goNext}
            disabled={!canContinue}
          >
            {primaryActionLabel}
          </button>
        </footer>
      </section>
    </main>
    {currentStep.id !== "checkpoint" && currentStep.id !== "modulecheck" ? (
      <VocabularyReference
        open={vocabularyOpen}
        onOpen={() => setVocabularyOpen(true)}
        onClose={() => setVocabularyOpen(false)}
      />
    ) : null}
    </>
  );
}

function VocabularyReference({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <>
      <button
        className="vocabulary-trigger"
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        aria-controls="vocabulary-panel"
      >
        Vocabulaire
      </button>
      {open ? (
        <div className="vocabulary-layer">
          <button
            className="vocabulary-backdrop"
            type="button"
            onClick={onClose}
            aria-label="Vocabulaire sluiten"
          />
          <aside
            className="vocabulary-panel"
            id="vocabulary-panel"
            aria-label="Vocabulaire van Module 1"
          >
            <header className="vocabulary-header">
              <div>
                <p className="module-kicker">Module 1</p>
                <h2>Vocabulaire</h2>
              </div>
              <button className="vocabulary-close" type="button" onClick={onClose} aria-label="Sluiten">
                ×
              </button>
            </header>

            <VocabularyTable
              title="Actieve woorden"
              description="Deze woorden moet je in beide richtingen kennen en zelf kunnen gebruiken."
              words={activeVocabulary}
            />
            <VocabularyTable
              title="Receptieve woorden"
              description="Deze woorden moet je begrijpen wanneer je ze leest of hoort."
              words={receptiveVocabulary}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function VocabularyTable({
  title,
  description,
  words,
}: {
  title: string;
  description: string;
  words: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <section className="vocabulary-section">
      <h3>{title}</h3>
      <p>{description}</p>
      <table>
        <thead>
          <tr><th scope="col">Frans</th><th scope="col">Nederlands</th></tr>
        </thead>
        <tbody>
          {words.map(([french, dutch]) => (
            <tr key={french}><td lang="fr">{french}</td><td>{dutch}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ModuleHome({
  percentage,
  hasStarted,
  moduleOneComplete,
  onOpen,
}: {
  percentage: number;
  hasStarted: boolean;
  moduleOneComplete: boolean;
  onOpen: () => void;
}) {
  return (
    <main className="home-shell">
      <header className="home-header">
        <p className="module-kicker">Moduleoverzicht</p>
        <h1>Inhaaltrainer Frans</h1>
        <p>Kies een module en werk in je eigen tempo. Je voortgang wordt op dit apparaat bewaard.</p>
      </header>

      <section className="module-grid" aria-label="Modules">
        <button className="module-card module-card-active" type="button" onClick={onOpen}>
          <span className="module-number">Module 1</span>
          <strong>Bonjour, je me présente</strong>
          <span className="module-description">Jezelf en anderen kort voorstellen.</span>
          <span className="module-progress" aria-label={`${percentage}% afgerond`}>
            <span style={{ width: `${percentage}%` }} />
          </span>
          <span className="module-action">
            {hasStarted ? `Verdergaan · ${percentage}%` : "Beginnen"}
          </span>
        </button>

        {[2, 3, 4].map((number) => (
          <article className="module-card module-card-upcoming" key={number}>
            <span className="module-number">Module {number}</span>
            <strong>Komt later</strong>
            <span className="module-description">
              {number === 2 && !moduleOneComplete
                ? "Rond eerst de modulecheck van Module 1 af om deze module vrij te spelen."
                : "Deze module wordt later aan het programma toegevoegd."}
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}

function StepContent({
  stepId,
  progress,
  updateProgress,
  recordResult,
  summary,
}: {
  stepId: StepId;
  progress: SavedProgress;
  updateProgress: (patch: Partial<SavedProgress>) => void;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
  summary: Record<Category, { correct: number; total: number }>;
}) {
  if (stepId === "learn") return <LearnIntro summary={summary} />;
  if (stepId === "reading") {
    return (
      <LessonBlock intro="Lis. Lees eerst voor de grote lijn. Je hoeft niet ieder Frans woord te begrijpen om een tekst te kunnen begrijpen.">
        <ReadingArticle />
        <QuestionSet
          questions={lessonQuestions.reading}
          results={progress.results}
          recordResult={recordResult}
        />
      </LessonBlock>
    );
  }
  if (stepId === "vocab-context") {
    return (
      <LessonBlock intro="Réponds. Je haalt bruikbare zinnen uit de tekst. Eerst herkennen, daarna pas zelf gebruiken.">
        <UsefulSentencesTable />
        <QuestionSet
          questions={lessonQuestions["vocab-context"]}
          results={progress.results}
          recordResult={recordResult}
        />
      </LessonBlock>
    );
  }
  if (stepId === "listening") {
    return (
      <ListeningStep
        progress={progress}
        updateProgress={updateProgress}
        recordResult={recordResult}
      />
    );
  }
  if (stepId === "vocab-practice") {
    return (
      <LessonBlock intro="Kies hoe je wilt oefenen. Je krijgt actieve en receptieve woorden in een steeds andere volgorde.">
        <VocabularyPractice recordResult={recordResult} />
      </LessonBlock>
    );
  }
  if (stepId === "grammar") {
    return (
      <GrammarStep
        block="etre"
        results={progress.results}
        recordResult={recordResult}
      />
    );
  }
  if (stepId === "articles") {
    return (
      <GrammarStep
        block="articles"
        results={progress.results}
        recordResult={recordResult}
      />
    );
  }
  if (stepId === "checkpoint") {
    const needs = getNeeds(checkpointQuestions, progress.results, [
      "reading",
      "listening",
      "vocab",
      "grammar",
    ]);
    return (
      <LessonBlock intro="Réponds. Dit is geen grote toets. We kijken per onderdeel wat al lukt.">
        <MiniAudio />
        <QuestionSet
          questions={checkpointQuestions}
          results={progress.results}
          recordResult={recordResult}
        />
        <AdaptiveResult needs={needs} kind="checkpoint" />
      </LessonBlock>
    );
  }
  if (stepId === "remediation") {
    return (
      <RemediationStep
        needs={progress.checkpointNeeds}
        results={progress.results}
        recordResult={recordResult}
      />
    );
  }
  if (stepId === "speaking") {
    return <SpeakingStep progress={progress} updateProgress={updateProgress} />;
  }
  if (stepId === "writing") {
    return (
      <WritingStep
        progress={progress}
        updateProgress={updateProgress}
        recordResult={recordResult}
      />
    );
  }
  if (stepId === "modulecheck") {
    const needs = getNeeds(moduleCheckQuestions, progress.results, [
      "reading",
      "listening",
      "vocab",
      "grammar",
    ]);
    return (
      <LessonBlock intro="Gebruik wat je hebt geleerd in een nieuwe situatie. De nadruk ligt op vocabulaire en grammatica.">
        <ProfileCard
          name="Noor Bernard"
          city="Nantes"
          nationality="française"
          classNameText="cinquième"
          school="collège Jules Verne"
          tone="green"
        />
        <QuestionSet
          questions={moduleCheckQuestions}
          results={progress.results}
          recordResult={recordResult}
        />
        <FreeWriting
          label="Schrijf drie of vier zinnen over Noor."
          value={progress.moduleCheckDraft}
          onChange={(moduleCheckDraft) => updateProgress({ moduleCheckDraft })}
        />
        <p className="speaking-cue">
          Stel jezelf kort voor en stel daarna een vraag aan Noor.
        </p>
        <Recorder
          title="Eindopdracht opnemen"
          instruction="Stel jezelf voor en stel daarna één Franse vraag aan Noor."
          checklist={["Ik noem mijn naam.", "Ik noem mijn woonplaats.", "Ik vertel mijn nationaliteit of klas.", "Ik stel Noor een Franse vraag."]}
          done={progress.moduleCheckRecordingDone}
          onDone={() => updateProgress({ moduleCheckRecordingDone: true })}
        />
        <AdaptiveResult needs={needs} kind="modulecheck" />
      </LessonBlock>
    );
  }
  return (
    <RemediationStep
      needs={progress.finalNeeds}
      results={progress.results}
      recordResult={recordResult}
      finalRound
    />
  );
}

function LearnIntro({
  summary,
}: {
  summary: Record<Category, { correct: number; total: number }>;
}) {
  return (
    <div className="intro-layout">
      <section className="route-copy">
        <p>
          Je begint met echte Franse input. Daarna ontdek je de belangrijkste
          woorden en zinnen, oefen je kort, en gebruik je de taal zelf.
        </p>
        <ol className="route-list">
          <li>input</li>
          <li>taal ontdekken</li>
          <li>oefenen</li>
          <li>checkpoint</li>
          <li>produceren</li>
          <li>modulecheck</li>
        </ol>
      </section>
      <section className="goals-panel" aria-label="Leerdoelen">
        <h3>Aan het einde kun je dit</h3>
        <ul>
          <li>iemand begroeten en afscheid nemen;</li>
          <li>naam, woonplaats, nationaliteit en klas begrijpen;</li>
          <li>zelf eenvoudige kennismakingsvragen stellen;</li>
          <li>etre, lidwoorden en il/elle/ils/elles gebruiken;</li>
          <li>kort spreken en enkele zinnen schrijven.</li>
        </ul>
      </section>
      <section className="score-strip" aria-label="Resultaten per onderdeel">
        {(Object.keys(categoryLabels) as Category[]).map((category) => (
          <div key={category}>
            <span>{categoryLabels[category]}</span>
            <strong>
              {summary[category].correct}/{summary[category].total}
            </strong>
          </div>
        ))}
      </section>
    </div>
  );
}

function LessonBlock({
  intro,
  children,
}: {
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="lesson-flow">
      <p className="instruction">{intro}</p>
      {children}
    </div>
  );
}

function ReadingArticle() {
  return (
    <article className="reading-spread">
      <div>
        <p className="french-label">Texte</p>
        <p>{readingText}</p>
      </div>
      <Image
        src="/lille-river.svg"
        alt="Illustratie van een Franse stad aan het water."
        width={420}
        height={300}
      />
    </article>
  );
}

function UsefulSentencesTable() {
  return (
    <div className="useful-sentences-grid">
      {usefulSentences.map(([fr, nl]) => (
        <div key={fr}>
          <strong>{fr}</strong>
          <span>{nl}</span>
        </div>
      ))}
    </div>
  );
}

type VocabularyMode = "flashcards" | "typing" | "multiple-choice";
type VocabularySet = "all" | "active" | "receptive";
type VocabularyItem = {
  french: string;
  dutch: string;
  active: boolean;
  direction: "fr-nl" | "nl-fr";
};

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function vocabularyAnswers(answer: string) {
  return answer
    .split(/\s*\/\s*|,\s*/)
    .map((part) => normalize(part.replace(/^de\s+|^het\s+|^een\s+/i, "")))
    .filter(Boolean);
}

function VocabularyPractice({
  recordResult,
}: {
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  const [mode, setMode] = useState<VocabularyMode>("flashcards");
  const [wordSet, setWordSet] = useState<VocabularySet>("all");
  const [session, setSession] = useState<VocabularyItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "revealed" | "">("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  function startSession(nextMode = mode, nextSet = wordSet) {
    const activeItems: VocabularyItem[] = activeVocabulary.map(([french, dutch]) => ({
      french,
      dutch,
      active: true,
      direction: Math.random() > 0.5 ? "fr-nl" : "nl-fr",
    }));
    const receptiveItems: VocabularyItem[] = receptiveVocabulary.map(([french, dutch]) => ({
      french,
      dutch,
      active: false,
      direction: "fr-nl",
    }));
    const pool = nextSet === "active" ? activeItems : nextSet === "receptive" ? receptiveItems : [...activeItems, ...receptiveItems];
    setMode(nextMode);
    setWordSet(nextSet);
    setSession(shuffled(pool).slice(0, 10));
    setCurrent(0);
    setRevealed(false);
    setAnswer("");
    setFeedback("");
    setAttempts(0);
    setScore(0);
  }

  const item = session[current];
  const expected = item ? (item.direction === "fr-nl" ? item.dutch : item.french) : "";
  const prompt = item ? (item.direction === "fr-nl" ? item.french : item.dutch) : "";

  const choices = useMemo(() => {
    if (!item || mode !== "multiple-choice") return [];
    const source = item.direction === "fr-nl"
      ? [...activeVocabulary, ...receptiveVocabulary].map((entry) => entry[1])
      : activeVocabulary.map((entry) => entry[0]);
    return shuffled([expected, ...shuffled(source.filter((value) => value !== expected)).slice(0, 3)]);
  }, [expected, item, mode]);

  function isVocabularyAnswerCorrect(value: string) {
    const entered = normalize(value);
    if (entered === normalize(expected)) return true;
    return vocabularyAnswers(expected).includes(entered.replace(/^de\s+|^het\s+|^een\s+/i, ""));
  }

  function checkAnswer(value = answer) {
    if (!item) return;
    const correct = isVocabularyAnswerCorrect(value);
    const firstTry = attempts === 0;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setFeedback(correct ? "correct" : nextAttempts >= 3 ? "revealed" : "wrong");
    if (correct) {
      if (firstTry) setScore((count) => count + 1);
      recordResult(
        {
          id: `vocab-drill-${item.active ? "active" : "receptive"}-${current}`,
          category: "vocab",
          kind: "text",
          prompt,
          answer: expected,
          feedback: { correct: "Goed.", wrong: "Probeer opnieuw." },
        },
        true,
        firstTry,
      );
    }
  }

  function nextWord() {
    setCurrent((index) => index + 1);
    setRevealed(false);
    setAnswer("");
    setFeedback("");
    setAttempts(0);
  }

  if (!session.length) {
    return (
      <section className="vocabulary-practice-setup" aria-labelledby="practice-title">
        <div>
          <p className="french-label">Woorden kiezen</p>
          <h3 id="practice-title">Welke woorden wil je oefenen?</h3>
          <div className="practice-choice-row">
            {([['all', 'Alles door elkaar'], ['active', 'Actieve woorden'], ['receptive', 'Receptieve woorden']] as const).map(([value, label]) => (
              <button className={wordSet === value ? "selected" : ""} type="button" key={value} onClick={() => setWordSet(value)}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="french-label">Oefenvorm</p>
          <h3>Hoe wil je oefenen?</h3>
          <div className="practice-mode-grid">
            <button type="button" onClick={() => startSession("flashcards", wordSet)}><strong>Flashcards</strong><span>Bekijk het antwoord en controleer jezelf.</span></button>
            <button type="button" onClick={() => startSession("typing", wordSet)}><strong>Typen</strong><span>Typ zelf de juiste vertaling.</span></button>
            <button type="button" onClick={() => startSession("multiple-choice", wordSet)}><strong>Meerkeuze</strong><span>Kies het juiste antwoord.</span></button>
          </div>
        </div>
      </section>
    );
  }

  if (current >= session.length) {
    return (
      <section className="practice-finish">
        <p className="french-label">Reeks afgerond</p>
        <h3>{score} van de {session.length} direct goed</h3>
        <p>Je kunt dezelfde oefenvorm herhalen met een nieuwe, gehusselde selectie.</p>
        <div className="practice-finish-actions">
          <button className="primary-button" type="button" onClick={() => startSession()}>Nieuwe reeks</button>
          <button type="button" onClick={() => setSession([])}>Andere oefenvorm kiezen</button>
        </div>
      </section>
    );
  }

  return (
    <section className="vocabulary-drill" aria-live="polite">
      <div className="practice-progress">
        <span>{item.active ? "Actief woord" : "Receptief woord"}</span>
        <strong>{current + 1} / {session.length}</strong>
      </div>
      <article className="practice-card">
        <p>{item.direction === "fr-nl" ? "Wat betekent dit?" : "Hoe zeg je dit in het Frans?"}</p>
        <h3 lang={item.direction === "fr-nl" ? "fr" : "nl"}>{prompt}</h3>

        {mode === "flashcards" ? (
          revealed ? (
            <div className="flashcard-answer"><span>Antwoord</span><strong>{expected}</strong></div>
          ) : <button className="primary-button" type="button" onClick={() => setRevealed(true)}>Toon antwoord</button>
        ) : null}

        {mode === "typing" ? (
          <label className="text-answer"><span>Jouw antwoord</span><input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key !== "Enter") return; if (feedback === "correct" || feedback === "revealed") nextWord(); else if (answer.trim()) checkAnswer(); }} /></label>
        ) : null}

        {mode === "multiple-choice" ? (
          <div className="practice-options">{choices.map((choice) => <button type="button" key={choice} disabled={feedback === "correct" || feedback === "revealed"} onClick={() => { setAnswer(choice); checkAnswer(choice); }}>{choice}</button>)}</div>
        ) : null}

        {feedback ? (
          <p className={`feedback ${feedback === "revealed" ? "answer-revealed" : feedback}`}>
            {feedback === "correct"
              ? "Goed!"
              : feedback === "revealed"
                ? <>Het goede antwoord is: <strong>{expected}</strong></>
                : attempts === 2
                  ? "Nog niet. Probeer het nog één keer."
                  : "Nog niet. Kijk nog eens goed naar het woord."}
          </p>
        ) : null}

        <div className="practice-controls">
          {mode === "flashcards" && revealed ? <><button type="button" onClick={() => { setScore((count) => count + 1); nextWord(); }}>Ik wist het</button><button type="button" onClick={nextWord}>Nog oefenen</button></> : null}
          {mode === "typing" && feedback !== "correct" && feedback !== "revealed" ? <button type="button" onClick={() => checkAnswer()} disabled={!answer.trim()}>Controleer</button> : null}
          {mode !== "flashcards" && (feedback === "correct" || feedback === "revealed") ? <button className="primary-button" type="button" onClick={nextWord}>Volgende woord</button> : null}
        </div>
      </article>
      <button className="quiet-button" type="button" onClick={() => setSession([])}>Oefenvorm wijzigen</button>
    </section>
  );
}

function ListeningStep({
  progress,
  updateProgress,
  recordResult,
}: {
  progress: SavedProgress;
  updateProgress: (patch: Partial<SavedProgress>) => void;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  const [round, setRound] = useState<1 | 2>(1);
  const [roundOneChecked, setRoundOneChecked] = useState(false);
  const [roundTwoQuestion, setRoundTwoQuestion] = useState(0);
  const [roundTwoAnswerCorrect, setRoundTwoAnswerCorrect] = useState(false);
  const roundOneQuestion = lessonQuestions.listening[0];
  const roundTwoQuestions = lessonQuestions.listening.slice(1);

  function startRoundTwo() {
    setRound(2);
    setRoundTwoQuestion(0);
    updateProgress({ listenCount: Math.max(progress.listenCount, 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <LessonBlock
      intro={
        round === 1
          ? "Bekijk en beluister het korte gesprek. Probeer alleen bekende Franse zinnen te herkennen."
          : "Luister nog een keer vanaf het begin. Beantwoord daarna steeds één vraag."
      }
    >
      <div className="listening-round-label">Luisterronde {round} van 2</div>
      <YouTubeListeningVideo key={`listening-round-${round}`} round={round} />

      {round === 1 ? (
        <>
          <QuestionCard
            question={roundOneQuestion}
            savedResult={progress.results[roundOneQuestion.id]}
            recordResult={recordResult}
            onAnswer={() => setRoundOneChecked(true)}
          />
          {roundOneChecked ? (
            <section className="heard-sentences" aria-label="Zinnen die te horen waren">
              <h3>Deze zinnen hoorde je</h3>
              <ul>
                <li>Bonjour !</li>
                <li>Je m&apos;appelle…</li>
                <li>J&apos;habite à…</li>
                <li>Au revoir !</li>
              </ul>
              <button type="button" className="primary-button" onClick={startRoundTwo}>
                Volgende vraag
              </button>
            </section>
          ) : null}
        </>
      ) : roundTwoQuestion === 0 ? (
        <ListeningNamesQuestion
          onCorrect={() => {
            setRoundTwoQuestion(1);
          }}
        />
      ) : roundTwoQuestion <= roundTwoQuestions.length ? (
        <div className="sequential-question">
          <QuestionCard
            key={roundTwoQuestions[roundTwoQuestion - 1].id}
            question={roundTwoQuestions[roundTwoQuestion - 1]}
            savedResult={progress.results[roundTwoQuestions[roundTwoQuestion - 1].id]}
            recordResult={recordResult}
            onAnswer={(correct) => {
              if (correct) setRoundTwoAnswerCorrect(true);
            }}
          />
          {roundTwoAnswerCorrect ? (
            <button
              type="button"
              className="primary-button inline-action"
              onClick={() => {
                setRoundTwoAnswerCorrect(false);
                setRoundTwoQuestion((current) => {
                  const next = current + 1;
                  if (next > roundTwoQuestions.length) {
                    updateProgress({ listenCount: 2 });
                  }
                  return next;
                });
              }}
            >
              Volgende vraag
            </button>
          ) : null}
        </div>
      ) : (
        <p className="good-note">Goed geluisterd. Je hebt beide luisterrondes afgerond.</p>
      )}
    </LessonBlock>
  );
}

function YouTubeListeningVideo({ round }: { round: 1 | 2 }) {
  const [started, setStarted] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  function reloadVideo() {
    setStarted(false);
    setPlayerKey((current) => current + 1);
  }

  return (
    <div className="video-player-block">
      <div className="video-embed">
        {started ? (
          <iframe
            key={playerKey}
            title={`Frans luistergesprek – ronde ${round}`}
            src={listeningVideoEmbed}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-poster"
            onClick={() => setStarted(true)}
            aria-label={`Video afspelen voor luisterronde ${round}`}
          >
            <span className="play-symbol" aria-hidden="true">▶</span>
            <strong>Video afspelen</strong>
          </button>
        )}
      </div>
      {started ? (
        <button type="button" className="quiet-button video-reload" onClick={reloadVideo}>
          Video opnieuw laden
        </button>
      ) : null}
    </div>
  );
}

function ListeningNamesQuestion({ onCorrect }: { onCorrect: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  function checkNames() {
    const entered = [normalize(firstName), normalize(secondName)];
    const correct = ["john", "lea"].every((name) =>
      entered.some((answer) => editDistance(answer, name) <= 1),
    );
    setFeedback(correct ? "correct" : "wrong");
  }

  return (
    <article className="question-card">
      <div className="question-head">
        <span>luisteren</span>
        <h3>Vraag 2 – Hoe heten de twee personen?</h3>
        <p>Typ alleen de twee namen.</p>
      </div>
      <div className="name-fields">
        <label className="text-answer">
          <span>Naam 1</span>
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label className="text-answer">
          <span>Naam 2</span>
          <input value={secondName} onChange={(event) => setSecondName(event.target.value)} />
        </label>
      </div>
      <div className="question-actions">
        <button type="button" onClick={checkNames} disabled={!firstName.trim() || !secondName.trim()}>
          Controleer
        </button>
      </div>
      {feedback ? (
        <p className={`feedback ${feedback}`}>
          {feedback === "correct"
            ? "Goed. Je hebt beide namen herkend."
            : "Luister nog eens goed naar het begin van het gesprek."}
        </p>
      ) : null}
      {feedback === "correct" ? (
        <button type="button" className="primary-button inline-action" onClick={onCorrect}>
          Volgende vraag
        </button>
      ) : null}
    </article>
  );
}

function MiniAudio() {
  return (
    <div className="mini-audio">
      <p>
        Gebruik voor de luistervragen hetzelfde gesprek van John en Léa. Je mag
        altijd teruggaan naar de luisteroefening om het fragment opnieuw af te spelen.
      </p>
    </div>
  );
}

function GrammarStep({
  block,
  results,
  recordResult,
}: {
  block: "etre" | "articles";
  results: Record<string, Result>;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  const etreQuestions = lessonQuestions.grammar.filter((question) =>
    question.id.startsWith("etre-"),
  );
  const articleQuestions = lessonQuestions.grammar.filter((question) =>
    question.id.startsWith("article-"),
  );
  const indefiniteArticleQuestions = lessonQuestions.grammar.filter((question) =>
    question.id.startsWith("indefinite-"),
  );
  const pronounQuestions = lessonQuestions.grammar.filter(
    (question) => question.id.startsWith("pronoun-"),
  );

  if (block === "etre") return (
    <LessonBlock intro="Lees eerst de uitleg. Daarna oefen je de vormen van être stap voor stap.">
      <section className="grammar-explanation" aria-labelledby="etre-title">
        <div className="grammar-explanation-copy">
          <p className="french-label">Grammaticablok 1</p>
          <h3 id="etre-title">Être betekent ‘zijn’</h3>
          <p>
            Je gebruikt <strong>être</strong> om te vertellen wie of wat iemand is.
            De vorm verandert bij het onderwerp van de zin. Daarom kijk je altijd eerst
            wie er vóór de lege plek staat.
          </p>
          <div className="example-sentences">
            <p><strong>Je suis française.</strong><span>Ik ben Frans.</span></p>
            <p><strong>Tu es en cinquième.</strong><span>Jij zit in de brugklas.</span></p>
            <p><strong>Elle est professeure.</strong><span>Zij is docente.</span></p>
            <p><strong>Ils sont néerlandais.</strong><span>Zij zijn Nederlands.</span></p>
          </div>
        </div>

        <div className="etre-table" aria-label="Vervoeging van être">
          <div><span>je</span><strong>suis</strong><small>ik ben</small></div>
          <div><span>tu</span><strong>es</strong><small>jij bent</small></div>
          <div><span>il / elle / on</span><strong>est</strong><small>hij / zij / men is</small></div>
          <div><span>nous</span><strong>sommes</strong><small>wij zijn</small></div>
          <div><span>vous</span><strong>êtes</strong><small>jullie / u bent</small></div>
          <div><span>ils / elles</span><strong>sont</strong><small>zij zijn</small></div>
        </div>

        <div className="pronoun-explanation">
          <h3>Een naam vervangen</h3>
          <p>
            Staat er een naam? Vervang die naam eerst in je hoofd door
            <strong> il</strong> of <strong>elle</strong>. Daarna kies je de vorm van être.
          </p>
          <p><strong>Lina → elle → Elle est française.</strong></p>
          <p><strong>Adam → il → Il est néerlandais.</strong></p>
          <p>
            Bij meerdere personen gebruik je <strong>ils</strong> of <strong>elles</strong>.
            Een gemengde groep wordt <strong>ils</strong>.
          </p>
        </div>
      </section>

      <section className="grammar-practice-heading">
        <p className="french-label">Oefenen</p>
        <h3>Vul steeds de juiste vorm van être in</h3>
        <p>Typ alleen het ontbrekende werkwoord.</p>
      </section>
      <QuestionSet
        questions={etreQuestions}
        results={results}
        recordResult={recordResult}
      />

      <details className="later-grammar-block">
        <summary>Korte herhaling: personen vervangen</summary>
        <QuestionSet
          questions={pronounQuestions}
          results={results}
          recordResult={recordResult}
        />
      </details>
    </LessonBlock>
  );

  return (
    <LessonBlock intro="Lees eerst de uitleg. Daarna oefen je de bepaalde en onbepaalde lidwoorden apart.">
      <section className="grammar-explanation article-explanation" aria-labelledby="articles-title">
        <div className="grammar-explanation-copy">
          <p className="french-label">Grammaticablok 2</p>
          <h3 id="articles-title">Le, la, l’ en les</h3>
          <p>
            <strong>Le, la, l’ en les</strong> betekenen in het Nederlands allemaal
            <strong> de</strong> of <strong>het</strong>. Le betekent dus niet altijd
            “de” en la niet altijd “het”: de keuze hangt af van het Franse woord.
          </p>
          <p>
            In het Frans staat vaak een lidwoord vóór een zelfstandig naamwoord.
            Leer daarom een nieuw woord altijd samen met het lidwoord: niet alleen
            <em> classe</em>, maar <strong>la classe</strong>.
          </p>
          <div className="example-sentences">
            <p><strong>Le collège</strong><span>de school / het collège</span></p>
            <p><strong>La classe</strong><span>de klas</span></p>
            <p><strong>L’école</strong><span>de school</span></p>
            <p><strong>Les élèves</strong><span>de leerlingen</span></p>
            <p><strong>Le collège est à Lille.</strong><span>De school staat in Lille.</span></p>
            <p><strong>La classe est grande.</strong><span>De klas is groot.</span></p>
            <p><strong>L’école s’appelle Victor Hugo.</strong><span>De school heet Victor Hugo.</span></p>
            <p><strong>Les élèves sont en classe.</strong><span>De leerlingen zijn in de klas.</span></p>
          </div>
        </div>

        <div className="article-rules" aria-label="Regels voor Franse lidwoorden">
          <div><strong>le</strong><span>mannelijk enkelvoud</span><small>le collège</small></div>
          <div><strong>la</strong><span>vrouwelijk enkelvoud</span><small>la classe</small></div>
          <div><strong>l’</strong><span>voor een klinker</span><small>l’école, l’ami</small></div>
          <div><strong>les</strong><span>alle meervoudsvormen</span><small>les élèves</small></div>
        </div>

        <div className="plural-explanation">
          <h3>Van enkelvoud naar meervoud</h3>
          <p>
            In het meervoud worden <strong>le</strong>, <strong>la</strong> en
            <strong> l’</strong> allemaal <strong>les</strong>.
          </p>
          <p><strong>le garçon → les garçons</strong></p>
          <p><strong>la fille → les filles</strong></p>
          <p><strong>l’élève → les élèves</strong></p>
        </div>
      </section>

      <section className="grammar-practice-heading">
        <p className="french-label">Oefenen</p>
        <h3>Vul le, la, l’ of les in</h3>
        <p>Lees de hele zin en typ alleen het ontbrekende lidwoord.</p>
      </section>
      <QuestionSet
        questions={articleQuestions}
        results={results}
        recordResult={recordResult}
      />

      <section className="grammar-explanation article-explanation" aria-labelledby="indefinite-articles-title">
        <div className="grammar-explanation-copy">
          <p className="french-label">Onbepaalde lidwoorden</p>
          <h3 id="indefinite-articles-title">Un, une en des</h3>
          <p>
            <strong>Un</strong> en <strong>une</strong> betekenen allebei <strong>een</strong>.
            Voor een mannelijk woord gebruik je <strong>un</strong>; voor een vrouwelijk
            woord <strong>une</strong>. <strong>Des</strong> gebruik je bij meerdere personen
            of dingen en betekent bijvoorbeeld “enkele” of “een paar”.
          </p>
          <div className="example-sentences">
            <p><strong>Un garçon</strong><span>een jongen</span></p>
            <p><strong>Une fille</strong><span>een meisje</span></p>
            <p><strong>Des élèves</strong><span>leerlingen / enkele leerlingen</span></p>
            <p><strong>Adam est un garçon néerlandais.</strong><span>Adam is een Nederlandse jongen.</span></p>
            <p><strong>Lina est une fille française.</strong><span>Lina is een Frans meisje.</span></p>
          </div>
        </div>
        <div className="article-rules" aria-label="Regels voor onbepaalde Franse lidwoorden">
          <div><strong>un</strong><span>mannelijk enkelvoud</span><small>un collège</small></div>
          <div><strong>une</strong><span>vrouwelijk enkelvoud</span><small>une classe</small></div>
          <div><strong>des</strong><span>meervoud</span><small>des élèves</small></div>
        </div>
      </section>

      <section className="grammar-practice-heading">
        <p className="french-label">Oefenen</p>
        <h3>Vul un, une of des in</h3>
        <p>Lees de Nederlandse vertaling en typ alleen het ontbrekende lidwoord.</p>
      </section>
      <QuestionSet
        questions={indefiniteArticleQuestions}
        results={results}
        recordResult={recordResult}
      />
    </LessonBlock>
  );
}

function AdaptiveResult({
  needs,
  kind,
}: {
  needs: Category[];
  kind: "checkpoint" | "modulecheck";
}) {
  if (!needs.length) {
    return (
      <div className="adaptive-result good">
        <strong>Dit gaat goed.</strong>
        <p>
          Je kunt verder. Extra oefening wordt nu overgeslagen, maar je mag
          altijd teruggaan als je iets wilt herhalen.
        </p>
      </div>
    );
  }

  return (
    <div className="adaptive-result">
      <strong>
        {kind === "checkpoint" ? "Nog even richten op:" : "Voor afronding nog oefenen:"}
      </strong>
      <p>{needs.map((category) => categoryLabels[category]).join(", ")}</p>
    </div>
  );
}

function RemediationStep({
  needs,
  results,
  recordResult,
  finalRound = false,
}: {
  needs: Category[];
  results: Record<string, Result>;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
  finalRound?: boolean;
}) {
  const questions = needs.flatMap((category) => remediationQuestions[category] ?? []);

  if (!questions.length) {
    return (
      <div className="adaptive-result good">
        <strong>Geen verplichte extra oefening.</strong>
        <p>Je kunt verder met de volgende stap.</p>
      </div>
    );
  }

  const done = questions.every((question) => results[question.id]?.correct);

  return (
    <LessonBlock
      intro={
        finalRound
          ? "Maak alleen deze gerichte checkvragen. Daarna is Module 1 klaar."
          : "Je herhaalt alleen het onderdeel dat nog aandacht nodig heeft."
      }
    >
      <div className="adaptive-result">
        <strong>Dit ga je nog oefenen</strong>
        <p>{needs.map((category) => categoryLabels[category]).join(", ")}</p>
      </div>
      {needs.includes("listening") ? <YouTubeListeningVideo round={1} /> : null}
      <QuestionSet questions={questions} results={results} recordResult={recordResult} />
      {done ? <p className="good-note">Deze extra check is goed. Je kunt verder.</p> : null}
    </LessonBlock>
  );
}

function SpeakingStep({
  progress,
  updateProgress,
}: {
  progress: SavedProgress;
  updateProgress: (patch: Partial<SavedProgress>) => void;
}) {
  return (
    <LessonBlock intro="Écoute et répète. Speel een zin af, zeg hem na en neem daarna je eigen korte voorstelling op.">
      <section className="speech-lines" aria-label="Nazegzinnen">
        {speechLines.map((line) => (
          <div key={line.french}>
            <span><strong lang="fr">{line.french}</strong><small>{line.dutch}</small></span>
            <VoiceButton text={line.french} />
          </div>
        ))}
      </section>

      <Recorder
        title="Korte zelfstandige productie"
        instruction="Stel jezelf kort voor met je naam, woonplaats, nationaliteit en klas."
        checklist={["Ik noem mijn naam.", "Ik noem mijn woonplaats.", "Ik noem mijn nationaliteit.", "Ik vertel in welke klas ik zit."]}
        done={progress.recordingDone}
        onDone={() => updateProgress({ recordingDone: true, selfIntroDone: true })}
      />
    </LessonBlock>
  );
}

function VoiceButton({ text }: { text: string }) {
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    const frenchVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith("fr"));
    utterance.voice = frenchVoices.find((voice) =>
      /amelie|amélie|audrey|thomas|premium|enhanced|natural/i.test(voice.name),
    ) ?? frenchVoices[0] ?? null;
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button type="button" className="listen-button" onClick={speak}>
      Luister
    </button>
  );
}

function Recorder({
  title,
  instruction,
  checklist,
  done,
  onDone,
}: {
  title: string;
  instruction: string;
  checklist: readonly string[];
  done: boolean;
  onDone: () => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingPartsRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState("Nog geen opname.");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkResult, setCheckResult] = useState("");

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Opnemen werkt niet in deze browser. Je kunt wel hardop oefenen.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingPartsRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => recordingPartsRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(recordingPartsRef.current, { type: "audio/webm" });
        setRecordingUrl(URL.createObjectURL(blob));
        setStatus("Opname staat klaar om terug te luisteren.");
        stream.getTracks().forEach((track) => track.stop());
        onDone();
      };
      recorder.start();
      setIsRecording(true);
      setStatus(`Opname loopt. ${instruction}`);
    } catch {
      setStatus("Microfoon niet beschikbaar of geen toestemming gegeven.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <section className="recorder-box" aria-label="Lokale opname">
      <h3>{title}</h3>
      <p>{instruction}</p>
      <div className="recorder-actions">
        <button type="button" onClick={startRecording} disabled={isRecording}>
          Opnemen
        </button>
        <button type="button" onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
      </div>
      <p className={done ? "good-note" : "small-note"}>{status}</p>
      {recordingUrl ? <audio controls src={recordingUrl} /> : null}
      {recordingUrl ? (
        <div className="recording-checklist">
          <h3>Controleer je opname</h3>
          {checklist.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={checkedItems.includes(item)}
                onChange={() => setCheckedItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}
              />
              <span>{item}</span>
            </label>
          ))}
          <button type="button" onClick={() => setCheckResult(checkedItems.length === checklist.length ? "Compleet. Alles zit in je opname." : `Nog ${checklist.length - checkedItems.length} onderdeel(en) toevoegen.`)}>
            Controleer mijn opname
          </button>
          {checkResult ? <p className={checkedItems.length === checklist.length ? "good-note" : "small-note"}>{checkResult}</p> : null}
        </div>
      ) : null}
      <p className="small-note">De opname blijft lokaal in deze browser en wordt nergens geüpload.</p>
    </section>
  );
}

function WritingStep({
  progress,
  updateProgress,
  recordResult,
}: {
  progress: SavedProgress;
  updateProgress: (patch: Partial<SavedProgress>) => void;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  return (
    <LessonBlock intro="Écris. Je schrijft nu bewust over iemand anders. Daardoor gebruik je elle en est.">
      <ProfileCard
        name="Lina Martin"
        city="Lille"
        nationality="Franse nationaliteit"
        classNameText="brugklas"
        school="Victor Hugo"
      />
      <QuestionSet
        questions={writingQuestions}
        results={progress.results}
        recordResult={recordResult}
      />
      <FreeWriting
        label="Schrijf vier of vijf zinnen over Lina."
        value={progress.writingDraft}
        onChange={(writingDraft) => updateProgress({ writingDraft })}
      />
    </LessonBlock>
  );
}

function ProfileCard({
  name,
  city,
  nationality,
  classNameText,
  school,
  tone = "blue",
}: {
  name: string;
  city: string;
  nationality: string;
  classNameText: string;
  school: string;
  tone?: "blue" | "green";
}) {
  return (
    <article className={`profile-card ${tone}`}>
      <div className="avatar" aria-hidden="true">
        {name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </div>
      <div>
        <h3>{name}</h3>
        <dl>
          <div>
            <dt>woonplaats</dt>
            <dd>{city}</dd>
          </div>
          <div>
            <dt>nationaliteit</dt>
            <dd>{nationality}</dd>
          </div>
          <div>
            <dt>klas</dt>
            <dd>{classNameText}</dd>
          </div>
          <div>
            <dt>school</dt>
            <dd>{school}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function FreeWriting({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="writing-box">
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        placeholder="Schrijf hier je tekst."
      />
    </label>
  );
}

function QuestionSet({
  questions,
  results,
  recordResult,
}: {
  questions: Question[];
  results: Record<string, Result>;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  return (
    <div className="question-set">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          savedResult={results[question.id]}
          recordResult={recordResult}
        />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  savedResult,
  recordResult,
  onAnswer,
}: {
  question: Question;
  savedResult?: Result;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
  onAnswer?: (correct: boolean) => void;
}) {
  const [choice, setChoice] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [order, setOrder] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(savedResult ?? null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  function toggleOption(option: string) {
    if (question.kind === "single") {
      setChoice([option]);
      return;
    }
    setChoice((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function addToOrder(option: string) {
    setOrder((current) => (current.includes(option) ? current : [...current, option]));
  }

  function check() {
    const answerValue =
      question.kind === "single" || question.kind === "multi"
        ? choice
        : question.kind === "reorder"
          ? order.join(" ")
          : text;
    const correct = isCorrectAnswer(
      question,
      question.kind === "single" ? choice[0] ?? "" : answerValue,
    );
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setFeedback({ category: question.category, correct, firstTry: nextAttempts === 1 });
    if (!correct && nextAttempts >= 3) setAnswerRevealed(true);
    recordResult(question, correct, nextAttempts === 1);
    onAnswer?.(correct);
    if (correct) {
      window.setTimeout(() => {
        const nextCard = cardRef.current?.nextElementSibling as HTMLElement | null;
        if (!nextCard?.classList.contains("question-card")) return;
        nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          nextCard.querySelector<HTMLElement>("input, button")?.focus();
        }, 350);
      }, 650);
    }
  }

  const hasAnswer =
    question.kind === "single" || question.kind === "multi"
      ? choice.length > 0
      : question.kind === "reorder"
        ? order.length > 0
        : text.trim().length > 0;

  return (
    <article ref={cardRef} className="question-card" data-testid={`question-${question.id}`}>
      <div className="question-head">
        <span>{categoryLabels[question.category]}</span>
        <h3>{question.prompt}</h3>
        {question.instruction ? <p>{question.instruction}</p> : null}
      </div>

      {question.kind === "single" || question.kind === "multi" ? (
        <fieldset className="option-list">
          <legend className="sr-only">{question.prompt}</legend>
          {question.options?.map((option) => (
            <label key={option}>
              <input
                type={question.kind === "single" ? "radio" : "checkbox"}
                name={question.id}
                checked={choice.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {question.kind === "fill" || question.kind === "text" ? (
        <label className="text-answer">
          <span>Antwoord</span>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && text.trim() && !answerRevealed) check();
            }}
            autoComplete="off"
          />
        </label>
      ) : null}

      {question.kind === "reorder" ? (
        <div className="reorder-box">
          <div className="chip-row" aria-label="Woorden">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => addToOrder(option)}
                disabled={order.includes(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="answer-line" aria-label="Jouw zin">
            {order.length ? order.join(" ") : "Klik de woorden in de juiste volgorde."}
          </div>
          <button type="button" className="quiet-button" onClick={() => setOrder([])}>
            Wis zin
          </button>
        </div>
      ) : null}

      <div className="question-actions">
        <button type="button" onClick={check} disabled={!hasAnswer || answerRevealed} data-testid={`check-${question.id}`}>
          Controleer
        </button>
      </div>

      {feedback ? (
        <p className={feedback.correct ? "feedback correct" : "feedback wrong"}>
          {feedback.correct ? question.feedback.correct : question.feedback.wrong}
        </p>
      ) : null}
      {answerRevealed ? (
        <p className="feedback answer-revealed">
          Het goede antwoord is: <strong>{Array.isArray(question.answer) ? question.answer.join(", ") : question.answer}</strong>
        </p>
      ) : null}
    </article>
  );
}

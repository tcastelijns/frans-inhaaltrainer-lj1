"use client";

import Image from "next/image";
import {
  activeChunks,
  checkpointQuestions,
  lessonQuestions,
  moduleCheckQuestions,
  moduleMeta,
  readingText,
  remediationQuestions,
  speechLines,
  speakingPrompts,
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
  writingDraft: string;
  selfIntroDone: boolean;
};

const categoryLabels: Record<Category, string> = {
  reading: "lezen",
  listening: "luisteren",
  vocab: "vocabulaire/chunks",
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
  writingDraft: "",
  selfIntroDone: false,
};

const audioLinguaUrl = "https://audio-lingua.ac-versailles.fr/spip.php?article8625";
const audioLinguaEmbed =
  "https://audio-lingua.ac-versailles.fr/spip.php?page=mp3&id_article=8625&color=00aaea&legende=oui";

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
  const [hydrated, setHydrated] = useState(false);
  const [resetNotice, setResetNotice] = useState("");

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
  const percentage = Math.round((completedCount / visibleSteps.length) * 100);
  const summary = scoreSummary(progress.results);
  const primaryActionLabel =
    currentStep.id === "final-practice" ||
    (currentStep.id === "modulecheck" && progress.completed.includes("modulecheck"))
      ? "Afronden"
      : "Verder";

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
    setProgress((current) => ({ ...current, currentStepId: stepId }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
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
    const nextStep =
      nextVisibleSteps.find(
        (step) => steps.findIndex((candidate) => candidate.id === step.id) > currentMasterIndex,
      ) ?? nextVisibleSteps[nextVisibleSteps.length - 1];

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

  return (
    <main className="trainer-shell" data-testid="trainer-shell">
      <aside className="progress-rail" aria-label="Voortgang Module 1">
        <div>
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
            const canOpen = isDone || index <= currentIndex || index <= completedCount + 1;
            return (
              <button
                key={step.id}
                className={isCurrent ? "active" : isDone ? "done" : ""}
                disabled={!canOpen}
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
          <button type="button" className="primary-button" onClick={goNext}>
            {primaryActionLabel}
          </button>
        </footer>
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
      <LessonBlock intro="Réponds. Je haalt bruikbare chunks uit de tekst. Eerst herkennen, daarna pas zelf gebruiken.">
        <ChunkTable />
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
    const allCorrect = lessonQuestions["vocab-practice"].every(
      (question) => progress.results[question.id]?.correct,
    );
    return (
      <LessonBlock intro="Complète. Korte oefeningen met de belangrijkste zinnen uit kennismakingsgesprekken.">
        {allCorrect ? (
          <p className="good-note">
            Dit gaat goed. De vervolgtraining is optioneel; je mag ook door naar grammatica.
          </p>
        ) : null}
        <QuestionSet
          questions={lessonQuestions["vocab-practice"]}
          results={progress.results}
          recordResult={recordResult}
        />
      </LessonBlock>
    );
  }
  if (stepId === "grammar") {
    return (
      <GrammarStep
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
      <LessonBlock intro="Lees en luister naar Noor. Daarna gebruik je dezelfde taal zelf.">
        <ProfileCard
          name="Noor Jansen"
          city="Rouen"
          nationality="néerlandaise"
          classNameText="cinquième"
          school="collège Gustave Flaubert"
          tone="green"
        />
        <VoiceButton text="Bonjour. Je m'appelle Noor. J'habite à Rouen. Je suis néerlandaise et je suis en cinquième." />
        <QuestionSet
          questions={moduleCheckQuestions}
          results={progress.results}
          recordResult={recordResult}
        />
        <FreeWriting
          label="Schrijf drie of vier zinnen over Noor."
          value={progress.writingDraft}
          onChange={(writingDraft) => updateProgress({ writingDraft })}
        />
        <p className="speaking-cue">
          Stel jezelf kort voor en formuleer daarna een vraag voor Noor.
        </p>
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

function ChunkTable() {
  return (
    <div className="chunk-grid">
      {activeChunks.map(([fr, nl]) => (
        <div key={fr}>
          <strong>{fr}</strong>
          <span>{nl}</span>
        </div>
      ))}
    </div>
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
  return (
    <LessonBlock intro="Écoute. Luister minimaal twee keer. De eerste keer luister je globaal, daarna voor details.">
      <div className="audio-box">
        <iframe
          title="Audio-Lingua - Manon se présente"
          src={audioLinguaEmbed}
          loading="lazy"
        />
        <div>
          <p>
            Werkt de speler niet goed? Open dan de Audio-Lingua-pagina in een
            nieuw tabblad en kom daarna terug naar deze trainer.
          </p>
          <a href={audioLinguaUrl} target="_blank" rel="noreferrer">
            Open Audio-Lingua
          </a>
          <button
            type="button"
            onClick={() => updateProgress({ listenCount: progress.listenCount + 1 })}
          >
            Ik heb geluisterd
          </button>
          <span className="listen-count">
            {progress.listenCount >= 2
              ? "Twee luisterbeurten genoteerd."
              : `${progress.listenCount}/2 luisterbeurten`}
          </span>
        </div>
      </div>
      <QuestionSet
        questions={lessonQuestions.listening}
        results={progress.results}
        recordResult={recordResult}
      />
    </LessonBlock>
  );
}

function MiniAudio() {
  return (
    <div className="mini-audio">
      <p>
        Gebruik voor de luistervragen hetzelfde fragment van Manon. Je mag het
        opnieuw openen of de speler hierboven gebruiken.
      </p>
      <a href={audioLinguaUrl} target="_blank" rel="noreferrer">
        Manon se présente
      </a>
    </div>
  );
}

function GrammarStep({
  results,
  recordResult,
}: {
  results: Record<string, Result>;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  return (
    <LessonBlock intro="Complète. Je ziet steeds eerst een kleine uitleg, dan pas een oefening.">
      <section className="grammar-notes">
        <div>
          <h3>Être = zijn</h3>
          <p>Je leert de vorm bij het onderwerp.</p>
          <ul>
            <li>je suis</li>
            <li>tu es</li>
            <li>il / elle / on est</li>
            <li>nous sommes</li>
            <li>vous êtes</li>
            <li>ils / elles sont</li>
          </ul>
        </div>
        <div>
          <h3>Lidwoorden</h3>
          <p>Leer het lidwoord samen met het woord.</p>
          <ul>
            <li>le collège</li>
            <li>la classe</li>
            <li>la ville</li>
            <li>{"l'école"}</li>
            <li>un garçon / une fille</li>
          </ul>
        </div>
        <div>
          <h3>Il, elle, ils, elles</h3>
          <p>Je vervangt personen door een kort woord.</p>
          <ul>
            <li>le garçon {"->"} il</li>
            <li>la fille {"->"} elle</li>
            <li>les filles {"->"} elles</li>
            <li>gemengde groep {"->"} ils</li>
          </ul>
        </div>
      </section>
      <QuestionSet
        questions={lessonQuestions.grammar}
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
    <LessonBlock intro="Écoute et répète. Speel een zin af, zeg hem na, en bouw daarna zelf een klein gesprekje.">
      <section className="speech-lines" aria-label="Nazegzinnen">
        {speechLines.map((line) => (
          <div key={line}>
            <span>{line}</span>
            <VoiceButton text={line} />
          </div>
        ))}
      </section>

      <section className="speaking-steps">
        <h3>Vragen beantwoorden</h3>
        <p>
          Hoor je: {"Comment tu t'appelles ?"} Antwoord hardop: {"Je m'________."}
        </p>
        <p>Daarna oefen je: Tu habites où ? Je suis en quelle classe ? Tu es néerlandais(e) ?</p>
      </section>

      <section className="prompt-grid" aria-label="Zelf vragen stellen">
        {speakingPrompts.map((prompt) => (
          <details key={prompt.cue}>
            <summary>{prompt.cue}</summary>
            <p>{prompt.answer}</p>
          </details>
        ))}
      </section>

      <Recorder
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
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button type="button" className="listen-button" onClick={speak}>
      Luister
    </button>
  );
}

function Recorder({
  done,
  onDone,
}: {
  done: boolean;
  onDone: () => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState("Nog geen opname.");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Opnemen werkt niet in deze browser. Je kunt wel hardop oefenen.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingUrl(URL.createObjectURL(blob));
        setStatus("Opname staat klaar om terug te luisteren.");
        stream.getTracks().forEach((track) => track.stop());
        onDone();
      };
      recorder.start();
      setIsRecording(true);
      setStatus("Opname loopt. Stel jezelf kort voor en stel een vraag.");
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
      <h3>Korte zelfstandige productie</h3>
      <p>Gebruik: naam, woonplaats, nationaliteit en klas. Stel daarna een of twee vragen.</p>
      <div className="prompt-tags" aria-label="Prompts">
        <span>naam</span>
        <span>woonplaats</span>
        <span>nationaliteit</span>
        <span>klas</span>
      </div>
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
        nationality="française"
        classNameText="cinquième"
        school="collège Victor Hugo"
      />
      <QuestionSet
        questions={writingQuestions}
        results={progress.results}
        recordResult={recordResult}
      />
      <FreeWriting
        label="Schrijf vier of vijf zinnen over Lina."
        helper="Bijvoorbeeld: Voici Lina. Elle s'appelle Lina Martin. Elle habite à Lille."
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
        placeholder="Voici..."
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
}: {
  question: Question;
  savedResult?: Result;
  recordResult: (question: Question, correct: boolean, firstTry: boolean) => void;
}) {
  const [choice, setChoice] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [order, setOrder] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(savedResult ?? null);

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
    recordResult(question, correct, nextAttempts === 1);
  }

  const hasAnswer =
    question.kind === "single" || question.kind === "multi"
      ? choice.length > 0
      : question.kind === "reorder"
        ? order.length > 0
        : text.trim().length > 0;

  return (
    <article className="question-card" data-testid={`question-${question.id}`}>
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
        <button type="button" onClick={check} disabled={!hasAnswer} data-testid={`check-${question.id}`}>
          Controleer
        </button>
      </div>

      {feedback ? (
        <p className={feedback.correct ? "feedback correct" : "feedback wrong"}>
          {feedback.correct ? question.feedback.correct : question.feedback.wrong}
        </p>
      ) : null}
    </article>
  );
}

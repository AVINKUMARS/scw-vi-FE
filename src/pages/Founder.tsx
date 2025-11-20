// pages/Founder.tsx

import React from 'react'
import {
  FOUNDER_SECTIONS,
  OPTION_WEIGHT,
  TOTAL_QUESTIONS,
  computeReversedScore,
  type OptionKey,
  SECTION_A_KEYWORDS,
  computeSectionAScore,
} from '../data/founderAssessment'
import Button from '../components/Button'

type Answers = Record<number, OptionKey>

const LS_KEY = 'founderAssessmentV1'
const LS_KEY_SECTION_A = 'founderAssessmentSectionA_v1'
const TOTAL_SECTION_A_ITEMS = 8

// A – Simple band
function getFounderBand(score: number | null) {
  if (score == null || !isFinite(score)) {
    return {
      label: 'No score yet',
      desc: 'Complete more questions to see your founder assessment.',
      color: 'text-neutral-500',
      pill: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    }
  }
  if (score < 40) {
    return {
      label: 'Critical',
      desc: 'Your current founder habits are putting the business at risk. Start with the biggest constraint.',
      color: 'text-red-600',
      pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }
  }
  if (score < 60) {
    return {
      label: 'Needs Improvement',
      desc: 'You have some strengths, but important gaps in judgment, discipline or leadership.',
      color: 'text-orange-600',
      pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    }
  }
  if (score < 80) {
    return {
      label: 'Good',
      desc: 'You’re doing many things right. A few deliberate upgrades will compound your impact.',
      color: 'text-blue-600',
      pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    }
  }
  return {
    label: 'Strong',
    desc: 'You operate like a high-leverage founder. Focus on systems and leadership bench to scale.',
    color: 'text-emerald-600',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }
}

// B – Per-section insights (based on each section score)
function getSectionInsight(score: number) {
  if (!isFinite(score)) return 'Not enough answers yet to rate this area.'
  if (score < 40)
    return 'Severe weakness — this dimension is actively limiting the business.'
  if (score < 60)
    return 'Below healthy range — you feel the pain from this dimension often.'
  if (score < 80)
    return 'Decent but improvable — a few upgrades here would compound a lot.'
  return 'Strong foundation — this is currently a strength you can lean on.'
}

// C – Hard-hitting summary
function getHardHittingSummary(score: number | null) {
  if (score == null || !isFinite(score))
    return 'Once you complete the assessment, you’ll get a blunt summary of how your founder habits affect the business.'

  if (score < 40)
    return 'Right now your startup is at risk primarily because of how you operate as a founder — scattered focus, inconsistent execution, or weak decision loops. Fixing this changes everything.'

  if (score < 60)
    return 'You have a functioning founder operating system, but too much relies on brute force and willpower. Tightening your weekly rhythm, decision rules, and delegation will unlock the next level.'

  if (score < 80)
    return 'You already behave like a strong founder. The risk now is bottlenecking growth by staying in the weeds. Your job is shifting from “doer” to “designer of systems and leaders.”'

  return 'You operate like a top-tier founder — high judgment, strong discipline, and leverage. The next step is building a leadership bench so the company can scale without collapsing around you.'
}

// D – Blueprint (30 / 90-day actions)
function getBlueprint(score: number | null) {
  if (score == null || !isFinite(score)) {
    return {
      short: 'Complete the assessment to unlock a 30- and 90-day founder improvement plan.',
      plan30: [
        'Complete all sections honestly — don’t try to “game” the answers.',
        'Pick the lowest-scoring section as your first focus area.',
        'Write one clear constraint sentence: “Right now, growth is limited by…”',
      ],
      plan90: [
        'Re-run the assessment every 30 days to see trend lines.',
        'Use the data to drive real schedule changes, not just ideas.',
        'Share key insights with your co-founders or leadership team.',
      ],
    }
  }

  if (score < 40) {
    return {
      short: 'You need a simple but strict operating system so the business stops depending on chaos and adrenaline.',
      plan30: [
        'Block 2 hours weekly as “CEO time” to think about the business, not work inside it.',
        'Define a simple weekly cadence: priorities, metrics review, and commitments.',
        'Identify 1–2 tasks you will stop doing personally and either delete, defer or delegate.',
      ],
      plan90: [
        'Install a weekly scorecard with 5–7 core numbers you track every single week.',
        'Document and delegate 2 recurring workflows that you personally own today.',
        'Create simple decision rules for hiring, spending and new projects to avoid impulsive decisions.',
      ],
    }
  }

  if (score < 60) {
    return {
      short: 'You have a working base but are leaking leverage. You need more structure and clearer focus.',
      plan30: [
        'Clarify your top 3 outcomes for the next 90 days and write them down.',
        'Audit your calendar and cut or delegate 20% of recurring meetings or tasks.',
        'Choose one “maker block” per week (2–3 hours, no meetings) for deep work on the most important problem.',
      ],
      plan90: [
        'Create a lightweight operating rhythm: weekly planning, metrics, pipeline review, team check-ins.',
        'Design one role you can hire or promote into to remove you from a low-leverage area.',
        'Standardize your best decisions and patterns into simple, written principles.',
      ],
    }
  }

  if (score < 80) {
    return {
      short: 'You’re strong; now you need leverage — more outcomes with less of your direct involvement.',
      plan30: [
        'List all areas where decisions bottleneck on you; pick one to remove yourself from.',
        'Give one team member ownership over a result, not just a list of tasks.',
        'Create a short “leader handbook” — how you like to operate, decide and communicate.',
      ],
      plan90: [
        'Build a small leadership group that owns metrics and projects without you driving every detail.',
        'Move 1–2 big decisions each month from “I decide” to “I approve a well-framed recommendation.”',
        'Revisit your personal schedule and design it around high-leverage activities only.',
      ],
    }
  }

  return {
    short:
      'Your founder foundation is excellent. The next challenge is scaling culture, leadership and systems.',
    plan30: [
      'Define what “world-class” looks like for your executive team and culture in the next 2–3 years.',
      'Identify one area where standards have slipped as the company grew and reset expectations.',
      'Take one big bet that only you, as the founder, can see and champion.',
    ],
    plan90: [
      'Design a repeatable leadership development path inside the company.',
      'Codify the company’s key decision principles, not just values, and teach them explicitly.',
      'Increase the time you spend on long-term strategy and external leverage (capital, partnerships, brand).',
    ],
  }
}

export default function Founder() {
  const [answers, setAnswers] = React.useState<Answers>({})
  const [activeSectionId, setActiveSectionId] = React.useState<
    'A' | 'B' | 'C' | 'D' | null
  >(null)
  const [sectionASelected, setSectionASelected] = React.useState<string[]>([])

  // Shuffle Section A keywords once (per mount)
  const shuffledSectionAKeywords = React.useMemo(() => {
    const arr = [...SECTION_A_KEYWORDS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  // Load MCQ answers (B–E) from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') setAnswers(parsed)
      }
    } catch {}
  }, [])

  // Load Section A keyword selections
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_SECTION_A)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setSectionASelected(parsed)
      }
    } catch {}
  }, [])

  const setAnswer = (qid: number, key: OptionKey) => {
    // Only store answers for questions 9–40 (B–E); Section A uses keyword flow
    if (qid >= 1 && qid <= 8) return

    setAnswers(prev => {
      const next = { ...prev, [qid]: key }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const toggleSectionAKeyword = (id: string) => {
    setSectionASelected(prev => {
      const already = prev.includes(id)
      let next: string[]
      if (already) {
        next = prev.filter(x => x !== id)
      } else {
        // limit 8 selections
        if (prev.length >= TOTAL_SECTION_A_ITEMS) return prev
        next = [...prev, id]
      }
      try {
        localStorage.setItem(LS_KEY_SECTION_A, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const resetAll = () => {
    setAnswers({})
    setSectionASelected([])
    try {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_KEY_SECTION_A)
      localStorage.removeItem('score_founder')
    } catch {}
  }

  // Count answers in Sections B–E (questions 9–40)
  const answeredOther = Object.keys(answers)
    .map(id => Number(id))
    .filter(id => id >= 9 && id <= 40).length

  const answeredCount = sectionASelected.length + answeredOther
  const completionPct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)

  // Section A score from keywords
  const sectionAScore = computeSectionAScore(sectionASelected)

  // Helper: compute per-section (B–E) scores from MCQ answers
  const computeSectionScoreFromMCQ = (
    sectionId: 'B' | 'C' | 'D' | 'E',
  ): number | null => {
    const section = FOUNDER_SECTIONS.find(s => s.id === sectionId)
    if (!section) return null
    const qs = section.questions
    const answered = qs.filter(q => answers[q.id]).length
    if (!answered) return null
    const rawSum = qs.reduce((acc, q) => {
      const k = answers[q.id]
      return k ? acc + (OPTION_WEIGHT[k] || 0) : acc
    }, 0)
    return computeReversedScore(rawSum, answered)
  }

  const sectionBScore = computeSectionScoreFromMCQ('B')
  const sectionCScore = computeSectionScoreFromMCQ('C')
  const sectionDScore = computeSectionScoreFromMCQ('D')
  const sectionEScore = computeSectionScoreFromMCQ('E')

  // Overall founder score = average of available section scores (A–E) out of 100
  const sectionScores = [
    sectionAScore,
    sectionBScore,
    sectionCScore,
    sectionDScore,
    sectionEScore,
  ].filter((x): x is number => x != null && isFinite(x))

  const overallScore = sectionScores.length
    ? Math.round(sectionScores.reduce((acc, v) => acc + v, 0) / sectionScores.length)
    : 0

  const band = getFounderBand(sectionScores.length ? overallScore : null)
  const blueprint = getBlueprint(sectionScores.length ? overallScore : null)
  const hardSummary = getHardHittingSummary(
    sectionScores.length ? overallScore : null,
  )

  // Store founder score in localStorage for dashboard
  React.useEffect(() => {
    try {
      if (isFinite(overallScore) && overallScore > 0) {
        localStorage.setItem(
          'score_founder',
          JSON.stringify({ score: overallScore, at: Date.now() }),
        )
      }
    } catch {}
  }, [overallScore])

  return (
    <div className="h-full min-h-0 bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                Founder Assessment
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Answer {TOTAL_QUESTIONS} questions to evaluate your founder strength.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetAll}>
              Reset
            </Button>
          </div>

          {/* Top Stats + Simple Band (A) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                COMPLETION
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {completionPct}%
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {answeredCount}/{TOTAL_QUESTIONS}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                FOUNDER SCORE
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {isFinite(overallScore) ? overallScore : 0}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                out of 100
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                STATUS
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {answeredCount === TOTAL_QUESTIONS ? '✓' : '–'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {answeredCount === TOTAL_QUESTIONS ? 'Complete' : 'In Progress'}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                BAND
              </p>
              <p className={`text-sm font-bold ${band.color} mb-1`}>{band.label}</p>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-[11px] ${band.pill}`}
              >
                {band.desc}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                Overall Progress
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {completionPct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hard-hitting summary (C) + Blueprint teaser (D) */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              HARD TRUTH (C)
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              {hardSummary}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              BLUEPRINT PREVIEW (D)
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              {blueprint.short}
            </p>
          </div>
        </div>

        {/* Section Cards with per-section insights (B) */}
        {!activeSectionId && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Assessment Sections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FOUNDER_SECTIONS.filter(s => s.id !== 'E').map(section => {
                let answered = 0
                let sectionScore: number | null = null
                let progress = 0

                if (section.id === 'A') {
                  answered = sectionASelected.length
                  sectionScore = sectionAScore
                  progress =
                    answered > 0
                      ? (answered / TOTAL_SECTION_A_ITEMS) * 100
                      : 0
                } else {
                  const sectionQs = section.questions
                  answered = sectionQs.filter(q => answers[q.id]).length
                  const rawSum = sectionQs.reduce((acc, q) => {
                    const key = answers[q.id]
                    return key ? acc + (OPTION_WEIGHT[key] || 0) : acc
                  }, 0)
                  sectionScore = computeReversedScore(rawSum, answered)
                  progress =
                    answered > 0 ? (answered / sectionQs.length) * 100 : 0
                }

                return (
                  <button
                    key={section.id}
                    onClick={() =>
                      setActiveSectionId(section.id as 'A' | 'B' | 'C' | 'D')
                    }
                    className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-gray-200 dark:border-neutral-700 hover:shadow-md hover:border-gray-300 dark:hover:border-neutral-600 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                          Section {section.id}
                        </p>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {section.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                        {section.id === 'A'
                          ? `${answered}/${TOTAL_SECTION_A_ITEMS}`
                          : `${answered}/${section.questions.length}`}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-700">
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Score
                        </p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {sectionScore != null && isFinite(sectionScore)
                            ? sectionScore
                            : 0}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {getSectionInsight(
                            sectionScore != null && isFinite(sectionScore)
                              ? sectionScore
                              : 0,
                          )}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {section.id === 'A'
                          ? answered === TOTAL_SECTION_A_ITEMS
                            ? '✓ Done'
                            : 'Start'
                          : answered === section.questions.length
                          ? '✓ Done'
                          : 'Start'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Questions Section + Detailed Blueprint (D) */}
        {activeSectionId &&
          (() => {
            const section = FOUNDER_SECTIONS.find(s => s.id === activeSectionId)
            if (!section) return null

            // Special flow for Section A: keyword selection
            if (section.id === 'A') {
              const answered = sectionASelected.length
              const progress =
                answered > 0 ? (answered / TOTAL_SECTION_A_ITEMS) * 100 : 0

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                    {/* Section Header */}
                    <div className="bg-gray-50 dark:bg-neutral-700/50 px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                          Section A
                        </p>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                          {section.title}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Select up to 8 keywords that best describe how you
                          currently operate.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSectionId(null)}
                      >
                        Back
                      </Button>
                    </div>

                    {/* Progress */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          Section Progress
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {answered}/{TOTAL_SECTION_A_ITEMS} selected
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Pick up to 8 keywords. More accurate = better score.
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Keywords grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shuffledSectionAKeywords.map(k => {
                          const selected = sectionASelected.includes(k.id)
                          const disabled =
                            !selected &&
                            sectionASelected.length >= TOTAL_SECTION_A_ITEMS

                          return (
                            <button
                              key={k.id}
                              type="button"
                              onClick={() => {
                                if (disabled) return
                                toggleSectionAKeyword(k.id)
                              }}
                              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : disabled
                                  ? 'border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800/60 text-neutral-400 cursor-not-allowed opacity-60'
                                  : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:border-gray-300 dark:hover:border-neutral-600'
                              }`}
                            >
                              {k.label}
                            </button>
                          )
                        })}
                      </div>

                      {sectionAScore != null && (
                        <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 px-4 py-3">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                            Vision Clarity Score
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {sectionAScore}/100
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                            Based on how many high-clarity keywords you chose
                            out of 8 possible.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blueprint panel (D) */}
                  <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-5">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      30-DAY PLAN (D)
                    </p>
                    <ul className="list-disc list-inside text-sm text-neutral-800 dark:text-neutral-200 mb-4 space-y-1">
                      {blueprint.plan30.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      90-DAY PLAN
                    </p>
                    <ul className="list-disc list-inside text-sm text-neutral-800 dark:text-neutral-200 space-y-1">
                      {blueprint.plan90.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            }

            // Default flow for Sections B–D (MCQ)
            const sectionQs = section.questions
            const answered = sectionQs.map(q => answers[q.id]).filter(Boolean).length
            const progress = (answered / sectionQs.length) * 100

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                  {/* Section Header */}
                  <div className="bg-gray-50 dark:bg-neutral-700/50 px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                        Section {section.id}
                      </p>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {section.title}
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {answered} of {sectionQs.length} answered
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSectionId(null)}
                    >
                      Back
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Section Progress
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="p-6 space-y-6">
                    {section.questions.map((q, idx) => {
                      const selected = answers[q.id]
                      return (
                        <div
                          key={q.id}
                          className={`pb-6 ${
                            idx < section.questions.length - 1
                              ? 'border-b border-gray-200 dark:border-neutral-700'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold">
                              {idx + 1}
                            </span>
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                              {q.text}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2 ml-11">
                            {q.options.map(opt => (
                              <button
                                key={opt.key}
                                onClick={() => setAnswer(q.id, opt.key)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  selected === opt.key
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-neutral-900 dark:text-white">
                                    {opt.key}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                      {opt.label}
                                    </p>
                                    <p
                                      className={`text-xs mt-0.5 ${
                                        selected === opt.key
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-neutral-500 dark:text-neutral-400'
                                      }`}
                                    >
                                      {opt.weight}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Blueprint panel (D) */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-5">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                    30-DAY PLAN (D)
                  </p>
                  <ul className="list-disc list-inside text-sm text-neutral-800 dark:text-neutral-200 mb-4 space-y-1">
                    {blueprint.plan30.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                    90-DAY PLAN
                  </p>
                  <ul className="list-disc list-inside text-sm text-neutral-800 dark:text-neutral-200 space-y-1">
                    {blueprint.plan90.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })()}
      </div>
    </div>
  )
}

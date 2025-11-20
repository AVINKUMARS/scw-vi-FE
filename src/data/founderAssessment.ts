// data/founderAssessment.ts

export type OptionKey = 'A' | 'B' | 'C' | 'D'

export const OPTION_WEIGHT: Record<OptionKey, number> = {
  A: 4, // weakest / limiting
  B: 3,
  C: 2,
  D: 1, // strongest / growth mindset
}

export type Question = {
  id: number
  text: string
  options: Array<{ key: OptionKey; label: string; weight: number }>
}

export type Section = {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  title: string
  questions: Question[]
}

// 40 questions across 5 sections (8 each)
export const FOUNDER_SECTIONS: Section[] = [
  {
    id: 'A',
    title: 'Vision Clarity',
    questions: [
      {
        id: 1,
        text: 'I have a clear long-term vision for my business.',
        options: [
          { key: 'A', label: 'No clear vision at all', weight: 4 },
          { key: 'B', label: 'Roughly defined vision', weight: 3 },
          { key: 'C', label: 'Clear vision but not documented', weight: 2 },
          { key: 'D', label: 'Clear, documented, and measurable vision', weight: 1 },
        ],
      },
      {
        id: 2,
        text: 'I know exactly what my business must achieve in the next 12 months.',
        options: [
          { key: 'A', label: 'No idea', weight: 4 },
          { key: 'B', label: 'Vague goals', weight: 3 },
          { key: 'C', label: 'Clear goals, not broken down', weight: 2 },
          { key: 'D', label: 'Clear quarterly/weekly milestones', weight: 1 },
        ],
      },
      {
        id: 3,
        text: 'I convert long-term goals into actionable steps.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 4,
        text: 'My team understands my vision.',
        options: [
          { key: 'A', label: 'Not at all', weight: 4 },
          { key: 'B', label: 'Only some key people', weight: 3 },
          { key: 'C', label: 'Most team members', weight: 2 },
          { key: 'D', label: 'Everyone clearly knows the vision', weight: 1 },
        ],
      },
      {
        id: 5,
        text: 'I know the core value proposition of my business.',
        options: [
          { key: 'A', label: 'Not clear', weight: 4 },
          { key: 'B', label: 'Some idea', weight: 3 },
          { key: 'C', label: 'Mostly clear', weight: 2 },
          { key: 'D', label: 'Very clear and documented', weight: 1 },
        ],
      },
      {
        id: 6,
        text: 'I track progress toward goals regularly.',
        options: [
          { key: 'A', label: 'Never', weight: 4 },
          { key: 'B', label: 'Rarely', weight: 3 },
          { key: 'C', label: 'Monthly', weight: 2 },
          { key: 'D', label: 'Weekly', weight: 1 },
        ],
      },
      {
        id: 7,
        text: 'I know my top 3 priorities for this quarter.',
        options: [
          { key: 'A', label: 'No clarity', weight: 4 },
          { key: 'B', label: 'Changing priorities', weight: 3 },
          { key: 'C', label: 'Some clarity', weight: 2 },
          { key: 'D', label: 'Very clear', weight: 1 },
        ],
      },
      {
        id: 8,
        text: 'My decisions align with long-term goals.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'Execution Discipline',
    questions: [
      {
        id: 9,
        text: 'I complete the tasks I plan for myself.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Mostly', weight: 2 },
          { key: 'D', label: 'Almost always', weight: 1 },
        ],
      },
      {
        id: 10,
        text: 'I avoid delaying important decisions.',
        options: [
          { key: 'A', label: 'Frequently delay', weight: 4 },
          { key: 'B', label: 'Sometimes delay', weight: 3 },
          { key: 'C', label: 'Usually on time', weight: 2 },
          { key: 'D', label: 'Make decisions quickly', weight: 1 },
        ],
      },
      {
        id: 11,
        text: 'I maintain a weekly execution routine.',
        options: [
          { key: 'A', label: 'No routine', weight: 4 },
          { key: 'B', label: 'Inconsistent', weight: 3 },
          { key: 'C', label: 'Mostly consistent', weight: 2 },
          { key: 'D', label: 'Very consistent', weight: 1 },
        ],
      },
      {
        id: 12,
        text: 'I follow up on team tasks regularly.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 13,
        text: 'I stick to commitments even under discomfort.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 14,
        text: 'I track my daily tasks or KPIs.',
        options: [
          { key: 'A', label: 'Never', weight: 4 },
          { key: 'B', label: 'Occasionally', weight: 3 },
          { key: 'C', label: 'Weekly', weight: 2 },
          { key: 'D', label: 'Daily', weight: 1 },
        ],
      },
      {
        id: 15,
        text: 'I avoid distractions during work hours.',
        options: [
          { key: 'A', label: 'Very distracted', weight: 4 },
          { key: 'B', label: 'Sometimes distracted', weight: 3 },
          { key: 'C', label: 'Mostly focused', weight: 2 },
          { key: 'D', label: 'Highly focused', weight: 1 },
        ],
      },
      {
        id: 16,
        text: 'I maintain momentum even on difficult days.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'C',
    title: 'Leadership & Team Handling',
    questions: [
      {
        id: 17,
        text: 'I delegate effectively.',
        options: [
          { key: 'A', label: 'Not at all', weight: 4 },
          { key: 'B', label: 'Delegation is weak', weight: 3 },
          { key: 'C', label: 'Mostly effective', weight: 2 },
          { key: 'D', label: 'Very effective', weight: 1 },
        ],
      },
      {
        id: 18,
        text: 'I guide without micromanaging.',
        options: [
          { key: 'A', label: 'Heavily micromanage', weight: 4 },
          { key: 'B', label: 'Micromanage often', weight: 3 },
          { key: 'C', label: 'Balanced', weight: 2 },
          { key: 'D', label: 'Empower team', weight: 1 },
        ],
      },
      {
        id: 19,
        text: 'I handle conflicts calmly.',
        options: [
          { key: 'A', label: 'I react emotionally', weight: 4 },
          { key: 'B', label: 'Sometimes emotional', weight: 3 },
          { key: 'C', label: 'Mostly calm', weight: 2 },
          { key: 'D', label: 'Always calm', weight: 1 },
        ],
      },
      {
        id: 20,
        text: 'I give clear instructions.',
        options: [
          { key: 'A', label: 'Very unclear', weight: 4 },
          { key: 'B', label: 'Somewhat unclear', weight: 3 },
          { key: 'C', label: 'Mostly clear', weight: 2 },
          { key: 'D', label: 'Very clear', weight: 1 },
        ],
      },
      {
        id: 21,
        text: 'My team trusts my decisions.',
        options: [
          { key: 'A', label: 'No trust', weight: 4 },
          { key: 'B', label: 'Some doubts', weight: 3 },
          { key: 'C', label: 'Mostly trust', weight: 2 },
          { key: 'D', label: 'Strong trust', weight: 1 },
        ],
      },
      {
        id: 22,
        text: 'I provide constructive feedback.',
        options: [
          { key: 'A', label: 'Avoid feedback', weight: 4 },
          { key: 'B', label: 'Give feedback rarely', weight: 3 },
          { key: 'C', label: 'Give feedback sometimes', weight: 2 },
          { key: 'D', label: 'Give feedback consistently', weight: 1 },
        ],
      },
      {
        id: 23,
        text: 'I encourage independence.',
        options: [
          { key: 'A', label: 'Not at all', weight: 4 },
          { key: 'B', label: 'Rarely', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 24,
        text: 'I empower my team to make decisions.',
        options: [
          { key: 'A', label: 'No empowerment', weight: 4 },
          { key: 'B', label: 'Low empowerment', weight: 3 },
          { key: 'C', label: 'Moderate', weight: 2 },
          { key: 'D', label: 'High empowerment', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'D',
    title: 'Financial Awareness',
    questions: [
      {
        id: 25,
        text: 'I understand my monthly revenue and expenses.',
        options: [
          { key: 'A', label: 'No idea', weight: 4 },
          { key: 'B', label: 'Rough idea', weight: 3 },
          { key: 'C', label: 'Clear idea', weight: 2 },
          { key: 'D', label: 'Very clear + documented', weight: 1 },
        ],
      },
      {
        id: 26,
        text: 'I know my profit margins.',
        options: [
          { key: 'A', label: 'No idea', weight: 4 },
          { key: 'B', label: 'Rough idea', weight: 3 },
          { key: 'C', label: 'Clear calculation', weight: 2 },
          { key: 'D', label: 'Very clear + updated', weight: 1 },
        ],
      },
      {
        id: 27,
        text: 'I track cashflow and receivables.',
        options: [
          { key: 'A', label: 'Never', weight: 4 },
          { key: 'B', label: 'Rarely', weight: 3 },
          { key: 'C', label: 'Monthly', weight: 2 },
          { key: 'D', label: 'Weekly', weight: 1 },
        ],
      },
      {
        id: 28,
        text: 'I know the cost of acquiring a customer.',
        options: [
          { key: 'A', label: 'No idea', weight: 4 },
          { key: 'B', label: 'Guessing', weight: 3 },
          { key: 'C', label: 'Approximate number', weight: 2 },
          { key: 'D', label: 'Accurate tracking', weight: 1 },
        ],
      },
      {
        id: 29,
        text: 'I understand P&L statements.',
        options: [
          { key: 'A', label: 'No', weight: 4 },
          { key: 'B', label: 'Basic only', weight: 3 },
          { key: 'C', label: 'Decent understanding', weight: 2 },
          { key: 'D', label: 'Confident reader', weight: 1 },
        ],
      },
      {
        id: 30,
        text: 'I make data-driven decisions.',
        options: [
          { key: 'A', label: 'Never', weight: 4 },
          { key: 'B', label: 'Rarely', weight: 3 },
          { key: 'C', label: 'Often', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 31,
        text: 'I maintain cash reserves.',
        options: [
          { key: 'A', label: 'No reserves', weight: 4 },
          { key: 'B', label: 'Less than 1 month', weight: 3 },
          { key: 'C', label: '1–2 months', weight: 2 },
          { key: 'D', label: '3+ months', weight: 1 },
        ],
      },
      {
        id: 32,
        text: 'I take financial decisions confidently.',
        options: [
          { key: 'A', label: 'Very unsure', weight: 4 },
          { key: 'B', label: 'Somewhat unsure', weight: 3 },
          { key: 'C', label: 'Mostly confident', weight: 2 },
          { key: 'D', label: 'Very confident', weight: 1 },
        ],
      },
    ],
  },
  {
    id: 'E',
    title: 'Mindset, Confidence & Stress',
    questions: [
      {
        id: 33,
        text: 'I trust myself in business decisions.',
        options: [
          { key: 'A', label: 'Very low trust', weight: 4 },
          { key: 'B', label: 'Low trust', weight: 3 },
          { key: 'C', label: 'Good trust', weight: 2 },
          { key: 'D', label: 'High trust', weight: 1 },
        ],
      },
      {
        id: 34,
        text: 'I stay calm under pressure.',
        options: [
          { key: 'A', label: 'Rarely', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Mostly', weight: 2 },
          { key: 'D', label: 'Always', weight: 1 },
        ],
      },
      {
        id: 35,
        text: 'I bounce back after failures.',
        options: [
          { key: 'A', label: 'Very slowly', weight: 4 },
          { key: 'B', label: 'Slowly', weight: 3 },
          { key: 'C', label: 'Moderately', weight: 2 },
          { key: 'D', label: 'Quickly', weight: 1 },
        ],
      },
      {
        id: 36,
        text: 'I don’t take problems personally.',
        options: [
          { key: 'A', label: 'Very emotionally', weight: 4 },
          { key: 'B', label: 'Somewhat', weight: 3 },
          { key: 'C', label: 'Mostly objective', weight: 2 },
          { key: 'D', label: 'Very objective', weight: 1 },
        ],
      },
      {
        id: 37,
        text: 'I maintain emotional control during stress.',
        options: [
          { key: 'A', label: 'Very poor', weight: 4 },
          { key: 'B', label: 'Poor', weight: 3 },
          { key: 'C', label: 'Good', weight: 2 },
          { key: 'D', label: 'Excellent', weight: 1 },
        ],
      },
      {
        id: 38,
        text: 'I remain confident even during setbacks.',
        options: [
          { key: 'A', label: 'Lose confidence', weight: 4 },
          { key: 'B', label: 'Low confidence', weight: 3 },
          { key: 'C', label: 'Mostly confident', weight: 2 },
          { key: 'D', label: 'Always confident', weight: 1 },
        ],
      },
      {
        id: 39,
        text: 'I rarely doubt my major decisions.',
        options: [
          { key: 'A', label: 'Doubt often', weight: 4 },
          { key: 'B', label: 'Sometimes', weight: 3 },
          { key: 'C', label: 'Rarely', weight: 2 },
          { key: 'D', label: 'Never', weight: 1 },
        ],
      },
      {
        id: 40,
        text: 'I maintain balance between emotions & logic.',
        options: [
          { key: 'A', label: 'Very unbalanced', weight: 4 },
          { key: 'B', label: 'Mostly emotional', weight: 3 },
          { key: 'C', label: 'Balanced mostly', weight: 2 },
          { key: 'D', label: 'Highly balanced', weight: 1 },
        ],
      },
    ],
  },
]

export const TOTAL_QUESTIONS = FOUNDER_SECTIONS.reduce(
  (acc, s) => acc + s.questions.length,
  0,
)

export function computeReversedScore(rawSum: number, answeredCount: number): number {
  if (answeredCount <= 0) return 0
  const min = 1 * answeredCount
  const max = 4 * answeredCount
  const reversed = ((max - rawSum) / (max - min)) * 100
  return Math.max(0, Math.min(100, Math.round(reversed)))
}

// --- Section A keyword-based flow --- //

export type SectionAKeyword = {
  id: string
  label: string
  correct: boolean
}

// 8 questions → 8 correct + 8 wrong = 16 keywords
export const SECTION_A_KEYWORDS: SectionAKeyword[] = [
  // Q1 – long-term vision clarity
  { id: 'clear-vision', label: 'Clear long-term vision', correct: true },
  { id: 'no-vision', label: 'No clear vision', correct: false },

  // Q2 – 12-month goals
  { id: 'clear-goals', label: 'Clear 12-month goals', correct: true },
  { id: 'no-goals', label: 'No clear goals', correct: false },

  // Q3 – actionable planning
  { id: 'actionable-steps', label: 'Turn goals into actions', correct: true },
  { id: 'no-planning', label: 'No real planning', correct: false },

  // Q4 – team alignment
  { id: 'team-aligned', label: 'Team aligned with vision', correct: true },
  { id: 'team-confused', label: 'Team is confused', correct: false },

  // Q5 – value proposition clarity
  { id: 'clear-value', label: 'Clear value proposition', correct: true },
  { id: 'unclear-value', label: 'Unclear value proposition', correct: false },

  // Q6 – progress tracking
  { id: 'weekly-tracking', label: 'Weekly progress tracking', correct: true },
  { id: 'no-tracking', label: 'No tracking of progress', correct: false },

  // Q7 – priority clarity
  { id: 'clear-priorities', label: 'Clear top priorities', correct: true },
  { id: 'no-priorities', label: 'No clear priorities', correct: false },

  // Q8 – decision alignment
  { id: 'aligned-decisions', label: 'Decisions match vision', correct: true },
  { id: 'random-decisions', label: 'Random or reactive decisions', correct: false },
]

// User picks up to 8 keywords.
// Each correct keyword = 20 raw points (max 160), then normalised to /100.
export function computeSectionAScore(selectedIds: string[]): number | null {
  if (!selectedIds || selectedIds.length === 0) return null

  const correctCount = SECTION_A_KEYWORDS.reduce((acc, k) => {
    if (k.correct && selectedIds.includes(k.id)) return acc + 1
    return acc
  }, 0)

  const raw = correctCount * 20 // max 160
  const normalized = (raw / 160) * 100
  return Math.max(0, Math.min(100, Math.round(normalized)))
}

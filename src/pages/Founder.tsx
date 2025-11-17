import React from 'react'
import { FOUNDER_SECTIONS, OPTION_WEIGHT, TOTAL_QUESTIONS, computeReversedScore, type OptionKey } from '../data/founderAssessment'
import Button from '../components/Button'

type Answers = Record<number, OptionKey>

const LS_KEY = 'founderAssessmentV1'

export default function Founder() {
  const [answers, setAnswers] = React.useState<Answers>({})
  const [activeSectionId, setActiveSectionId] = React.useState<'A' | 'B' | 'C' | 'D' | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') setAnswers(parsed)
      }
    } catch {}
  }, [])

  const setAnswer = (qid: number, key: OptionKey) => {
    setAnswers(prev => {
      const next = { ...prev, [qid]: key }
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const resetAll = () => {
    setAnswers({})
    try { localStorage.removeItem(LS_KEY) } catch {}
  }

  const answeredCount = Object.keys(answers).length
  const rawSum = Object.entries(answers).reduce((acc, [, key]) => acc + (OPTION_WEIGHT[key as OptionKey] || 0), 0)
  const overallScore = computeReversedScore(rawSum, answeredCount)
  const completionPct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Founder Assessment</h1>
              <p className="text-neutral-600 dark:text-neutral-400">Answer 40 questions to evaluate your founder strength</p>
            </div>
            <Button variant="outline" size="sm" onClick={resetAll}>Reset</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">COMPLETION</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{completionPct}%</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{answeredCount}/{TOTAL_QUESTIONS}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">FOUNDER SCORE</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overallScore}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">out of 100</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">STATUS</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{answeredCount === TOTAL_QUESTIONS ? '✓' : '–'}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{answeredCount === TOTAL_QUESTIONS ? 'Complete' : 'In Progress'}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">Overall Progress</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{completionPct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section Cards */}
        {!activeSectionId && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Assessment Sections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FOUNDER_SECTIONS.filter(s => s.id !== 'E').map(section => {
                const sectionQs = section.questions
                const answered = sectionQs.map(q => answers[q.id]).filter(Boolean).length
                const rawSum = sectionQs
                  .map(q => answers[q.id])
                  .filter(Boolean)
                  .reduce((acc, key) => acc + (OPTION_WEIGHT[key as OptionKey] || 0), 0)
                const sectionScore = computeReversedScore(rawSum, answered)
                const progress = answered > 0 ? (answered / sectionQs.length) * 100 : 0

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id as 'A' | 'B' | 'C' | 'D')}
                    className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-gray-200 dark:border-neutral-700 hover:shadow-md hover:border-gray-300 dark:hover:border-neutral-600 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Section {section.id}</p>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{section.title}</h3>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                        {answered}/{sectionQs.length}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Progress</span>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">{Math.round(progress)}%</span>
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
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">Score</p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">{isFinite(sectionScore) ? sectionScore : 0}</p>
                      </div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {answered === sectionQs.length ? '✓ Done' : 'Start'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Questions Section */}
        {activeSectionId && (() => {
          const section = FOUNDER_SECTIONS.find(s => s.id === activeSectionId)
          if (!section) return null

          const sectionQs = section.questions
          const answered = sectionQs.map(q => answers[q.id]).filter(Boolean).length
          const progress = (answered / sectionQs.length) * 100

          return (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
              {/* Section Header */}
              <div className="bg-gray-50 dark:bg-neutral-700/50 px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Section {section.id}</p>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{section.title}</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{answered} of {sectionQs.length} answered</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveSectionId(null)}>Back</Button>
              </div>

              {/* Progress */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">Section Progress</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{Math.round(progress)}%</span>
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
                    <div key={q.id} className={`pb-6 ${idx < section.questions.length - 1 ? 'border-b border-gray-200 dark:border-neutral-700' : ''}`}>
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{q.text}</h3>
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
                              <span className="font-bold text-neutral-900 dark:text-white">{opt.key}</span>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{opt.label}</p>
                                <p className={`text-xs mt-0.5 ${selected === opt.key ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
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
          )
        })()}
      </div>
    </div>
  )
}

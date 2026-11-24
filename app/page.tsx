'use client'

import { useState } from 'react'

const WORRIES = [
  'Finances',
  'Lack of sleep',
  'Mental health',
  'Economic climate',
  'Social media',
  'Tech',
] as const

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-[#fafbfc] px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function choiceClass(selected: boolean) {
  return `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
    selected
      ? 'border-blue-500 bg-blue-50 text-[#172b4d] ring-2 ring-blue-100'
      : 'border-slate-300 bg-[#fafbfc] text-slate-800 hover:border-slate-400'
  }`
}

export default function Home() {
  const [wantKids, setWantKids] = useState('')
  const [haveKids, setHaveKids] = useState('')
  const [kidCount, setKidCount] = useState('')
  const [worries, setWorries] = useState<string[]>([])
  const [plannedKids, setPlannedKids] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  // --- Ask the bot state ---
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState('')

  const countNeeded = haveKids === 'Yes'
  const countValid =
    !countNeeded ||
    (kidCount !== '' && Number.isInteger(Number(kidCount)) && Number(kidCount) >= 1)
  const canSubmit = Boolean(wantKids && haveKids && plannedKids && countValid && !loading)

  function toggleWorry(worry: string) {
    setWorries((current) =>
      current.includes(worry)
        ? current.filter((item) => item !== worry)
        : [...current, worry],
    )
  }

  function resetAnswers() {
    setWantKids('')
    setHaveKids('')
    setKidCount('')
    setWorries([])
    setPlannedKids('')
  }

  async function submitQuestionnaire() {
    if (!canSubmit) return

    const selectedWorries = WORRIES.filter((worry) => worries.includes(worry))
    const lines = [
      `Do you want kids? ${wantKids}`,
      `Do you have kids? ${haveKids}`,
    ]
    if (countNeeded) {
      lines.push(`How many kids do you have? ${kidCount}`)
    }
    lines.push(
      `What's your biggest worry with kids? ${selectedWorries.join(', ') || 'None'}`,
      `Did you plan on having kids? ${plannedKids}`,
    )

    setLoading(true)
    setStatus('')

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: lines.join('\n') }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('success')
        resetAnswers()
      } else {
        setStatus(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  // --- Ask the bot ---
  async function askBot() {
    if (!question.trim() || asking) return

    setAsking(true)
    setAnswer('')
    setAskError('')

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (data.answer) {
        setAnswer(data.answer)
      } else {
        setAskError(data.error || 'Something went wrong')
      }
    } catch {
      setAskError('Unable to connect to the server')
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#172b4d] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#172b4d] text-white hidden md:flex flex-col shrink-0">

        <div className="px-6 py-7 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <span className="text-xl font-semibold tracking-tight">
            scout-pal
          </span>
        </div>

        <div className="px-4 mt-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 px-3 mb-3">
            Workspace
          </p>

          <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#253858] text-white">
              <span>▦</span>
              <span className="text-sm font-medium">Dashboard</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-[#253858] cursor-pointer">
              <span>▤</span>
              <span className="text-sm">Documents</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-[#253858] cursor-pointer">
              <span>⌕</span>
              <span className="text-sm">Search</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
              SP
            </div>
            <div>
              <p className="text-sm font-medium">My Workspace</p>
              <p className="text-xs text-slate-400">Personal account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">

        {/* Top navigation */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10">
          <div className="text-sm text-slate-500">
            Workspace <span className="mx-2">/</span>
            <span className="text-slate-800 font-medium">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">
              Your knowledge workspace
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
              SP
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">

          {/* Heading */}
          <div className="mb-9">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                WORKSPACE
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Document management
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#172b4d]">
              Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Add and manage the knowledge that powers Scout-pal.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Workspace</p>
              <p className="text-xl font-semibold mt-2">My knowledge</p>
              <p className="text-xs text-slate-400 mt-1">Your document collection</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Quick action</p>
              <p className="text-xl font-semibold mt-2">Add document</p>
              <p className="text-xs text-slate-400 mt-1">Import new information</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-xl font-semibold mt-2 text-emerald-600">
                ● Ready
              </p>
              <p className="text-xs text-slate-400 mt-1">Workspace is available</p>
            </div>
          </div>

          {/* Questionnaire card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  Questionnaire
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Answer a few questions to add them to your Scout-pal knowledge base.
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                +
              </div>
            </div>

            <div className="p-6">

              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  Do you want kids?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {['Yes', 'No', 'Undecided'].map((option) => (
                    <label key={option} className={choiceClass(wantKids === option)}>
                      <input
                        type="radio"
                        name="wantKids"
                        value={option}
                        checked={wantKids === option}
                        onChange={() => setWantKids(option)}
                        className="accent-[#0c66e4]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="block text-sm font-medium mb-2">
                  Do you have kids?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className={choiceClass(haveKids === option)}>
                      <input
                        type="radio"
                        name="haveKids"
                        value={option}
                        checked={haveKids === option}
                        onChange={() => {
                          setHaveKids(option)
                          if (option !== 'Yes') setKidCount('')
                        }}
                        className="accent-[#0c66e4]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              {haveKids === 'Yes' && (
                <div className="mt-6">
                  <label htmlFor="kidCount" className="block text-sm font-medium mb-2">
                    How many kids do you have?
                  </label>
                  <input
                    id="kidCount"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={kidCount}
                    onChange={(e) => setKidCount(e.target.value)}
                    placeholder="Enter a number"
                    className={inputClass}
                  />
                </div>
              )}

              <fieldset className="mt-6">
                <legend className="block text-sm font-medium mb-2">
                  What&apos;s your biggest worry with kids? (select any)
                </legend>
                <div className="flex flex-wrap gap-2">
                  {WORRIES.map((option) => (
                    <label key={option} className={choiceClass(worries.includes(option))}>
                      <input
                        type="checkbox"
                        name="worries"
                        value={option}
                        checked={worries.includes(option)}
                        onChange={() => toggleWorry(option)}
                        className="accent-[#0c66e4]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="block text-sm font-medium mb-2">
                  Did you plan on having kids?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className={choiceClass(plannedKids === option)}>
                      <input
                        type="radio"
                        name="plannedKids"
                        value={option}
                        checked={plannedKids === option}
                        onChange={() => setPlannedKids(option)}
                        className="accent-[#0c66e4]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Feedback */}
              {status && (
                <div className={`mt-5 p-3 rounded-lg text-sm ${
                  status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {status === 'success'
                    ? '✓ Document successfully added to your knowledge base.'
                    : `⚠ ${status}`}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Answers are submitted when you click Submit.
                </span>

                <button
                  onClick={submitQuestionnaire}
                  disabled={!canSubmit}
                  className="bg-[#0c66e4] hover:bg-[#0055cc] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>

            </div>
          </section>

          {/* Ask the community card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  Ask the community
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Ask a question and get an answer based on what people have submitted.
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                ⌕
              </div>
            </div>

            <div className="p-6">

              <label htmlFor="question" className="block text-sm font-medium mb-2">
                Your question
              </label>
              <input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') askBot() }}
                placeholder="e.g. What are people's biggest worries about having kids?"
                className={inputClass}
              />

              {askError && (
                <div className="mt-5 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                  ⚠ {askError}
                </div>
              )}

              {answer && (
                <div className="mt-5 p-4 rounded-lg text-sm bg-blue-50 text-[#172b4d] border border-blue-200 whitespace-pre-wrap leading-relaxed">
                  {answer}
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Answers are generated from real submissions.
                </span>

                <button
                  onClick={askBot}
                  disabled={!question.trim() || asking}
                  className="bg-[#0c66e4] hover:bg-[#0055cc] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
                >
                  {asking ? 'Thinking...' : 'Ask'}
                </button>
              </div>

            </div>
          </section>

          <p className="text-center text-xs text-slate-400 mt-8">
            Scout-pal · Your knowledge, organised.
          </p>

        </div>
      </main>
    </div>
  )
}
import { useState } from 'react'
import './App.css'

const KODER = [
  { value: '', label: '— Vælg kode —' },
  { value: '100', label: '100 – Almindeligt arbejde' },
  { value: '110', label: '110 – Overarbejde' },
  { value: '200', label: '200 – Ferie' },
  { value: '210', label: '210 – Afspadsering' },
  { value: '300', label: '300 – Sygdom' },
  { value: '310', label: '310 – Barn syg' },
  { value: '400', label: '400 – Kursus / uddannelse' },
  { value: '500', label: '500 – Fridag' },
]

const DAGE = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

interface DagRegistrering {
  timer: string
  kode: string
}

function getMandag(dato: Date): Date {
  const d = new Date(dato)
  const dag = d.getDay()
  const diff = dag === 0 ? -6 : 1 - dag
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDato(dato: Date): string {
  return dato.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit' })
}

function ugeNummer(dato: Date): number {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function tomUge(): DagRegistrering[] {
  return Array.from({ length: 7 }, () => ({ timer: '', kode: '' }))
}

function ugeNøgle(mandag: Date): string {
  return mandag.toISOString().slice(0, 10)
}

export default function App() {
  const [mandag, setMandag] = useState<Date>(() => getMandag(new Date()))
  const [uger, setUger] = useState<Record<string, DagRegistrering[]>>({})

  const nøgle = ugeNøgle(mandag)
  const dage = uger[nøgle] ?? tomUge()

  function opdaterDag(index: number, felt: keyof DagRegistrering, værdi: string) {
    const nyeDage = dage.map((d, i) => i === index ? { ...d, [felt]: værdi } : d)
    setUger(prev => ({ ...prev, [nøgle]: nyeDage }))
  }

  function gåTilUge(retning: -1 | 1) {
    const ny = new Date(mandag)
    ny.setDate(ny.getDate() + retning * 7)
    setMandag(ny)
  }

  const totalTimer = dage.reduce((sum, d) => sum + (parseFloat(d.timer) || 0), 0)

  return (
    <div className="app">
      <h1>Timeregistrering</h1>

      <div className="uge-navigation">
        <button className="nav-knap" onClick={() => gåTilUge(-1)}>‹ Forrige uge</button>
        <span className="uge-label">
          Uge {ugeNummer(mandag)} · {formatDato(mandag)} – {formatDato(new Date(mandag.getTime() + 6 * 86400000))}
        </span>
        <button className="nav-knap" onClick={() => gåTilUge(1)}>Næste uge ›</button>
      </div>

      <div className="tabel-wrapper">
        <table className="time-tabel">
          <thead>
            <tr>
              <th>Dag</th>
              <th>Dato</th>
              <th>Kode</th>
              <th>Timer</th>
            </tr>
          </thead>
          <tbody>
            {dage.map((dag, i) => {
              const dato = new Date(mandag.getTime() + i * 86400000)
              const erWeekend = i >= 5
              return (
                <tr key={i} className={erWeekend ? 'weekend' : ''}>
                  <td className="dag-navn" data-label="Dag">{DAGE[i]}</td>
                  <td className="dag-dato" data-label="Dato">{formatDato(dato)}</td>
                  <td data-label="Kode">
                    <select
                      value={dag.kode}
                      onChange={e => opdaterDag(i, 'kode', e.target.value)}
                      className="kode-select"
                    >
                      {KODER.map(k => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Timer">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="0"
                      value={dag.timer}
                      onChange={e => opdaterDag(i, 'timer', e.target.value)}
                      className="timer-input"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="total-række">
              <td colSpan={3}>Total</td>
              <td>{totalTimer % 1 === 0 ? totalTimer : totalTimer.toFixed(1)} timer</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        className="gem-knap"
        onClick={() => alert(`Uge ${ugeNummer(mandag)} gemt (${totalTimer} timer)`)}
      >
        Gem uge
      </button>
    </div>
  )
}

import React, { useState } from 'react'
import './LogHcpInteraction.css'
import { postInteraction, postAssistant } from '../api'

export default function LogHcpInteraction() {
  const [form, setForm] = useState({
    hcpName: '',
    interactionType: 'Meeting',
    date: '',
    time: '',
    attendees: '',
    topics: '',
    sentiment: 'Neutral',
    outcomes: '',
    followUps: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantReply, setAssistantReply] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      await postInteraction(form)
      setMessage('Interaction logged successfully')
      setForm({
        hcpName: '',
        interactionType: 'Meeting',
        date: '',
        time: '',
        attendees: '',
        topics: '',
        sentiment: 'Neutral',
        outcomes: '',
        followUps: '',
      })
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const summarizeForm = (f) => {
    const parts = []
    if (f.hcpName) parts.push(`${f.hcpName}`)
    if (f.interactionType) parts.push(`had a ${f.interactionType.toLowerCase()}`)
    if (f.topics) parts.push(`discussed: ${f.topics}`)
    if (f.outcomes) parts.push(`outcomes: ${f.outcomes}`)
    if (f.followUps) parts.push(`follow-ups: ${f.followUps}`)
    if (parts.length === 0) return 'No form details to summarize.'
    return parts.join('; ') + '.'
  }

  const handleAssistantSend = async (mode) => {
    const prompt = assistantInput?.trim() || (mode === 'summarize' ? 'Summarize the form and suggest updates.' : 'Generate an assistant response and update the form fields from the current interaction details.')
    setAssistantLoading(true)
    setAssistantReply('Processing...')
    setMessage(null)

    try {
      const result = await postAssistant(prompt, form)
      const reply = result?.reply || result?.message || 'Assistant responded.'
      const updatedForm = result?.form
      if (updatedForm && typeof updatedForm === 'object') {
        setForm((current) => ({ ...current, ...updatedForm }))
      }
      setAssistantReply(reply)
      setAssistantInput('')
    } catch (err) {
      setAssistantReply('Assistant error: ' + err.message)
    } finally {
      setAssistantLoading(false)
    }
  }

  return (
    <div className="log-hcp-root">
      <form className="log-hcp-form" onSubmit={handleSubmit}>
        <h2>Log HCP Interaction</h2>

        <div className="row">
          <label>HCP Name</label>
          <input name="hcpName" value={form.hcpName} onChange={handleChange} placeholder="Search or select HCP..." />
          <label>Interaction Type</label>
          <select name="interactionType" value={form.interactionType} onChange={handleChange}>
            <option>Meeting</option>
            <option>Call</option>
            <option>Email</option>
          </select>
        </div>

        <div className="row">
          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} />
          <label>Time</label>
          <input name="time" type="time" value={form.time} onChange={handleChange} />
        </div>

        <div className="full">
          <label>Attendees</label>
          <input name="attendees" value={form.attendees} onChange={handleChange} placeholder="Enter names or search..." />
        </div>

        <div className="full">
          <label>Topics Discussed</label>
          <textarea name="topics" value={form.topics} onChange={handleChange} placeholder="Enter key discussion points..."></textarea>
          <button type="button" className="muted">Summarize from Voice Note</button>
        </div>

        <div className="card">
          <h4>Materials Shared / Samples Distributed</h4>
          <div className="two-col">
            <div>
              <label>Materials Shared</label>
              <div className="empty">No materials added.</div>
            </div>
            <div>
              <label>Samples Distributed</label>
              <div className="empty">No samples added.</div>
            </div>
          </div>
        </div>

        <div className="row radios">
          <label>Observed/Inferred HCP Sentiment</label>
          <div>
            <label><input type="radio" name="sentiment" value="Positive" checked={form.sentiment === 'Positive'} onChange={handleChange} /> Positive</label>
            <label><input type="radio" name="sentiment" value="Neutral" checked={form.sentiment === 'Neutral'} onChange={handleChange} /> Neutral</label>
            <label><input type="radio" name="sentiment" value="Negative" checked={form.sentiment === 'Negative'} onChange={handleChange} /> Negative</label>
          </div>
        </div>

        <div className="full">
          <label>Outcomes</label>
          <textarea name="outcomes" value={form.outcomes} onChange={handleChange} placeholder="Key outcomes or agreements..."></textarea>
        </div>

        <div className="full">
          <label>Follow-up Actions</label>
          <textarea name="followUps" value={form.followUps} onChange={handleChange} placeholder="Enter next steps or tasks..."></textarea>
        </div>

        <div className="suggestions">
          <strong>AI Suggested Follow-ups:</strong>
          <ul>
            <li>Schedule follow-up meeting in 2 weeks</li>
            <li>Send product PDF</li>
            <li>Add Dr. Sharma to advisory board invite list</li>
          </ul>
        </div>

        <div className="actions">
          <button className="primary" type="submit" disabled={submitting}>{submitting ? 'Logging...' : 'Log Interaction'}</button>
        </div>

        {message && <div style={{marginTop:12}}>{message}</div>}
      </form>

      <aside className="assistant">
        <h3>AI Assistant</h3>
        <div className="assistant-box">{assistantReply || 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.'}</div>
        <div className="assistant-input">
          <input value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)} placeholder="Describe interaction..." />
          <button type="button" onClick={() => handleAssistantSend()} disabled={assistantLoading}>{assistantLoading ? 'Sending...' : 'Send'}</button>
          <button type="button" onClick={() => handleAssistantSend('summarize')} disabled={assistantLoading} style={{marginLeft:8}}>{assistantLoading ? 'Waiting...' : 'Summarize Form'}</button>
        </div>
      </aside>
    </div>
  )
}

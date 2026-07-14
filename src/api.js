export const BASE_URL = 'https://langgraph-form-automation.onrender.com'

export async function postInteraction(data) {
  const res = await fetch(`${BASE_URL}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }

  return res.json()
}

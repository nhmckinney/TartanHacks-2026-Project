const API_URL = 'http://localhost:8000';

async function get(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
  return response.json();
}

export const api = {
  getDrift: () => get('/api/drift'),

  analyze: async (driftData) => {
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driftData),
    });
    if (!res.ok) throw new Error("Analysis failed");
    return res.json();
  },
  chat: async (message, history, driftData) => {
    const res = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, drift_data: driftData }),
    });
    if (!res.ok) throw new Error("Chat failed");
    return res.json();
  }

};
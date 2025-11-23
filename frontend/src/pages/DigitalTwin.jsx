import { useEffect, useState } from "react";
import axios from "axios";

const DigitalTwin = () => {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchTwin();
  }, []);

  async function fetchTwin() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/digital-twin/${userId}`,
        { headers: { token: localStorage.getItem("token") } }
      );
      setTwin(res.data.digitalTwin);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function regenerateSummary() {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/digital-twin/summary/${userId}`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      );
    } catch (err) {
      console.error("Summary generation failed:", err);
    } finally {
      await fetchTwin();
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!twin) return <p>No digital twin data yet. Chat with the AI to get started.</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-2">🧬 Your Health Digital Twin</h2>

      <div className="mb-4 text-sm text-gray-600">
        <p><strong>Risk Level:</strong> {twin.riskLevel}</p>
        <p><strong>Last Updated:</strong> {new Date(twin.lastUpdated).toLocaleString()}</p>
      </div>

      <button
        className="px-4 py-2 bg-primary text-white rounded-full mb-5"
        onClick={regenerateSummary}
      >
        Refresh Summary
      </button>

      <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
        {twin.trendSummary || "No summary generated yet."}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">📅 Symptom Timeline</h3>

      <div className="max-h-[250px] overflow-y-auto border p-3 rounded-lg bg-white">
        {twin.symptomHistory.map((entry, i) => (
          <div key={i} className="border-b pb-2 mb-2">
            <p className="text-sm font-medium">{new Date(entry.date).toLocaleString()}</p>
            <p className="text-sm">Symptoms: {entry.symptoms.join(", ") || "None"}</p>
            <p className="text-sm">Severity: {entry.severity}</p>
            <p className="text-xs text-gray-500">{entry.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalTwin;

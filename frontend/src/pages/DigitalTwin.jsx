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

  async function clearData() {
    if (!confirm("Are you sure? This will permanently delete your entire health history and summary.")) {
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/digital-twin/clear`,
        { headers: { token: localStorage.getItem("token") } }
      );
      
      if (data.success) {
        setTwin(null); // Clear the view immediately
        alert("Health Twin cleared!");
      }
    } catch (err) {
      console.error("Failed to clear twin:", err);
      alert("Error clearing data.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-2">Your Health Digital Twin</h2>

      <div className="mb-4 text-sm text-gray-600">
        <p><strong>Risk Level:</strong> {twin.riskLevel}</p>
        <p><strong>Last Updated:</strong> {new Date(twin.lastUpdated).toLocaleString()}</p>
      </div>

      <div className="flex gap-4 mb-5">
        <button
          className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          onClick={regenerateSummary}
        >
          Refresh Summary
        </button>

        <button
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-all"
          onClick={clearData}
        >
          Reset / Clear Data
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-wrap border border-gray-100 mb-6">
        {twin.summary || twin.trendSummary || "No summary generated yet."}
      </div>

      {twin.overallDocRecommendation && twin.overallDocRecommendation.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-2xl">👨‍⚕️</div>
          <div>
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-1">
              Recommended Specialist(s)
            </h3>
            <div className="flex flex-wrap gap-2">
              {twin.overallDocRecommendation.map((doc, index) => (
                <span key={index} className="px-4 py-1 bg-white text-blue-700 text-sm font-semibold rounded-full border border-blue-200 shadow-sm">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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

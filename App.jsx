import React, { useEffect, useState } from "react";
import D3Chart from "./D3Chart";

function App() {
  const [userData, setUserData] = useState({});
  const [selectedUser, setSelectedUser] = useState("athlete1");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      const userId = parsed.userId || "athlete1";
      const timestamp = new Date().toISOString();
      const newEntry = {
        time: timestamp,
        heartRate: parsed.heartRate.valueQuantity.value,
        temperature: parsed.temperature.valueQuantity.value
      };

      setUserData(prev => {
        const updated = {
          ...prev,
          [userId]: [...(prev[userId] || []).slice(-59), newEntry]
        };
        return updated;
      });
    };

    return () => ws.close();
  }, []);

  function average(arr) {
    if (!arr.length) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  }

  function detectOutliers(arr) {
    if (!arr.length) return { count: 0, outliers: [] };

    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor(sorted.length * 3 / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = arr.filter(val => val < lowerBound || val > upperBound);
    return {
      count: outliers.length,
      outliers
    };
  }

  function getStats(arr) {
    if (!arr.length) return {
      min: 0,
      max: 0,
      mean: 0
    };

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const mean = average(arr);

    return { min, max, mean };
  }

  function downloadCSV(data) {
    if (!data.length) return;

    const headers = ["Time", "Heart Rate (bpm)", "Temperature (°C)"];
    const rows = data.map(d => [
      new Date(d.time).toISOString(),
      d.heartRate,
      d.temperature
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${selectedUser}-vitals.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const currentData = userData[selectedUser] || [];

  const hrOutliers = detectOutliers(currentData.map(d => d.heartRate));
  const tempOutliers = detectOutliers(currentData.map(d => d.temperature));

  const hrStats = getStats(currentData.map(d => d.heartRate));
  const tempStats = getStats(currentData.map(d => d.temperature));
  const totalReadings = currentData.length;
  const durationMinutes = currentData.length > 1
    ? Math.round(
        (new Date(currentData[currentData.length - 1].time) -
          new Date(currentData[0].time)) / 60000
      )
    : 0;

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f0f2f5",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px"
    }}>
      <h1 style={{ fontSize: "32px", color: "#222", marginBottom: "10px" }}>
        Real-Time Athlete Vital Dashboard
      </h1>

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "8px 12px",
          borderRadius: "6px"
        }}
      >
        <option value="athlete1">Athlete John Brown</option>
        <option value="athlete2">Athlete Abraham Steve</option>
        <option value="athlete3">Athlete Mary Jane</option>
      </select>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <D3Chart data={currentData} />

        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          minWidth: "250px"
        }}>
          <h3>Metrics</h3>
          <p>Avg HR: {average(currentData.map(d => d.heartRate))} bpm</p>
          <p>Avg Temp: {average(currentData.map(d => d.temperature))} °C</p>
          <p>Peak HR: {Math.max(...currentData.map(d => d.heartRate))} bpm</p>
          <p>Peak Temp: {Math.max(...currentData.map(d => d.temperature))} °C</p>

          <h4 style={{ marginTop: "20px" }}>Outliers</h4>
          <p>HR outliers: {hrOutliers.count}</p>
          <p>Temp outliers: {tempOutliers.count}</p>

          <h4 style={{ marginTop: "20px" }}>Retrospective Stats</h4>
          <p>Total Readings: {totalReadings}</p>
          <p>Duration: {durationMinutes} min</p>
          <p>HR: Min {hrStats.min}, Max {hrStats.max}, Avg {hrStats.mean}</p>
          <p>Temp: Min {tempStats.min}, Max {tempStats.max}, Avg {tempStats.mean}</p>

          {(currentData.length && currentData[currentData.length - 1].heartRate > 180) && (
            <div style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
              🚨 High heart rate!
            </div>
          )}

          {(currentData.length && currentData[currentData.length - 1].temperature > 39.5) && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              🔥 High temperature!
            </div>
          )}

          <button
            onClick={() => downloadCSV(currentData)}
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            📥 Save Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

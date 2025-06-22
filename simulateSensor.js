function generateFHIRVitals() {
  const now = new Date().toISOString();
  const users = ["athlete1", "athlete2", "athlete3"];
  const userId = users[Math.floor(Math.random() * users.length)];

  return {
    userId,
    heartRate: {
      resourceType: "Observation",
      id: "hr-" + Date.now(),
      code: { text: "Heart Rate" },
      valueQuantity: {
        value: Math.floor(Math.random() * 60) + 100,
        unit: "bpm"
      },
      effectiveDateTime: now
    },
    temperature: {
      resourceType: "Observation",
      id: "temp-" + Date.now(),
      code: { text: "Body Temperature" },
      valueQuantity: {
        value: (Math.random() * 2 + 36).toFixed(1),
        unit: "°C"
      },
      effectiveDateTime: now
    }
  };
}

module.exports = { generateFHIRVitals };

![Readme screenshot](https://github.com/user-attachments/assets/af5d5a0b-8419-4f81-be38-38cb58e220f0)
# Real-Time Athlete Vital Dashboard 🏃‍♂️📈

This web application provides real-time monitoring and visualization of athlete vital signs using simulated FHIR-compliant JSON data.

## 🚀 Features

- 📊 Real-time heart rate and temperature chart (via WebSocket)
- 👤 Athlete switching (3 simulated users)
- 📈 D3.js visualization with dual axes
- 📦 Box plot for heart rate distribution
- ❗ Outlier detection using IQR
- 📑 Retrospective stats (min, max, mean, duration)
- 📥 CSV download per athlete

## 🧪 Technologies

- React (Frontend)
- D3.js (Charting)
- Node.js + WebSocket (Backend)
- FHIR-style JSON format (simulated)

## 📦 Folder Structure

/backend # WebSocket + data simulation (FHIR-style)
/frontend # React + D3 chart
## 💻 How to Run It

### Backend

cd backend,
npm install,
node server.js

Runs WebSocket server on ws://localhost:3001

### Frontend

cd frontend,
npm install,
npm start

Runs frontend on http://localhost:3000

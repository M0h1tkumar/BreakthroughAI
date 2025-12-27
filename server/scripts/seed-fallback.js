const fs = require("fs");
const path = require("path");

const FALLBACK = path.join(__dirname, "..", "data", "fallback.json");

function write(data) {
  fs.writeFileSync(FALLBACK, JSON.stringify(data, null, 2), "utf8");
}

function run() {
  const doctors = [
    {
      _id: "d1",
      name: "Dr. Rajesh Khanna",
      email: "doctor@test.com",
      phone: "9876500001",
      specialty: "Cardiology",
      license: "MD001234",
      verified: true,
    },
    {
      _id: "d2",
      name: "Dr. Priya Malhotra",
      email: "doctor2@test.com",
      phone: "9876500002",
      specialty: "General Medicine",
      license: "MD001235",
      verified: true,
    },
  ];

  const patients = [
    {
      _id: "p1",
      name: "Pree Om",
      email: "pree@test.com",
      phone: "9853224443",
      age: 28,
      symptoms: ["chest pain"],
      status: "PENDING",
      dataToken: "TOKEN123456",
    },
    {
      _id: "p2",
      name: "Priya Sharma",
      email: "priya@test.com",
      phone: "9876500111",
      age: 32,
      symptoms: ["headache"],
      status: "PENDING",
    },
  ];

  const appointments = [
    {
      _id: "a1",
      patientId: "p1",
      patientName: "Pree Om",
      patientToken: "TOKEN123456",
      doctorId: "d1",
      doctorName: "Dr. Rajesh Khanna",
      date: new Date().toISOString().split("T")[0],
      time: "09:30",
      status: "SCHEDULED",
      phone: "9853224443",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "a2",
      patientId: "p2",
      patientName: "Priya Sharma",
      patientToken: null,
      doctorId: "d2",
      doctorName: "Dr. Priya Malhotra",
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
      time: "11:00",
      status: "SCHEDULED",
      phone: "9876500111",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const store = { doctors, patients, appointments };
  write(store);
  console.log("Fallback seed written to", FALLBACK);
}

run();

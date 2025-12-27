require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB for seeding");

  // Clear small collections for idempotent seed
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await Appointment.deleteMany({});

  const doctors = await Doctor.create([
    {
      name: "Dr. Rajesh Khanna",
      email: "doctor@test.com",
      phone: "9876500001",
      specialty: "Cardiology",
      license: "MD001234",
      verified: true,
    },
    {
      name: "Dr. Priya Malhotra",
      email: "doctor2@test.com",
      phone: "9876500002",
      specialty: "General Medicine",
      license: "MD001235",
      verified: true,
    },
  ]);

  const patients = await Patient.create([
    {
      name: "Pree Om",
      email: "pree@test.com",
      phone: "9853224443",
      age: 28,
      symptoms: ["chest pain"],
      status: "PENDING",
      dataToken: "TOKEN123456",
    },
    {
      name: "Priya Sharma",
      email: "priya@test.com",
      phone: "9876500111",
      age: 32,
      symptoms: ["headache"],
      status: "PENDING",
    },
  ]);

  const appointments = await Appointment.create([
    {
      patientId: patients[0]._id,
      patientName: patients[0].name,
      patientToken: patients[0].dataToken,
      doctorId: doctors[0]._id,
      doctorName: doctors[0].name,
      date: new Date().toISOString().split("T")[0],
      time: "09:30",
      status: "SCHEDULED",
      phone: patients[0].phone,
    },
    {
      patientId: patients[1]._id,
      patientName: patients[1].name,
      patientToken: patients[1].dataToken,
      doctorId: doctors[1]._id,
      doctorName: doctors[1].name,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
      time: "11:00",
      status: "SCHEDULED",
      phone: patients[1].phone,
    },
  ]);

  console.log("Seed complete:", {
    doctors: doctors.length,
    patients: patients.length,
    appointments: appointments.length,
  });
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed error", err);
  process.exit(1);
});

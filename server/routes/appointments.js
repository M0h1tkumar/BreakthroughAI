const express = require("express");
const fs = require("fs");
const path = require("path");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const db = require("../lib/db");
const logger = require("../lib/logger");
const { authenticate } = require("../middleware/auth");
const Joi = require("joi");
const router = express.Router();

const FALLBACK = path.join(__dirname, "..", "data", "fallback.json");

function readFallback() {
  try {
    return (
      JSON.parse(fs.readFileSync(FALLBACK, "utf8")) || { appointments: [] }
    );
  } catch (e) {
    return { appointments: [] };
  }
}

function writeFallback(data) {
  try {
    fs.writeFileSync(FALLBACK, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    logger.error("Failed to write fallback store", e && e.message);
  }
}

// Create appointment
const createSchema = Joi.object({
  patientId: Joi.string().required(),
  patientName: Joi.string().optional(),
  patientToken: Joi.string().optional(),
  doctorId: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  phone: Joi.string().optional(),
});

router.post("/", authenticate, async (req, res) => {
  try {
    const payload = req.body;
    const { error } = createSchema.validate(payload);
    if (error)
      return res.status(400).json({ success: false, message: error.message });
    if (
      !payload.patientId ||
      !payload.doctorId ||
      !payload.date ||
      !payload.time
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (db.isConnected()) {
      const appointment = new Appointment(payload);
      await appointment.save();
      return res.status(201).json({ success: true, data: appointment });
    }

    // fallback
    const store = readFallback();
    const id = `local-${Date.now()}`;
    const appointment = Object.assign(
      {
        _id: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      payload
    );
    store.appointments.push(appointment);
    writeFallback(store);
    res.status(201).json({ success: true, data: appointment, fallback: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all appointments (optionally filter by doctorId or patientId)
router.get("/", async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (db.isConnected()) {
      const appointments = await Appointment.find(filter).sort({
        date: 1,
        time: 1,
      });
      return res.json({ success: true, data: appointments });
    }

    const store = readFallback();
    let appointments = store.appointments || [];
    if (doctorId)
      appointments = appointments.filter(
        (a) => String(a.doctorId) === String(doctorId)
      );
    if (patientId)
      appointments = appointments.filter(
        (a) => String(a.patientId) === String(patientId)
      );
    appointments = appointments.sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date)
    );
    res.json({ success: true, data: appointments, fallback: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment by id
router.get("/:id", async (req, res) => {
  try {
    if (db.isConnected()) {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment)
        return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, data: appointment });
    }

    const store = readFallback();
    const appointment = store.appointments.find(
      (a) => String(a._id) === String(req.params.id)
    );
    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: appointment, fallback: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update appointment
router.put("/:id", async (req, res) => {
  try {
    if (db.isConnected()) {
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!appointment)
        return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, data: appointment });
    }

    const store = readFallback();
    const idx = store.appointments.findIndex(
      (a) => String(a._id) === String(req.params.id)
    );
    if (idx === -1)
      return res.status(404).json({ success: false, message: "Not found" });
    const updated = Object.assign({}, store.appointments[idx], req.body, {
      updatedAt: new Date().toISOString(),
    });
    store.appointments[idx] = updated;
    writeFallback(store);
    res.json({ success: true, data: updated, fallback: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel appointment (partial update)
router.post("/:id/cancel", async (req, res) => {
  try {
    if (db.isConnected()) {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment)
        return res.status(404).json({ success: false, message: "Not found" });
      appointment.status = "CANCELLED";
      await appointment.save();
      return res.json({ success: true, data: appointment });
    }

    const store = readFallback();
    const idx = store.appointments.findIndex(
      (a) => String(a._id) === String(req.params.id)
    );
    if (idx === -1)
      return res.status(404).json({ success: false, message: "Not found" });
    store.appointments[idx].status = "CANCELLED";
    store.appointments[idx].updatedAt = new Date().toISOString();
    writeFallback(store);
    res.json({ success: true, data: store.appointments[idx], fallback: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

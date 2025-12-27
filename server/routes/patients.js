const express = require("express");
const Patient = require("../models/Patient");
const router = express.Router();

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("assignedDoctor", "name specialty")
      .populate("reports");
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("assignedDoctor", "name specialty license")
      .populate("reports");

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new patient
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update patient
router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Assign doctor to patient and open a case
router.post("/:id/assign-doctor", async (req, res) => {
  try {
    const { doctorId, caseDetails } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    patient.assignedDoctor = doctorId;
    patient.case = {
      status: "OPEN",
      details: caseDetails || "",
      createdAt: new Date(),
    };
    await patient.save();
    const populated = await Patient.findById(patient._id).populate(
      "assignedDoctor",
      "name specialty"
    );
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve case
router.post("/:id/case/approve", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.case)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    patient.case.status = "APPROVED";
    patient.case.approvedAt = new Date();
    await patient.save();
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close case and move to history
router.post("/:id/case/close", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.case)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    const closed = {
      status: "CLOSED",
      details: patient.case.details,
      createdAt: patient.case.createdAt,
      closedAt: new Date(),
    };
    patient.caseHistory = patient.caseHistory || [];
    patient.caseHistory.push(closed);
    patient.case = undefined;
    await patient.save();
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search patients
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { symptoms: { $in: [new RegExp(query, "i")] } },
      ],
    }).populate("assignedDoctor", "name specialty");

    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

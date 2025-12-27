const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    symptoms: [{ type: String }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "COMPLETED"],
      default: "PENDING",
    },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    // Current active case (if any)
    case: {
      status: {
        type: String,
        enum: ["OPEN", "APPROVED", "CLOSED"],
        default: undefined,
      },
      details: { type: String },
      createdAt: { type: Date },
      approvedAt: { type: Date },
      closedAt: { type: Date },
    },
    // Historical closed cases
    caseHistory: [
      {
        status: { type: String },
        details: { type: String },
        createdAt: { type: Date },
        closedAt: { type: Date },
      },
    ],
    dataToken: { type: String },
    medicalHistory: { type: String },
    googleId: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);

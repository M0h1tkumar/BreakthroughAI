const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    status: {
      type: String,
      enum: ["NEW", "PENDING", "COMPLETED"],
      default: "NEW",
    },
    date: { type: Date, default: Date.now },
    content: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);

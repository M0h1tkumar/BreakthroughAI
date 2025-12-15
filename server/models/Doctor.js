const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  specialty: { type: String, required: true },
  license: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
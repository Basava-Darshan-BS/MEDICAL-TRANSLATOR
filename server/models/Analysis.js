const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rawText: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  urgentFlags: [String],
  medications: [
    {
      name: String,
      dose: String,
      frequency: String,
      purpose: String
    }
  ],
  terms: [
    {
      term: String,
      definition: String
    }
  ],
  nextSteps: [String]
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
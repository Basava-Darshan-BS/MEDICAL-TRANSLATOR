const express = require('express');
const router = express.Router();
const path = require('path');
const Document = require('../models/Document');
const Analysis = require('../models/Analysis');
const protect = require('../middleware/auth');
const { processDocument } = require('../services/aiService');

// ANALYZE A DOCUMENT
router.post('/:documentId', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if already analyzed
    const existingAnalysis = await Analysis.findOne({
      documentId: document._id
    });
    if (existingAnalysis) {
      return res.json(existingAnalysis);
    }

    // Update status to processing
    document.status = 'processing';
    await document.save();

    // Build file path
    const filePath = path.join(__dirname, '../uploads/', document.storedFilename);

    // Process with AI
    const { rawText, analysis } = await processDocument(filePath, document.mimeType);

    // Save analysis to MongoDB
    const savedAnalysis = await Analysis.create({
      documentId: document._id,
      userId: req.userId,
      rawText,
      summary: analysis.summary,
      urgentFlags: analysis.urgentFlags,
      medications: analysis.medications,
      terms: analysis.terms,
      nextSteps: analysis.nextSteps
    });

    // Update document status
    document.status = 'complete';
    await document.save();

    res.json(savedAnalysis);

  } catch (error) {
    console.error('Analysis error:', error);

    // Update document status to failed
    await Document.findByIdAndUpdate(req.params.documentId, {
      status: 'failed'
    });

    res.status(500).json({
      message: 'Analysis failed',
      error: error.message
    });
  }
});

// GET ANALYSIS for a document
router.get('/:documentId', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      documentId: req.params.documentId,
      userId: req.userId
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const Prescription = require('./Prescription');
const Reminder = require('./Reminder');
const { createRemindersFromPrescription } = require('./prescriptionService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/prescriptions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/upload', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imagePath = req.file.path;
    const imageUrl = `/uploads/prescriptions/${req.file.filename}`;
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { logger: m => console.log(m) });
    const extractedMedicines = await processPrescriptionText(text);
    const prescription = new Prescription({
      userId: req.user._id,
      imageUrl,
      originalText: text,
      extractedMedicines,
      isProcessed: true,
      processingConfidence: calculateConfidence(extractedMedicines, text)
    });
    await prescription.save();
    if (extractedMedicines.length > 0) {
      await createRemindersFromPrescription(prescription, req.user._id);
    }
    res.status(201).json({ message: 'Prescription uploaded and processed successfully', prescription, extractedMedicines });
  } catch (error) {
    console.error('Prescription upload error:', error);
    res.status(500).json({ error: 'Failed to process prescription' });
  }
});

router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    console.error('Fetch prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { extractedMedicines, doctorName, prescriptionDate, notes } = req.body;
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { extractedMedicines, doctorName, prescriptionDate, notes },
      { new: true, runValidators: true }
    );
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    if (extractedMedicines) {
      await Reminder.deleteMany({ prescriptionId: prescription._id });
      await createRemindersFromPrescription(prescription, req.user._id);
    }
    res.json({ message: 'Prescription updated successfully', prescription });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    await Reminder.deleteMany({ prescriptionId: req.params.id });
    if (prescription.imageUrl) {
      const absPath = path.join(__dirname, prescription.imageUrl);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

async function processPrescriptionText(text) {
  const medicines = [];
  const lines = text.split('\n').filter(line => line.trim());
  const patterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(\d+(?:\.\d+)?)\s*(mg|ml|g|tablet|tab|capsule|cap)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(once|twice|thrice)\s*(daily|weekly)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(\d+)\s*(times?)\s*(daily|weekly)/i
  ];
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const dosage = match[2] || '';
        const unit = match[3] || '';
        const frequency = match[4] || 'daily';
        if (medicines.find(m => m.name.toLowerCase() === name.toLowerCase())) continue;
        medicines.push({
          name,
          dosage: { amount: dosage, unit },
          frequency: { times: frequency === 'once' ? 1 : frequency === 'twice' ? 2 : frequency === 'thrice' ? 3 : 1, period: 'daily' },
          timing: [{ time: 'morning', instructions: 'Take with water' }],
          duration: { value: 7, unit: 'days' },
          instructions: 'Take as prescribed',
          beforeMeal: false,
          afterMeal: true
        });
        break;
      }
    }
  }
  return medicines;
}

function calculateConfidence(medicines, text) {
  if (medicines.length === 0) return 0;
  const textLength = text.length;
  const medicineNamesLength = medicines.reduce((sum, med) => sum + med.name.length, 0);
  const confidence = Math.min(100, (medicineNamesLength / textLength) * 1000);
  return Math.round(confidence);
}

module.exports = router;

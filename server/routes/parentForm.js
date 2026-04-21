import express from 'express';
import crypto from 'crypto';
import Child from '../models/Child.js';
import ParentFormToken from '../models/ParentFormToken.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/** Field keys staff may include on the parent questionnaire. */
export const PARENT_FORM_FIELD_DEFS = [
  { id: 'allergy', label: 'Allergy' },
  { id: 'spedCategory', label: 'SPED category' },
  { id: 'spedOtherDetail', label: 'SPED (other details)' },
  { id: 'behaviourFrankl', label: 'Behaviour (Frankl scale 1–4)' },
  { id: 'medicalOtherNotes', label: 'Medical — other notes' },
  { id: 'guardianPhone', label: 'Guardian phone' },
  { id: 'messenger', label: 'Messenger' },
  { id: 'grade', label: 'Grade' },
  { id: 'class', label: 'Class' },
  { id: 'notes', label: 'Notes' }
];

const ALLOWED_IDS = new Set(PARENT_FORM_FIELD_DEFS.map((f) => f.id));

function normalizeFieldsMap(body) {
  const raw = body?.fields;
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!ALLOWED_IDS.has(k)) continue;
    out[k] = Boolean(v);
  }
  if (Object.keys(out).length === 0) return null;
  return out;
}

function readMedical(child) {
  const mc = child?.medicalCondition;
  return mc != null && typeof mc === 'object' && !Array.isArray(mc) ? mc : {};
}

function buildInitialPayload(child, fieldsMap) {
  const mc = readMedical(child);
  const initial = {};
  if (fieldsMap.allergy) initial.allergy = mc.allergy != null ? String(mc.allergy) : '';
  if (fieldsMap.spedCategory) initial.spedCategory = mc.spedCategory != null ? String(mc.spedCategory) : '';
  if (fieldsMap.spedOtherDetail) initial.spedOtherDetail = mc.spedOtherDetail != null ? String(mc.spedOtherDetail) : '';
  if (fieldsMap.behaviourFrankl) {
    initial.behaviourFrankl =
      mc.behaviourFrankl != null && mc.behaviourFrankl !== '' ? String(mc.behaviourFrankl) : '';
  }
  if (fieldsMap.medicalOtherNotes) initial.medicalOtherNotes = mc.otherNotes != null ? String(mc.otherNotes) : '';
  if (fieldsMap.guardianPhone) initial.guardianPhone = child.guardianPhone != null ? String(child.guardianPhone) : '';
  if (fieldsMap.messenger) initial.messenger = child.messenger != null ? String(child.messenger) : '';
  if (fieldsMap.grade) initial.grade = child.grade != null ? String(child.grade) : '';
  if (fieldsMap.class) initial.class = child.class != null ? String(child.class) : '';
  if (fieldsMap.notes) initial.notes = child.notes != null ? String(child.notes) : '';
  return initial;
}

/** Public: submit parent questionnaire (must be registered before generic `/:token` handlers if any). */
router.post('/:token/submit', async (req, res) => {
  try {
    const { token } = req.params;
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    const row = await ParentFormToken.findOne({ token });
    if (!row) {
      return res.status(404).json({ ok: false, error: 'This link is not valid.' });
    }
    const now = new Date();
    if (row.usedAt) {
      return res.status(400).json({ ok: false, error: 'This form has already been submitted.' });
    }
    if (row.expiresAt && new Date(row.expiresAt) < now) {
      return res.status(400).json({ ok: false, error: 'This link has expired.' });
    }

    const fieldsMap = row.fieldsRequested && typeof row.fieldsRequested === 'object' ? row.fieldsRequested : {};
    const child = await Child.findOne({ childId: row.childId });
    if (!child) {
      return res.status(404).json({ ok: false, error: 'Patient record was removed.' });
    }

    const mc = readMedical(child);
    const nextMc = { ...mc };

    if (fieldsMap.allergy) nextMc.allergy = body.allergy != null ? String(body.allergy).trim() : '';
    if (fieldsMap.spedCategory) {
      const c = body.spedCategory != null ? String(body.spedCategory).trim().toLowerCase() : '';
      if (['', 'deaf', 'autism', 'others'].includes(c)) {
        nextMc.spedCategory = c === '' ? null : c;
      }
    }
    if (fieldsMap.spedOtherDetail) {
      nextMc.spedOtherDetail = body.spedOtherDetail != null ? String(body.spedOtherDetail).trim() : '';
    }
    if (fieldsMap.behaviourFrankl) {
      const n = parseInt(String(body.behaviourFrankl ?? ''), 10);
      nextMc.behaviourFrankl = Number.isFinite(n) && n >= 1 && n <= 4 ? n : null;
    }
    if (fieldsMap.medicalOtherNotes) {
      nextMc.otherNotes = body.medicalOtherNotes != null ? String(body.medicalOtherNotes).trim() : '';
    }

    child.medicalCondition = nextMc;
    if (fieldsMap.guardianPhone) {
      child.guardianPhone = body.guardianPhone != null ? String(body.guardianPhone).trim() || null : null;
    }
    if (fieldsMap.messenger) {
      child.messenger = body.messenger != null ? String(body.messenger).trim() || null : null;
    }
    if (fieldsMap.grade) {
      child.grade = body.grade != null ? String(body.grade).trim() || null : null;
    }
    if (fieldsMap.class) {
      child.class = body.class != null ? String(body.class).trim() || null : null;
    }
    if (fieldsMap.notes) {
      child.notes = body.notes != null ? String(body.notes).trim() || null : null;
    }

    child.updatedAt = new Date();
    await child.save();

    row.usedAt = new Date();
    await row.save();

    res.json({ ok: true });
  } catch (e) {
    console.error('parent-form submit', e);
    res.status(500).json({ ok: false, error: 'Could not save responses' });
  }
});

/** Staff: create a one-time (or 24h) parent link. */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { childId, fields } = req.body || {};
    if (!childId || typeof childId !== 'string') {
      return res.status(400).json({ error: 'childId is required' });
    }
    const fieldsMap = normalizeFieldsMap({ fields });
    if (!fieldsMap) {
      return res.status(400).json({ error: 'Select at least one field for the form' });
    }

    const child = await Child.findOne({ childId }).lean();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await ParentFormToken.create({
      token,
      childId,
      fieldsRequested: fieldsMap,
      expiresAt,
      createdBy: req.user?.username || null
    });

    res.json({
      token,
      expiresAt: expiresAt.toISOString(),
      fields: fieldsMap
    });
  } catch (e) {
    console.error('parent-form create', e);
    res.status(500).json({ error: 'Could not create form link' });
  }
});

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const row = await ParentFormToken.findOne({ token }).lean();
    if (!row) {
      return res.status(404).json({ ok: false, error: 'This link is not valid.' });
    }
    const now = new Date();
    if (row.usedAt) {
      return res.json({
        ok: false,
        expired: true,
        error: 'This form has already been submitted.'
      });
    }
    if (row.expiresAt && new Date(row.expiresAt) < now) {
      return res.json({
        ok: false,
        expired: true,
        error: 'This link has expired.'
      });
    }

    const child = await Child.findOne({ childId: row.childId }).lean();
    if (!child) {
      return res.status(404).json({ ok: false, error: 'Patient record was removed.' });
    }

    const fieldsMap = row.fieldsRequested && typeof row.fieldsRequested === 'object' ? row.fieldsRequested : {};
    const initial = buildInitialPayload(child, fieldsMap);
    const displayName = [child.firstName, child.lastName].filter(Boolean).join(' ').trim() || child.fullName || 'Patient';

    res.json({
      ok: true,
      expired: false,
      childName: displayName,
      fields: fieldsMap,
      initial,
      expiresAt: row.expiresAt
    });
  } catch (e) {
    console.error('parent-form get', e);
    res.status(500).json({ ok: false, error: 'Could not load form' });
  }
});

export default router;

/**
 * Import children and visits from CSV files into MongoDB.
 *
 * Usage:
 *   node scripts/import-csv.js [children.csv] [visits.csv]
 *
 * If paths are omitted, uses server/data/children_philippine_names_full.csv
 * and server/data/visits (1).csv
 *
 * Example with your Downloads files:
 *   node scripts/import-csv.js "/Users/zhihong/Downloads/children_philippine_names_full.csv" "/Users/zhihong/Downloads/visits (1).csv"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Child from '../models/Child.js';
import Visit from '../models/Visit.js';
import { connectDB } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

/** Parse a single CSV line respecting double-quoted fields */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (!inQuotes && c === ',') {
      result.push(current.trim());
      current = '';
    } else if (c !== '\r') current += c;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCSVLine(line));
  return { headers, rows };
}

/** Get value from row by header name (case-insensitive, trim header) */
function get(row, headers, name) {
  const i = headers.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  return i >= 0 && row[i] !== undefined ? (row[i] || '').trim() : '';
}

/** Map numeric grade to app label so graduation sort works */
const GRADE_LABELS = { 6: '6th Grade', 5: '5th Grade', 4: '4th Grade', 3: '3rd Grade', 2: '2nd Grade', 1: '1st Grade', 0: 'Kindergarten' };
function normalizeGrade(gradeStr) {
  if (!gradeStr) return gradeStr;
  const n = parseInt(gradeStr, 10);
  if (!Number.isNaN(n) && GRADE_LABELS[n] !== undefined) return GRADE_LABELS[n];
  return gradeStr;
}

async function run() {
  const defaultChildren = path.join(__dirname, '..', 'data', 'children_philippine_names_full.csv');
  const defaultVisits = path.join(__dirname, '..', 'data', 'visits (1).csv');

  const childrenPath = process.argv[2] || defaultChildren;
  const visitsPath = process.argv[3] || defaultVisits;

  if (!fs.existsSync(childrenPath)) {
    console.error('Children CSV not found:', childrenPath);
    process.exit(1);
  }
  if (!fs.existsSync(visitsPath)) {
    console.error('Visits CSV not found:', visitsPath);
    process.exit(1);
  }

  console.log('Reading', childrenPath);
  const { headers: childHeaders, rows: childRows } = parseCSV(childrenPath);
  console.log('Reading', visitsPath);
  const { headers: visitHeaders, rows: visitRows } = parseCSV(visitsPath);

  const createdBy = 'import';

  const children = childRows
    .filter((row) => row.length >= 6)
    .map((row) => {
      const childId = get(row, childHeaders, 'childId');
      let firstName = get(row, childHeaders, 'firstName');
      let lastName = get(row, childHeaders, 'lastName');
      const fullNameCol = get(row, childHeaders, 'fullName');
      let fullName = fullNameCol;
      if (firstName || lastName) {
        fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || fullNameCol;
      } else if (fullNameCol) {
        const parts = fullNameCol.trim().split(/\s+/);
        if (parts.length > 1) {
          lastName = parts.pop();
          firstName = parts.join(' ');
        } else {
          firstName = fullNameCol;
          lastName = '';
        }
      }
      const dobStr = get(row, childHeaders, 'dob');
      const sexStr = get(row, childHeaders, 'sex') || 'M';
      const school = get(row, childHeaders, 'school');
      const grade = normalizeGrade(get(row, childHeaders, 'grade'));
      const barangay = get(row, childHeaders, 'barangay') || '';
      const guardianPhone = get(row, childHeaders, 'guardianPhone');
      const sex = sexStr.toUpperCase() === 'F' ? 'F' : sexStr.toUpperCase() === 'Other' ? 'Other' : 'M';
      return {
        childId,
        fullName: fullName || [firstName, lastName].filter(Boolean).join(' '),
        firstName: firstName || null,
        lastName: lastName || null,
        dob: dobStr ? new Date(dobStr) : null,
        sex,
        school,
        grade,
        barangay,
        guardianPhone: guardianPhone || null,
        createdBy,
        updatedBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    })
    .filter((c) => c.childId && c.fullName && c.school);

  const visits = visitRows
    .filter((row) => row.length >= 9)
    .map((row) => {
      const visitId = get(row, visitHeaders, 'visitId');
      const childId = get(row, visitHeaders, 'childId');
      const dateStr = get(row, visitHeaders, 'date');
      const painFlag = get(row, visitHeaders, 'painFlag');
      const swellingFlag = get(row, visitHeaders, 'swellingFlag');
      const decayedTeeth = get(row, visitHeaders, 'decayedTeeth');
      const missingTeeth = get(row, visitHeaders, 'missingTeeth');
      const filledTeeth = get(row, visitHeaders, 'filledTeeth');
      const treatmentTypesRaw = get(row, visitHeaders, 'treatmentTypes');
      const notes = get(row, visitHeaders, 'notes');
      // Normalize semicolons to commas inside treatment details (e.g. "Permanent: 3; Temporary: 2" -> "Permanent: 3, Temporary: 2")
      const normalizeTreatment = (s) => s.replace(/;\s*/g, ', ').trim();
      const treatments = treatmentTypesRaw
        .split(',')
        .map((s) => normalizeTreatment(s.trim()))
        .filter(Boolean);
      return {
        visitId,
        childId,
        date: new Date(dateStr || Date.now()),
        painFlag: String(painFlag).toLowerCase() === 'true',
        swellingFlag: String(swellingFlag).toLowerCase() === 'true',
        decayedTeeth: parseInt(decayedTeeth, 10) || 0,
        missingTeeth: parseInt(missingTeeth, 10) || 0,
        filledTeeth: parseInt(filledTeeth, 10) || 0,
        treatmentTypes: treatments,
        notes: notes || null,
        createdBy,
        createdAt: new Date()
      };
    })
    .filter((v) => v.visitId && v.childId);

  const childIds = new Set(children.map((c) => c.childId));
  const visitsWithValidChild = visits.filter((v) => childIds.has(v.childId));
  const skippedVisits = visits.length - visitsWithValidChild.length;
  if (skippedVisits > 0) {
    console.warn(`Skipping ${skippedVisits} visits with childId not in children CSV`);
  }

  await connectDB();

  console.log('Clearing existing children and visits...');
  await Child.deleteMany({});
  await Visit.deleteMany({});

  console.log('Inserting', children.length, 'children...');
  await Child.insertMany(children);

  console.log('Inserting', visitsWithValidChild.length, 'visits...');
  await Visit.insertMany(visitsWithValidChild);

  console.log('Import done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * One-time script: generates synthetic medical PDFs for the DocWow "Surprise Me" randomizer.
 * Document content is hardcoded so no API credits are needed at runtime.
 *
 * Usage: node --env-file=.env.local ./node_modules/.bin/tsx scripts/generate-docwow-samples.ts
 *
 * Outputs:
 *   /public/sample-docs/random/*.pdf  — 14 synthetic medical PDFs
 *   /data/docwow-random-samples.json  — metadata for UploadPanel
 *
 * After running, sync to S3:
 *   aws s3 sync public/sample-docs/random/ s3://<bucket>/samples/random/
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'public', 'sample-docs', 'random');
const META_OUT = path.join(process.cwd(), 'data', 'docwow-random-samples.json');

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocSection {
  title: string;
  type: 'text' | 'table' | 'keyvalue';
  content?: string;
  rows?: Record<string, string>[];
  pairs?: { key: string; value: string }[];
}

interface GeneratedDoc {
  institutionName: string;
  documentTitle: string;
  patient: { name: string; dob: string; mrn: string; date: string; provider: string };
  sections: DocSection[];
}

interface DocSpec {
  id: string;
  filename: string;
  label: string;
  description: string;
  suggestedQuestions: string[];
  content: GeneratedDoc;
}

// ─── Document content (synthetic — no real patient data) ─────────────────────

const DOC_SPECS: DocSpec[] = [
  // ── Discharge Summaries ───────────────────────────────────────────────────
  {
    id: 'discharge-cardiac',
    filename: 'random/discharge-cardiac.pdf',
    label: 'Cardiac Discharge Summary',
    description: 'Post-STEMI discharge from Riverside Medical Center following emergent stent placement.',
    suggestedQuestions: ['What medications was I discharged on?', 'When is my cardiology follow-up?', 'What activity restrictions do I have?'],
    content: {
      institutionName: 'Riverside Medical Center — Department of Cardiology',
      documentTitle: 'Inpatient Discharge Summary',
      patient: { name: 'Robert T. Harmon', dob: '03/14/1966', mrn: '4821093', date: 'November 8, 2024', provider: 'Dr. Vivian Park, MD — Interventional Cardiology' },
      sections: [
        { title: 'Admission Diagnoses', type: 'keyvalue', pairs: [
          { key: 'Primary Dx', value: 'Acute ST-Elevation Myocardial Infarction (STEMI), anterior wall (ICD-10: I21.09)' },
          { key: 'Secondary Dx', value: 'Hypertension (I10), Hyperlipidemia (E78.5), Former tobacco use (Z87.891)' },
          { key: 'Admitted', value: 'November 4, 2024 via Emergency Department' },
          { key: 'Discharged', value: 'November 8, 2024 (4-day stay)' },
          { key: 'Disposition', value: 'Home with outpatient cardiology follow-up' },
        ]},
        { title: 'Hospital Course', type: 'text', content: 'Mr. Harmon, a 58-year-old male with known hypertension and hyperlipidemia, presented to the Emergency Department with acute onset substernal chest pressure radiating to the left arm, associated with diaphoresis and shortness of breath. ECG on arrival demonstrated 3mm ST elevations in leads V1-V4 consistent with anterior STEMI. He was taken emergently to the cardiac catheterization laboratory.\n\nCoronary angiography revealed 100% thrombotic occlusion of the proximal left anterior descending (LAD) artery. Successful primary percutaneous coronary intervention (PCI) was performed with aspiration thrombectomy followed by deployment of a 3.5 x 28mm Synergy drug-eluting stent to the proximal LAD. TIMI III flow was restored. Residual disease in the mid-circumflex (60% stenosis) was noted and deferred for staged intervention.\n\nPost-procedure, the patient was monitored in the Cardiac Care Unit for 48 hours. Echocardiogram on hospital day 2 demonstrated an ejection fraction of 42% with anterior wall hypokinesis. He remained hemodynamically stable throughout, with no arrhythmias, recurrent ischemia, or heart failure. He was advanced to a cardiac rehabilitation-appropriate activity level prior to discharge.' },
        { title: 'Discharge Medications', type: 'keyvalue', pairs: [
          { key: 'Aspirin', value: '81mg PO daily — lifelong (do not discontinue)' },
          { key: 'Ticagrelor (Brilinta)', value: '90mg PO twice daily x 12 months minimum' },
          { key: 'Metoprolol Succinate', value: '25mg PO daily — titrate at follow-up' },
          { key: 'Atorvastatin', value: '80mg PO nightly — high-intensity statin' },
          { key: 'Lisinopril', value: '5mg PO daily — for reduced EF post-MI' },
          { key: 'Nitroglycerin SL', value: '0.4mg PRN chest pain — call 911 if no relief in 5 min' },
        ]},
        { title: 'Follow-Up Instructions', type: 'text', content: 'Cardiology follow-up is scheduled with Dr. Park in 7 days (November 15, 2024) at Riverside Heart Institute. A repeat echocardiogram will be performed at 6 weeks to reassess ejection fraction and guide further titration of heart failure medications.\n\nActivity restrictions: No lifting over 10 pounds for 2 weeks. Resume walking gradually as tolerated. No driving for 1 week or while taking opioid pain medications. Sexual activity may resume after clearance at follow-up visit.\n\nDiet: Low sodium (<2g/day), low saturated fat. Cardiology dietitian referral placed. Cardiac rehabilitation referral submitted to outpatient CR program — patient should expect contact within 2 weeks.\n\nEmergency precautions: Return to ED immediately for any recurrent chest pain, shortness of breath at rest, palpitations, lightheadedness, or leg swelling.' },
      ],
    },
  },
  {
    id: 'discharge-orthopedic',
    filename: 'random/discharge-orthopedic.pdf',
    label: 'Orthopedic Discharge Summary',
    description: 'Total right knee replacement discharge with physical therapy and wound care instructions.',
    suggestedQuestions: ['When can I bear full weight?', 'What are the signs of infection to watch for?', 'When do I start physical therapy?'],
    content: {
      institutionName: 'Summit Orthopedic Institute — Joint Replacement Program',
      documentTitle: 'Surgical Discharge Summary',
      patient: { name: 'Margaret A. Caldwell', dob: '09/22/1957', mrn: '3047281', date: 'October 16, 2024', provider: 'Dr. James H. Weston, MD — Orthopedic Surgery' },
      sections: [
        { title: 'Procedure Summary', type: 'keyvalue', pairs: [
          { key: 'Procedure', value: 'Right Total Knee Arthroplasty (TKA)' },
          { key: 'Indication', value: 'Severe tricompartmental osteoarthritis, right knee (M17.11)' },
          { key: 'Date of Surgery', value: 'October 14, 2024' },
          { key: 'Anesthesia', value: 'Spinal with sedation, adductor canal nerve block' },
          { key: 'EBL', value: 'Approximately 150 mL' },
          { key: 'LOS', value: '2 days (discharged to home)' },
        ]},
        { title: 'Hospital Course', type: 'text', content: 'Ms. Caldwell, a 67-year-old female, underwent elective right total knee arthroplasty for end-stage tricompartmental osteoarthritis with significant functional limitation despite conservative management including physical therapy, intra-articular injections, and NSAIDs. Preoperative radiographs demonstrated severe medial and lateral joint space narrowing with varus deformity.\n\nIntraoperatively, a cemented posterior-stabilized implant system was utilized (Stryker Triathlon, femur size 5, tibia size 4, 10mm PE insert). Patella was resurfaced. Intraoperative range of motion achieved was 0-125 degrees. Wound closed in layers over a drain, which was removed on POD1 with 40 mL output.\n\nPhysical and occupational therapy were initiated on postoperative day 1. Patient demonstrated ambulation with a walker, stair negotiation, and independence with home exercise program prior to discharge. DVT prophylaxis was provided with enoxaparin and sequential compression devices. No complications were noted.' },
        { title: 'Wound Care and Activity', type: 'text', content: 'Wound: Keep incision clean and dry. No submerging in water until cleared by surgeon (typically 3 weeks). Staples will be removed at 2-week follow-up visit. Watch for signs of infection: increasing redness, warmth, swelling, purulent drainage, fever >101.5°F, or wound separation.\n\nWeight-bearing: Full weight bearing as tolerated immediately with front-wheeled walker. Progress to cane when comfortable (typically 2-4 weeks). Avoid kneeling, squatting, or pivoting on the operative knee for 6 weeks.\n\nExercises: Perform home exercise program 3x daily: ankle pumps, quad sets, short arc quads, straight leg raises, heel slides. Ice knee 20 minutes several times daily for swelling and pain.' },
        { title: 'Discharge Medications', type: 'keyvalue', pairs: [
          { key: 'Enoxaparin (Lovenox)', value: '40mg subcutaneous daily x 10 days — DVT prevention' },
          { key: 'Oxycodone', value: '5mg PO q4-6h PRN severe pain — taper as tolerated' },
          { key: 'Meloxicam', value: '15mg PO daily with food x 4 weeks — take with opioid or alone' },
          { key: 'Acetaminophen', value: '1000mg PO q8h scheduled x 2 weeks' },
          { key: 'Omeprazole', value: '20mg PO daily — GI protection while on meloxicam' },
        ]},
      ],
    },
  },
  {
    id: 'discharge-oncology',
    filename: 'random/discharge-oncology.pdf',
    label: 'Oncology Admission Note',
    description: 'Chemotherapy cycle hospitalization for breast cancer with neutropenic fever management.',
    suggestedQuestions: ['What was my neutrophil count at discharge?', 'When is my next chemo cycle?', 'What symptoms should prompt me to call the oncology team?'],
    content: {
      institutionName: 'Westview Cancer Center — Oncology Inpatient Unit',
      documentTitle: 'Inpatient Discharge Summary — Oncology',
      patient: { name: 'Patricia G. Morales', dob: '07/03/1971', mrn: '5509374', date: 'September 30, 2024', provider: 'Dr. Anita Sharma, MD — Medical Oncology' },
      sections: [
        { title: 'Oncology Background', type: 'keyvalue', pairs: [
          { key: 'Diagnosis', value: 'Stage IIIA Invasive Ductal Carcinoma, Left Breast (C50.912)' },
          { key: 'Receptor Status', value: 'ER+/PR+/HER2- (Luminal B)' },
          { key: 'Treatment Regimen', value: 'AC-T (Doxorubicin/Cyclophosphamide x 4, then Paclitaxel x 12)' },
          { key: 'Current Cycle', value: 'AC Cycle 3, Day 14 — admitted for febrile neutropenia' },
          { key: 'Admitted', value: 'September 25, 2024' },
          { key: 'Discharged', value: 'September 30, 2024 (5-day stay)' },
        ]},
        { title: 'Admission Course', type: 'text', content: 'Ms. Morales, a 53-year-old female undergoing neoadjuvant chemotherapy for stage IIIA breast cancer, presented with fever of 38.9°C on day 14 of her third AC cycle. She reported fatigue, mild pharyngitis, and no localizing symptoms. Initial CBC demonstrated ANC of 280 cells/mcL consistent with febrile neutropenia (ANC <500 with fever).\n\nBlood cultures x2 sets, urinalysis, chest X-ray, and pharyngeal cultures were obtained. She was admitted and started empirically on cefepime 2g IV q8h per febrile neutropenia protocol. Blood cultures drawn on admission remained negative at 5 days. Urine culture demonstrated no growth. Chest X-ray showed no pneumonia or effusion. CRP was 148 on admission, trending down to 38 by hospital day 4.\n\nANC nadir was 180 on hospital day 2, recovering to 1,420 by day 5. Filgrastim (G-CSF) 480mcg subcutaneous daily was administered for 3 days. Antibiotics were de-escalated to oral amoxicillin-clavulanate on hospital day 4. Patient remained afebrile for 48 hours prior to discharge.' },
        { title: 'Labs at Discharge', type: 'table', rows: [
          { Test: 'WBC', Result: '4.8', Units: 'K/uL', Reference: '4.5-11.0', Flag: '' },
          { Test: 'ANC', Result: '1,420', Units: 'cells/mcL', Reference: '>1500', Flag: 'L' },
          { Test: 'Hemoglobin', Result: '10.2', Units: 'g/dL', Reference: '12.0-16.0', Flag: 'L' },
          { Test: 'Platelets', Result: '187', Units: 'K/uL', Reference: '150-400', Flag: '' },
          { Test: 'CRP', Result: '38', Units: 'mg/L', Reference: '<10', Flag: 'H' },
          { Test: 'Creatinine', Result: '0.9', Units: 'mg/dL', Reference: '0.5-1.1', Flag: '' },
        ]},
        { title: 'Next Steps and Instructions', type: 'text', content: 'AC Cycle 4 is tentatively scheduled for October 14, 2024 (14 days from now), pending ANC recovery and oncology visit. She will be seen in clinic on October 7 for CBC recheck and symptom assessment.\n\nFilgrastim prophylaxis will be added for all remaining cycles to reduce risk of future neutropenic events. Patient was counseled on neutropenic precautions: avoid crowds, raw foods, and persons with active infections. Threshold for ER evaluation: any fever >38.1°C or chills, regardless of other symptoms. She should call the oncology nurse line before presenting to any outside ED.' },
      ],
    },
  },
  {
    id: 'discharge-pediatric',
    filename: 'random/discharge-pediatric.pdf',
    label: 'Pediatric Discharge Summary',
    description: 'Appendectomy discharge for an 11-year-old with post-op recovery instructions.',
    suggestedQuestions: ['When can my child return to school?', 'What pain medications are approved?', 'What are warning signs to go back to the ER?'],
    content: {
      institutionName: "Children's Regional Medical Center — Pediatric Surgery",
      documentTitle: 'Pediatric Inpatient Discharge Summary',
      patient: { name: 'Ethan R. Fletcher (Age 11)', dob: '02/17/2013', mrn: '8834021', date: 'October 22, 2024', provider: 'Dr. Linda Osei, MD — Pediatric Surgery' },
      sections: [
        { title: 'Procedure and Diagnosis', type: 'keyvalue', pairs: [
          { key: 'Diagnosis', value: 'Acute appendicitis, uncomplicated (K37)' },
          { key: 'Procedure', value: 'Laparoscopic appendectomy (3-port technique)' },
          { key: 'Date of Surgery', value: 'October 21, 2024' },
          { key: 'Pathology', value: 'Acute appendicitis without perforation or periappendiceal abscess — pending final' },
          { key: 'LOS', value: '1 day (discharged to home with parents)' },
        ]},
        { title: 'Hospital Course', type: 'text', content: 'Ethan, an 11-year-old male, presented to the pediatric emergency department with 14 hours of periumbilical pain migrating to the right lower quadrant, low-grade fever (38.2°C), nausea, and anorexia. WBC was 14,200 with neutrophilia. CT abdomen/pelvis demonstrated a dilated (9mm), non-compressible appendix with periappendiceal fat stranding, consistent with acute appendicitis. No perforation or abscess was identified.\n\nHe was taken to the operating room that evening for laparoscopic appendectomy. The procedure was performed without complication. The appendix was acutely inflamed but non-perforated. He was started on clear liquids postoperatively and advanced to a regular diet by the following morning. Pain was well-controlled with oral acetaminophen and ibuprofen. He ambulated without difficulty and met all discharge criteria by postoperative day 1.' },
        { title: 'Home Medications', type: 'keyvalue', pairs: [
          { key: 'Acetaminophen', value: '400mg (Children\'s) PO q6h PRN pain — do not exceed 5 doses/day' },
          { key: 'Ibuprofen', value: '300mg PO q8h PRN pain (with food) — alternate with acetaminophen' },
          { key: 'Augmentin (Amox-Clav)', value: '500/125mg PO twice daily x 3 days — complete full course' },
        ]},
        { title: 'Recovery and Activity Instructions', type: 'text', content: 'Activity: Rest for 2-3 days at home. Light activity (short walks) encouraged after 48 hours. No sports, gym class, swimming, or running for 2 weeks. No lifting over 10 pounds for 2 weeks.\n\nSchool: May return to school in 3-5 days when pain-free on oral medications and tolerating normal diet. Please bring this note to school nurse.\n\nDiet: Regular diet as tolerated. Start with bland foods if nausea persists. Encourage fluids.\n\nWound care: Keep the 3 small incision sites clean and dry. Steri-strips will fall off on their own in 7-10 days. Shower is fine after 48 hours; pat dry. No baths or swimming until follow-up.\n\nReturn to ER immediately for: fever >38.5°C, increasing abdominal pain or distension, vomiting that prevents oral intake, wound redness/swelling/drainage, or any concerning symptoms. Follow-up with Dr. Osei in 2 weeks.' },
      ],
    },
  },

  // ── Lab Reports ───────────────────────────────────────────────────────────
  {
    id: 'labs-metabolic',
    filename: 'random/labs-metabolic.pdf',
    label: 'Comprehensive Metabolic Panel',
    description: 'CBC and CMP with flagged values for a diabetic hypertension patient.',
    suggestedQuestions: ['Which of my results are out of range?', 'Is my kidney function normal?', 'What does my glucose level mean?'],
    content: {
      institutionName: 'MedQuest Diagnostic Laboratories — Clinical Chemistry',
      documentTitle: 'Comprehensive Laboratory Report',
      patient: { name: 'Howard J. Kimura', dob: '11/28/1972', mrn: '2291847', date: 'October 3, 2024 — Collected 07:42 AM (Fasting)', provider: 'Dr. Rachel Bloom, MD — Internal Medicine' },
      sections: [
        { title: 'Comprehensive Metabolic Panel', type: 'table', rows: [
          { Test: 'Sodium', Result: '139', Units: 'mEq/L', Reference: '136-145', Flag: '' },
          { Test: 'Potassium', Result: '4.1', Units: 'mEq/L', Reference: '3.5-5.1', Flag: '' },
          { Test: 'Chloride', Result: '101', Units: 'mEq/L', Reference: '98-107', Flag: '' },
          { Test: 'CO2 (Bicarb)', Result: '24', Units: 'mEq/L', Reference: '22-29', Flag: '' },
          { Test: 'BUN', Result: '22', Units: 'mg/dL', Reference: '7-25', Flag: '' },
          { Test: 'Creatinine', Result: '1.38', Units: 'mg/dL', Reference: '0.74-1.35', Flag: 'H' },
          { Test: 'eGFR', Result: '58', Units: 'mL/min/1.73m²', Reference: '>60', Flag: 'L' },
          { Test: 'Glucose (Fasting)', Result: '187', Units: 'mg/dL', Reference: '70-99', Flag: 'H' },
          { Test: 'Calcium', Result: '9.4', Units: 'mg/dL', Reference: '8.6-10.3', Flag: '' },
          { Test: 'Total Protein', Result: '7.1', Units: 'g/dL', Reference: '6.3-8.2', Flag: '' },
          { Test: 'Albumin', Result: '4.0', Units: 'g/dL', Reference: '3.5-5.0', Flag: '' },
          { Test: 'AST', Result: '28', Units: 'U/L', Reference: '10-40', Flag: '' },
          { Test: 'ALT', Result: '34', Units: 'U/L', Reference: '7-56', Flag: '' },
          { Test: 'Alk Phosphatase', Result: '82', Units: 'U/L', Reference: '44-147', Flag: '' },
          { Test: 'Total Bilirubin', Result: '0.7', Units: 'mg/dL', Reference: '0.1-1.2', Flag: '' },
        ]},
        { title: 'Complete Blood Count', type: 'table', rows: [
          { Test: 'WBC', Result: '7.8', Units: 'K/uL', Reference: '4.5-11.0', Flag: '' },
          { Test: 'RBC', Result: '4.2', Units: 'M/uL', Reference: '4.7-6.1', Flag: 'L' },
          { Test: 'Hemoglobin', Result: '11.2', Units: 'g/dL', Reference: '13.5-17.5', Flag: 'L' },
          { Test: 'Hematocrit', Result: '34.1', Units: '%', Reference: '41-53', Flag: 'L' },
          { Test: 'MCV', Result: '81', Units: 'fL', Reference: '80-100', Flag: '' },
          { Test: 'Platelets', Result: '224', Units: 'K/uL', Reference: '150-400', Flag: '' },
          { Test: 'Neutrophils %', Result: '62', Units: '%', Reference: '50-70', Flag: '' },
          { Test: 'Lymphocytes %', Result: '28', Units: '%', Reference: '20-40', Flag: '' },
        ]},
        { title: 'Physician Notes', type: 'text', content: 'Results reviewed by Dr. Rachel Bloom, MD on October 3, 2024.\n\nFlagged values of clinical concern:\n- Elevated fasting glucose (187 mg/dL): Consistent with poorly controlled type 2 diabetes. HbA1c pending. Medication adjustment warranted at next visit.\n- Elevated creatinine (1.38) with mildly reduced eGFR (58): Suggests early stage CKD (Stage G3a), likely diabetic nephropathy. Urine albumin-creatinine ratio ordered. Nephrology referral considered if trend continues.\n- Low hemoglobin/hematocrit: Mild normocytic anemia. Iron studies and reticulocyte count ordered to characterize further.\n\nPatient contacted by nursing staff. Follow-up appointment scheduled in 4 weeks.' },
      ],
    },
  },
  {
    id: 'labs-thyroid',
    filename: 'random/labs-thyroid.pdf',
    label: 'Thyroid and Lipid Panel',
    description: 'Annual thyroid function tests and fasting lipid profile showing elevated LDL.',
    suggestedQuestions: ['Is my thyroid function normal?', 'Should I be worried about my cholesterol?', 'What does my TSH level indicate?'],
    content: {
      institutionName: 'LabCore Diagnostics — Endocrine and Lipid Panel',
      documentTitle: 'Annual Preventive Laboratory Results',
      patient: { name: 'Sandra K. Whitmore', dob: '04/11/1980', mrn: '7712849', date: 'September 12, 2024 — Fasting 12 hours', provider: 'Dr. Michael Torres, MD — Family Medicine' },
      sections: [
        { title: 'Thyroid Function Panel', type: 'table', rows: [
          { Test: 'TSH (3rd Generation)', Result: '3.21', Units: 'mIU/L', Reference: '0.40-4.50', Flag: '' },
          { Test: 'Free T4 (Thyroxine)', Result: '1.12', Units: 'ng/dL', Reference: '0.82-1.77', Flag: '' },
          { Test: 'Free T3 (Triiodothyronine)', Result: '3.05', Units: 'pg/mL', Reference: '2.0-4.4', Flag: '' },
          { Test: 'Anti-TPO Antibodies', Result: '12', Units: 'IU/mL', Reference: '<35', Flag: '' },
        ]},
        { title: 'Fasting Lipid Profile', type: 'table', rows: [
          { Test: 'Total Cholesterol', Result: '241', Units: 'mg/dL', Reference: '<200', Flag: 'H' },
          { Test: 'LDL Cholesterol', Result: '158', Units: 'mg/dL', Reference: '<130', Flag: 'H' },
          { Test: 'HDL Cholesterol', Result: '48', Units: 'mg/dL', Reference: '>50 (F)', Flag: 'L' },
          { Test: 'Triglycerides (Fasting)', Result: '175', Units: 'mg/dL', Reference: '<150', Flag: 'H' },
          { Test: 'Non-HDL Cholesterol', Result: '193', Units: 'mg/dL', Reference: '<160', Flag: 'H' },
          { Test: 'LDL/HDL Ratio', Result: '3.3', Units: 'ratio', Reference: '<3.5', Flag: '' },
          { Test: 'Total/HDL Ratio', Result: '5.0', Units: 'ratio', Reference: '<5.0', Flag: '' },
        ]},
        { title: 'Additional Metabolic', type: 'table', rows: [
          { Test: 'Fasting Glucose', Result: '94', Units: 'mg/dL', Reference: '70-99', Flag: '' },
          { Test: 'HbA1c', Result: '5.4', Units: '%', Reference: '<5.7', Flag: '' },
          { Test: 'hs-CRP', Result: '2.8', Units: 'mg/L', Reference: '<3.0', Flag: '' },
          { Test: 'Vitamin D (25-OH)', Result: '22', Units: 'ng/mL', Reference: '30-100', Flag: 'L' },
        ]},
        { title: 'Clinical Summary', type: 'text', content: 'Thyroid function is within normal limits. No evidence of hypothyroidism or hyperthyroidism. Anti-TPO antibodies are negative, making autoimmune thyroid disease (Hashimoto\'s) unlikely. No thyroid medication changes needed.\n\nLipid panel shows borderline high total cholesterol and elevated LDL with low-normal HDL and mildly elevated triglycerides. 10-year ASCVD risk calculated at 7.2% (intermediate risk). Per ACC/AHA guidelines, a discussion of statin therapy is warranted. Dietary counseling referral placed.\n\nRecommendations: (1) Dietary modification: reduce saturated fat, increase soluble fiber and omega-3 fatty acids. (2) Increase aerobic exercise to 150 min/week. (3) Vitamin D supplementation 2000 IU daily recommended. (4) Repeat lipid panel in 3 months after lifestyle intervention before statin initiation decision. (5) Discuss statin therapy at next visit if LDL remains above 130.' },
      ],
    },
  },
  {
    id: 'labs-diabetes',
    filename: 'random/labs-diabetes.pdf',
    label: 'Diabetes Monitoring Panel',
    description: 'HbA1c, fasting glucose, and urinalysis for a Type 2 diabetes management visit.',
    suggestedQuestions: ['What is my HbA1c and what does it mean?', 'Is there protein in my urine?', 'How does my glucose control compare to last visit?'],
    content: {
      institutionName: 'Clearwater Internal Medicine — Diabetes Management Program',
      documentTitle: 'Quarterly Diabetes Monitoring Labs',
      patient: { name: 'Franklin D. Nguyen', dob: '06/29/1963', mrn: '1182734', date: 'October 8, 2024 — Fasting', provider: 'Dr. Sandra Levy, MD, CDE — Endocrinology' },
      sections: [
        { title: 'Glycemic Control', type: 'table', rows: [
          { Test: 'HbA1c (Current)', Result: '8.2', Units: '%', Reference: '<7.0 (diabetic goal)', Flag: 'H' },
          { Test: 'HbA1c (6 months ago)', Result: '7.9', Units: '%', Reference: '<7.0', Flag: 'H' },
          { Test: 'HbA1c (12 months ago)', Result: '7.6', Units: '%', Reference: '<7.0', Flag: 'H' },
          { Test: 'Fasting Glucose', Result: '198', Units: 'mg/dL', Reference: '70-130 (diabetic)', Flag: 'H' },
          { Test: 'C-Peptide', Result: '1.8', Units: 'ng/mL', Reference: '0.8-3.1', Flag: '' },
          { Test: 'Fasting Insulin', Result: '18', Units: 'uIU/mL', Reference: '2.6-24.9', Flag: '' },
        ]},
        { title: 'Renal Function and Urinalysis', type: 'table', rows: [
          { Test: 'Creatinine (Serum)', Result: '1.05', Units: 'mg/dL', Reference: '0.74-1.35', Flag: '' },
          { Test: 'eGFR', Result: '74', Units: 'mL/min/1.73m²', Reference: '>60', Flag: '' },
          { Test: 'Urine Albumin', Result: '42', Units: 'mg/g creatinine', Reference: '<30', Flag: 'H' },
          { Test: 'Urine Creatinine', Result: '88', Units: 'mg/dL', Reference: '—', Flag: '' },
          { Test: 'Urine Glucose', Result: 'Positive', Units: '—', Reference: 'Negative', Flag: 'H' },
          { Test: 'Urine pH', Result: '6.0', Units: '—', Reference: '4.5-8.0', Flag: '' },
          { Test: 'Urine Protein', Result: 'Trace', Units: '—', Reference: 'Negative', Flag: 'A' },
        ]},
        { title: 'Lipids and Cardiovascular Risk', type: 'table', rows: [
          { Test: 'LDL Cholesterol', Result: '72', Units: 'mg/dL', Reference: '<70 (diabetic)', Flag: 'H' },
          { Test: 'HDL Cholesterol', Result: '44', Units: 'mg/dL', Reference: '>40 (M)', Flag: '' },
          { Test: 'Triglycerides', Result: '218', Units: 'mg/dL', Reference: '<150', Flag: 'H' },
          { Test: 'Blood Pressure', Result: '144/88', Units: 'mmHg', Reference: '<130/80 (DM)', Flag: 'H' },
        ]},
        { title: 'Assessment and Plan', type: 'text', content: 'HbA1c is 8.2%, worsening from 7.9% (6 months ago) and 7.6% (12 months ago). This upward trend despite current regimen (Metformin 1000mg BID + Glipizide 10mg BID) indicates inadequate glycemic control. Recommend adding a GLP-1 receptor agonist (semaglutide 0.5mg weekly) to the regimen — this will also address elevated triglycerides and provide cardiovascular benefit.\n\nMicroalbuminuria (urine albumin 42 mg/g) indicates early diabetic nephropathy. Initiating ACE inhibitor (Lisinopril 5mg daily) for renoprotection. Recheck urine albumin in 3 months.\n\nLDL slightly above goal despite atorvastatin 40mg. Increasing to 80mg for more aggressive lipid management given diabetic cardiovascular risk. Triglycerides elevated — will reassess after glycemic improvement and GLP-1 initiation.\n\nBlood pressure above goal. Adding Amlodipine 5mg daily and increasing home monitoring frequency to twice weekly. Return in 3 months for full reassessment.' },
      ],
    },
  },

  // ── Radiology Reports ─────────────────────────────────────────────────────
  {
    id: 'radiology-chest-ct',
    filename: 'random/radiology-chest-ct.pdf',
    label: 'Chest CT Report',
    description: 'CT pulmonary angiography for suspected PE with incidental lung nodule finding.',
    suggestedQuestions: ['Was a pulmonary embolism found?', 'What does the lung nodule mean?', 'What follow-up imaging is recommended?'],
    content: {
      institutionName: 'Northgate Radiology Associates — Thoracic Imaging',
      documentTitle: 'CT Pulmonary Angiography (CTPA) Report',
      patient: { name: 'Ashley M. Reyes', dob: '08/09/1989', mrn: '9032561', date: 'November 1, 2024 at 14:32', provider: 'Dr. Karen Hoffmann, MD — Diagnostic Radiology' },
      sections: [
        { title: 'Clinical Indication', type: 'text', content: 'Ordering physician: Dr. P. Mathews, MD (Emergency Medicine). Clinical concern for pulmonary embolism. Patient is a 35-year-old female presenting with 3 days of right-sided pleuritic chest pain, mild dyspnea, and tachycardia (HR 108). Wells PE score: 4.5 (moderate probability). D-dimer: 1.82 mcg/mL (elevated). Oral contraceptive use noted.' },
        { title: 'Technique', type: 'keyvalue', pairs: [
          { key: 'Study', value: 'CT Pulmonary Angiography (CTPA) with IV contrast' },
          { key: 'Contrast', value: 'Isovue 370, 100 mL IV — bolus tracking technique' },
          { key: 'kVp / mAs', value: '100 kVp / automated mA (SmartmA)' },
          { key: 'Slice Thickness', value: '1.25 mm reconstructions' },
          { key: 'Radiation DLP', value: '312 mGy-cm' },
        ]},
        { title: 'Findings', type: 'text', content: 'PULMONARY VASCULATURE: The main pulmonary artery and bilateral central, lobar, segmental, and subsegmental pulmonary arteries opacify normally with contrast. No intraluminal filling defects are identified. No evidence of pulmonary embolism.\n\nLUNGS AND AIRWAYS: Lungs are clear bilaterally without consolidation, ground glass opacity, or pleural effusion of significance. There are trace bilateral pleural effusions (estimated <30 mL each), likely reactive. There is a solitary, well-circumscribed, non-calcified pulmonary nodule in the right lower lobe measuring 6mm in greatest dimension. No satellite nodules. No mediastinal or hilar lymphadenopathy. Visualized airways patent without endobronchial lesion.\n\nHEART AND MEDIASTINUM: Heart size normal. No pericardial effusion. Mediastinal contour unremarkable. No aortic abnormality on limited non-gated assessment.\n\nBONES AND SOFT TISSUES: No suspicious osseous lesion. No significant subcutaneous abnormality.' },
        { title: 'Impression', type: 'text', content: '1. NO PULMONARY EMBOLISM identified on CT pulmonary angiography.\n\n2. Solitary 6mm right lower lobe pulmonary nodule. Given patient age (35 years) and no documented high-risk smoking history, this is most likely benign. Per Fleischner Society 2017 Guidelines for incidental pulmonary nodules in low-risk individuals: recommend CT chest follow-up at 12 months to confirm stability.\n\n3. Trace bilateral pleural effusions, likely reactive in context of clinical presentation — no intervention required.\n\nReport finalized by Dr. Karen Hoffmann, MD, Board-Certified Diagnostic Radiologist, November 1, 2024 at 16:18.' },
      ],
    },
  },
  {
    id: 'radiology-mri-brain',
    filename: 'random/radiology-mri-brain.pdf',
    label: 'MRI Brain Report',
    description: 'Brain MRI with and without contrast for headache workup — normal study.',
    suggestedQuestions: ['Was anything abnormal found on my brain MRI?', 'Do I need any additional imaging?', 'What does the radiologist recommend?'],
    content: {
      institutionName: 'Advanced Neuroradiology Center — MRI Suite 3',
      documentTitle: 'MRI Brain with and without Gadolinium Contrast',
      patient: { name: 'Tyler S. Okonkwo', dob: '05/22/1995', mrn: '6640183', date: 'October 29, 2024 at 09:15', provider: 'Dr. Marcus Chen, MD — Neuroradiology' },
      sections: [
        { title: 'Clinical Indication', type: 'text', content: 'Ordering physician: Dr. N. Patel, MD (Neurology). Patient is a 29-year-old male with 6-month history of recurrent severe headaches, predominantly bifrontal, associated with photophobia and mild nausea. No focal neurological deficits on examination. Tension-type headache vs. migraine vs. secondary cause. MRI brain requested to exclude structural etiology.' },
        { title: 'Technique', type: 'keyvalue', pairs: [
          { key: 'Field Strength', value: '3 Tesla (Siemens Prisma)' },
          { key: 'Sequences', value: 'T1 sagittal, T2 axial, FLAIR axial, DWI, SWI, T1 post-contrast (axial, coronal, sagittal)' },
          { key: 'Contrast Agent', value: 'Gadavist (gadobutrol) 0.1 mmol/kg IV — no adverse reaction' },
          { key: 'Study Quality', value: 'Excellent — no motion artifact' },
        ]},
        { title: 'Findings', type: 'text', content: 'BRAIN PARENCHYMA: No acute intracranial abnormality. No infarct on DWI/ADC sequences. Brain parenchymal signal intensity normal on T1, T2, and FLAIR sequences. No areas of abnormal T2/FLAIR signal hyperintensity in the white matter to suggest demyelination, vasculopathy, or prior ischemic change. Gray-white matter differentiation preserved throughout.\n\nMASS EFFECT AND MIDLINE: No mass, mass effect, or midline shift. Sulci and gyri normal in appearance and distribution for patient age. No herniation.\n\nVENTRICLES AND CSF SPACES: Ventricles normal in size and configuration. No hydrocephalus. Basal cisterns patent. No extra-axial collection.\n\nPOSTERIOR FOSSA: Cerebellar hemispheres, vermis, and brainstem morphologically normal. Cranial nerve VII/VIII complex normal bilaterally on thin-slice sequences. No cerebellopontine angle lesion.\n\nVASCULAR: No cerebral cavernous malformation on SWI. No arteriovenous malformation. Caliber of intracranial vessels normal on incidental assessment.\n\nGADOLINIUM POST-CONTRAST: No abnormal parenchymal, meningeal, or ependymal enhancement. No mass with enhancement.\n\nORBITS AND PARANASAL SINUSES (incidental): Mild mucosal thickening bilateral maxillary sinuses — nonspecific, likely chronic sinusitis. No orbital lesion.' },
        { title: 'Impression', type: 'text', content: '1. NORMAL MRI BRAIN with and without gadolinium contrast. No structural explanation identified for patient\'s headache syndrome.\n\n2. Mild bilateral maxillary sinus mucosal thickening — incidental, clinically correlate.\n\nNo further neuroimaging indicated at this time. Clinical management should proceed per neurological assessment. Consider headache diary and outpatient neurology follow-up for management of primary headache disorder.\n\nReport dictated and finalized by Dr. Marcus Chen, MD, Certificate of Added Qualification in Neuroradiology, October 29, 2024 at 11:42.' },
      ],
    },
  },
  {
    id: 'radiology-abdominal-us',
    filename: 'random/radiology-abdominal-us.pdf',
    label: 'Abdominal Ultrasound Report',
    description: 'Right upper quadrant ultrasound showing cholelithiasis without acute cholecystitis.',
    suggestedQuestions: ['Do I have gallstones?', 'Is my liver normal?', 'Does this explain my abdominal pain?'],
    content: {
      institutionName: 'Pacific Imaging Associates — Abdominal Ultrasound',
      documentTitle: 'Right Upper Quadrant Ultrasound Report',
      patient: { name: 'Diana R. Kowalczyk', dob: '12/04/1983', mrn: '4417320', date: 'November 5, 2024 at 11:00', provider: 'Dr. Samuel Park, MD — Abdominal Radiology' },
      sections: [
        { title: 'Clinical Indication', type: 'text', content: 'Ordering physician: Dr. T. Johnson, MD (General Surgery). Patient is a 41-year-old female with 6-month history of recurrent right upper quadrant abdominal pain, described as crampy and episodic, typically occurring 30-60 minutes after fatty meals and lasting 1-4 hours. Nausea present, no jaundice, normal liver function tests. Referred for evaluation of suspected cholelithiasis.' },
        { title: 'Technique', type: 'keyvalue', pairs: [
          { key: 'Modality', value: 'B-mode and Doppler ultrasound' },
          { key: 'Transducer', value: 'Curved array 2-5 MHz' },
          { key: 'Preparation', value: 'Patient fasted 4 hours prior to examination' },
          { key: 'Limitations', value: 'Moderate body habitus; limited visualization of pancreatic tail' },
        ]},
        { title: 'Findings', type: 'text', content: 'GALLBLADDER: The gallbladder is moderately distended (8.4 x 3.2 cm). Multiple echogenic foci are identified within the gallbladder lumen, ranging in size from 3mm to 12mm, the largest measuring 1.2 cm in the gallbladder neck region. All demonstrate posterior acoustic shadowing, consistent with cholelithiasis. No gallbladder wall thickening (wall 2mm, normal). No pericholecystic fluid. No sonographic Murphy sign elicited during graded compression over the gallbladder.\n\nBILE DUCTS: Common bile duct measures 4mm in caliber (normal). No intrahepatic biliary ductal dilation. No choledocholithiasis identified on this study (note: CBD stones are best evaluated by MRCP or EUS if clinically suspected).\n\nLIVER: The liver is normal in size (span 14.2cm at MCL). Echotexture is homogeneous and normal, without focal lesions. No hepatic mass or suspicious hepatic lesion. Main portal vein patent with normal hepatopetal flow on Doppler.\n\nSPLEEN: Normal in size (9.1 cm). No focal splenic abnormality.\n\nPANCREAS: Head and body visualized — normal echotexture. Pancreatic tail obscured by overlying bowel gas.\n\nKIDNEYS: Right kidney 10.8 cm, left kidney 10.4 cm. Normal cortical echogenicity and corticomedullary differentiation bilaterally. No hydronephrosis. No calculi identified.\n\nFREE FLUID: No ascites.' },
        { title: 'Impression', type: 'text', content: '1. CHOLELITHIASIS: Multiple gallstones present, largest 1.2 cm, without sonographic evidence of acute cholecystitis (no wall thickening, no pericholecystic fluid, negative Murphy sign).\n\n2. Normal liver, bile ducts, pancreas (partially visualized), spleen, and kidneys.\n\nClinical correlation recommended. Given symptomatic cholelithiasis with classic biliary colic, surgical consultation for cholecystectomy is suggested.\n\nReport finalized by Dr. Samuel Park, MD, November 5, 2024 at 12:30.' },
      ],
    },
  },

  // ── Operative Notes ───────────────────────────────────────────────────────
  {
    id: 'op-note-lap-chole',
    filename: 'random/op-note-lap-chole.pdf',
    label: 'Laparoscopic Cholecystectomy Op Note',
    description: 'Operative report for elective gallbladder removal with intraoperative cholangiogram.',
    suggestedQuestions: ['Were there any complications?', 'What was found during the surgery?', 'What are my post-op restrictions?'],
    content: {
      institutionName: 'Eastbrook General Hospital — Department of Surgery',
      documentTitle: 'Operative Report',
      patient: { name: 'Christine V. Donnelly', dob: '10/17/1981', mrn: '8821047', date: 'October 25, 2024', provider: 'Dr. Anthony Walsh, MD, FACS — General Surgery' },
      sections: [
        { title: 'Operative Summary', type: 'keyvalue', pairs: [
          { key: 'Pre-op Diagnosis', value: 'Symptomatic cholelithiasis with recurrent biliary colic' },
          { key: 'Post-op Diagnosis', value: 'Symptomatic cholelithiasis with recurrent biliary colic (confirmed)' },
          { key: 'Procedure', value: 'Laparoscopic cholecystectomy with intraoperative cholangiogram (IOC)' },
          { key: 'Surgeon', value: 'Anthony Walsh, MD, FACS' },
          { key: 'Assistant', value: 'Sarah Kim, MD (PGY-3 Resident)' },
          { key: 'Anesthesia', value: 'General endotracheal (Dr. R. Nguyen, CRNA)' },
          { key: 'Estimated Blood Loss', value: '< 10 mL' },
          { key: 'Complications', value: 'None' },
          { key: 'Specimens', value: 'Gallbladder to surgical pathology' },
          { key: 'Disposition', value: 'PACU, then same-day discharge (home)' },
        ]},
        { title: 'Operative Technique', type: 'text', content: 'The patient was taken to the operating room, placed supine, and underwent general endotracheal anesthesia without difficulty. The abdomen was prepped and draped in the standard sterile fashion. A Veress needle was placed in the left upper quadrant using the Palmer\'s point approach, and a pneumoperitoneum of 15 mmHg was established without difficulty.\n\nA 12mm umbilical port was placed under direct visualization with a 0-degree laparoscope. An additional 5mm epigastric port was placed under direct vision. Under laparoscopic guidance, two 5mm ports were placed in the right upper quadrant — one subcostal and one lateral.\n\nThe liver was elevated and the gallbladder fundus was grasped with a laparoscopic grasper. Dissection of the hepatocystic triangle was performed with electrocautery and blunt dissection. The peritoneum overlying the triangle of Calot was cleared anteriorly and posteriorly. Critical view of safety (CVS) was achieved: the hepatocystic triangle was cleared of fat and fibrous tissue, the lower third of the gallbladder was separated from the liver bed, and two and only two structures — the cystic artery and cystic duct — were seen entering the gallbladder.\n\nIntraoperative cholangiogram was performed by placing a 4Fr cholangiocatheter through a cystic ductotomy. Fluoroscopic images demonstrated free flow of contrast into the duodenum with normal opacification of the biliary tree. No filling defects to suggest choledocholithiasis. No ductal injury.\n\nThe cystic duct was doubly clipped proximally and divided. The cystic artery was doubly clipped and divided. The gallbladder was dissected off the liver bed in the plane of the submucosal layer using electrocautery. The gallbladder was placed into an EndoBag specimen retrieval device and extracted through the umbilical port site without spillage. The liver bed was inspected — dry. No bile or blood leak. Fascial closure performed at the 12mm umbilical site with 0-Vicryl. Skin closed with 4-0 Monocryl subcuticular sutures. Dermabond applied to all ports. Patient tolerated the procedure well.' },
        { title: 'Postoperative Orders', type: 'keyvalue', pairs: [
          { key: 'Diet', value: 'Clear liquids on arrival to PACU, advance to regular diet as tolerated' },
          { key: 'Activity', value: 'No lifting >10 lbs x 2 weeks. Return to office work in 2-3 days' },
          { key: 'Pain', value: 'Acetaminophen 500mg q6h + ibuprofen 400mg q8h PRN. Oxycodone 5mg PRN breakthrough' },
          { key: 'Wound', value: 'Steri-strips to all port sites. Shower in 24 hours. No submerging until cleared' },
          { key: 'Follow-up', value: 'Surgical clinic in 2 weeks (Dr. Walsh). Call sooner for fever, jaundice, or increasing pain' },
        ]},
      ],
    },
  },
  {
    id: 'op-note-tka',
    filename: 'random/op-note-tka.pdf',
    label: 'Total Knee Arthroplasty Op Note',
    description: 'Right total knee replacement operative report with implant sizing and alignment details.',
    suggestedQuestions: ['What implant was used?', 'Were there any intraoperative complications?', 'What was the tourniquet time?'],
    content: {
      institutionName: 'Harborview Orthopedic Center — Joint Reconstruction',
      documentTitle: 'Operative Report — Total Joint Arthroplasty',
      patient: { name: 'Gerald S. Burnett', dob: '01/08/1956', mrn: '3094718', date: 'November 12, 2024', provider: 'Dr. Patricia Lim, MD — Orthopedic Surgery' },
      sections: [
        { title: 'Operative Summary', type: 'keyvalue', pairs: [
          { key: 'Pre-op Diagnosis', value: 'Severe tricompartmental osteoarthritis, right knee (M17.11)' },
          { key: 'Procedure', value: 'Right total knee arthroplasty (TKA) with patella resurfacing' },
          { key: 'Implant System', value: 'Zimmer Biomet Persona — Cemented PS (Posterior Stabilized)' },
          { key: 'Femoral Component', value: 'Size 6, standard' },
          { key: 'Tibial Component', value: 'Size 4, 10mm articular insert (cruciate-stabilized)' },
          { key: 'Patellar Component', value: '35mm dome, all-polyethylene' },
          { key: 'Tourniquet Time', value: '68 minutes (inflated at 275 mmHg)' },
          { key: 'EBL', value: '< 200 mL (TXA 1g IV given pre-incision and 3 hours post)' },
          { key: 'Complications', value: 'None' },
        ]},
        { title: 'Operative Technique', type: 'text', content: 'The patient was positioned supine on the operating table with a lateral post at the thigh. Spinal anesthesia was administered with adductor canal nerve block under ultrasound guidance (0.5% ropivacaine 30 mL). A tourniquet was applied to the right thigh.\n\nA midline skin incision was made from 10cm proximal to the superior pole of the patella to the tibial tubercle. A medial parapatellar arthrotomy was performed, with medial release of the pes anserinus insertion and medial collateral ligament as needed to correct varus deformity. The patella was everted and the joint was exposed. Synovectomy was performed. The cruciate ligaments were identified — the ACL was attenuated; the PCL was intact and ultimately sacrificed to accommodate the PS implant.\n\nBony resections were performed using standard jigs per manufacturer specifications: distal femoral resection at 9°valgus, posterior condylar resection, anterior chamfer cuts, and proximal tibial resection perpendicular to mechanical axis. Patellar resection performed to 10mm residual bone thickness, measured at 35mm diameter.\n\nTrial components were placed and confirmed optimal sizing via fluoroscopy. Alignment: full mechanical axis correction from 8° varus to neutral confirmed. Gap balancing: extension and flexion gaps equal at 10mm. Range of motion with trials: 0-128°.\n\nCement mixing per manufacturer protocol. Final components were press-fit then cement fixed. Excess cement removed under tourniquet. Tourniquet released. Hemostasis achieved. Wound irrigated with 3L saline. Intraarticular drain placed (removed POD 1). Closure: retinaculum with 0 Vicryl interrupted, subcutaneous with 2-0 Vicryl, skin with staples. Compressive dressing applied.' },
        { title: 'Postoperative Plan', type: 'text', content: 'Weight-bearing as tolerated with front-wheeled walker beginning POD 1. Physical therapy to begin POD 1 with gait training and ROM exercises. DVT prophylaxis: enoxaparin 40mg SC daily x 10 days (consider extended 28 days given BMI). Cryotherapy PRN for swelling. VTE risk assessment: moderate-high (TJA + prior immobility); mechanical and pharmacological prophylaxis ordered.\n\nDischarge expected POD 2-3 to home with home PT if independent with walker and able to negotiate stairs, or to skilled nursing facility if additional support needed. Follow up with Dr. Lim at 2 weeks for staple removal, 6 weeks for functional assessment, and 1 year with weight-bearing knee radiographs.' },
      ],
    },
  },

  // ── Prior Auth / Insurance Forms ──────────────────────────────────────────
  {
    id: 'prior-auth-biologic',
    filename: 'random/prior-auth-biologic.pdf',
    label: 'Prior Authorization — Biologic Therapy',
    description: 'Humira prior auth request for rheumatoid arthritis with step therapy documentation.',
    suggestedQuestions: ['What medications were tried before this request?', 'What is the requested drug and dose?', 'What diagnosis code was used?'],
    content: {
      institutionName: 'HealthPlus Insurance — Pharmacy Prior Authorization Department',
      documentTitle: 'Prior Authorization Request Form — Biologic / Specialty Drug',
      patient: { name: 'Nancy J. Whitfield', dob: '04/05/1970', mrn: '7723019', date: 'Submitted: October 18, 2024', provider: 'Dr. Omar Haddad, MD — Rheumatology, Westside Arthritis Center' },
      sections: [
        { title: 'Request Information', type: 'keyvalue', pairs: [
          { key: 'Drug Requested', value: 'Adalimumab (Humira) 40mg subcutaneous injection every 2 weeks' },
          { key: 'Quantity', value: '2 prefilled syringes per 28-day supply' },
          { key: 'Duration Requested', value: '12 months, then renewal review' },
          { key: 'Diagnosis (Primary)', value: 'Rheumatoid arthritis, seropositive (ICD-10: M05.9)' },
          { key: 'Diagnosis (Secondary)', value: 'Erosive disease confirmed on hand/wrist X-ray; functional impairment (HAQ-DI 1.6)' },
          { key: 'Plan / Member ID', value: 'HealthPlus PPO Gold / HP-09937412' },
          { key: 'NPI', value: '1245831092 (Haddad, Omar MD)' },
          { key: 'Pharmacy', value: 'Specialty Rx Partners, NCPDP 2940128' },
        ]},
        { title: 'Clinical Justification', type: 'text', content: 'Ms. Whitfield is a 54-year-old female with a 6-year history of seropositive rheumatoid arthritis (RF positive 82 IU/mL, anti-CCP positive 148 U/mL). She presents with ongoing polyarthritis affecting bilateral MCP, PIP, and wrist joints with morning stiffness lasting >1 hour. DAS28-CRP is 5.1 (high disease activity). Recent hand/wrist radiographs demonstrate progressive erosive changes at the 2nd and 3rd MCP joints bilaterally, indicating structural damage progression.\n\nThe patient has failed to achieve adequate disease control despite multiple prior therapies as documented below. Given persistent high disease activity with erosive disease, initiating biologic therapy with an anti-TNF agent (adalimumab) per ACR 2021 RA management guidelines is medically necessary.' },
        { title: 'Step Therapy Documentation', type: 'table', rows: [
          { Drug: 'Methotrexate 20mg/wk', Duration: '18 months', Outcome: 'Partial response; hepatotoxicity at higher dose', 'Stopped Date': 'April 2023' },
          { Drug: 'Hydroxychloroquine 400mg/day', Duration: '12 months (add-on)', Outcome: 'Inadequate response; DAS28 remained >4.5', 'Stopped Date': 'March 2024' },
          { Drug: 'Leflunomide 20mg/day', Duration: '8 months', Outcome: 'GI intolerance (nausea, diarrhea grade 2); discontinued', 'Stopped Date': 'October 2024' },
        ]},
        { title: 'Supporting Documentation', type: 'keyvalue', pairs: [
          { key: 'TB Screening', value: 'QuantiFERON Gold negative — October 10, 2024' },
          { key: 'Hepatitis B', value: 'HBsAg negative, Anti-HBs positive (immune) — on file' },
          { key: 'Varicella Immunity', value: 'IgG positive — on file' },
          { key: 'Contraindications', value: 'None identified (no active infection, no demyelinating disease, no CHF)' },
          { key: 'Attached Records', value: 'Rheumatology clinic notes x3, lab results, radiograph reports — uploaded to portal' },
          { key: 'Prescriber Signature', value: 'Omar Haddad, MD — signed electronically October 18, 2024' },
        ]},
      ],
    },
  },
  {
    id: 'prior-auth-dme',
    filename: 'random/prior-auth-dme.pdf',
    label: 'DME Prior Authorization Request',
    description: 'Continuous glucose monitor prior auth form for a Type 1 diabetes patient.',
    suggestedQuestions: ['What device is being requested?', 'What is the medical justification listed?', 'What is the expected approval duration?'],
    content: {
      institutionName: 'BlueCross BlueCrest Health — Durable Medical Equipment Authorization',
      documentTitle: 'Prior Authorization — Durable Medical Equipment (DME)',
      patient: { name: 'Jason L. Park', dob: '09/15/1993', mrn: '5538274', date: 'Submitted: November 3, 2024', provider: 'Dr. Christina Liu, MD, CDE — Endocrinology, Metro Diabetes Center' },
      sections: [
        { title: 'Device and Coverage Information', type: 'keyvalue', pairs: [
          { key: 'Device Requested', value: 'Continuous Glucose Monitor (CGM) — Dexcom G7 System' },
          { key: 'HCPCS Code', value: 'A9278 (transmitter) / K0554 (receiver) / A9276 (sensors, 30-day supply)' },
          { key: 'Quantity', value: '1 transmitter, 1 receiver, 3 sensors per 10 days (box of 3)' },
          { key: 'Duration Requested', value: '12-month supply with renewal review' },
          { key: 'Diagnosis (Primary)', value: 'Type 1 diabetes mellitus (ICD-10: E10.65 — with hyperglycemia)' },
          { key: 'Member ID', value: 'BC-114829337 / Group: 48821-GM' },
          { key: 'NPI', value: '1831094872 (Liu, Christina MD)' },
        ]},
        { title: 'Medical Necessity Criteria', type: 'keyvalue', pairs: [
          { key: 'Diagnosis', value: 'Type 1 diabetes mellitus — confirmed by C-peptide deficiency (<0.1 ng/mL) and positive islet autoantibodies (GAD-65 positive)' },
          { key: 'Current HbA1c', value: '8.9% (October 28, 2024) — above target of <7.5% per ADA standards' },
          { key: 'Insulin Regimen', value: 'Multiple Daily Injections (MDI): Insulin glargine 28 units QHS + Lispro carb-ratio 1:10 with correction factor 1:50' },
          { key: 'Hypoglycemia Unawareness', value: 'Documented — Gold score 5 (impaired). Two ER visits for severe hypoglycemia in past 12 months requiring glucagon administration' },
          { key: 'SMBG Frequency', value: 'Currently testing 8-12x/day via fingerstick (strips being utilized)' },
          { key: 'Patient Education', value: 'Completed DSMES (Diabetes Self-Management Education) — certificate on file' },
        ]},
        { title: 'Clinical Justification', type: 'text', content: 'Mr. Park is a 31-year-old male with Type 1 diabetes since age 7 (24-year history) on an intensive insulin regimen. He has documented hypoglycemia unawareness (Gold score 5) with two severe hypoglycemic episodes in the past year requiring emergency intervention. Current SMBG-based management has been unable to prevent dangerous hypoglycemic events or achieve adequate HbA1c control.\n\nCGM technology is medically necessary for this patient to: (1) provide real-time glucose trend data and low glucose alerts to prevent severe hypoglycemia, (2) enable insulin dosing decisions with improved accuracy over intermittent fingerstick monitoring, and (3) support glycemic management goals per ADA 2024 Standards of Care, which recommend CGM for all T1D patients on intensive insulin therapy.\n\nDexcom G7 specifically is preferred over alternatives due to 10-day wear duration, 30-minute warmup time, and direct-to-Apple-Watch integration — critical given this patient\'s occupational schedule (EMT/First Responder) where discrete monitoring is essential during active calls.' },
        { title: 'Supporting Documentation Checklist', type: 'table', rows: [
          { Item: 'Signed CMN (Certificate of Medical Necessity)', Status: 'Attached', Notes: 'Form DMEPOS-CMN-014' },
          { Item: 'Physician office notes (most recent 3 visits)', Status: 'Attached', Notes: 'Uploaded to portal' },
          { Item: 'HbA1c lab results (within 6 months)', Status: 'Attached', Notes: '8.9% — October 28, 2024' },
          { Item: 'C-peptide and autoantibody results', Status: 'Attached', Notes: 'Confirms T1D classification' },
          { Item: 'Hypoglycemia event documentation', Status: 'Attached', Notes: 'ER records x2, glucagon use confirmed' },
          { Item: 'DSMES completion certificate', Status: 'Attached', Notes: 'Completed Metro Diabetes Program, June 2024' },
        ]},
      ],
    },
  },
];

// ─── PDF rendering ────────────────────────────────────────────────────────────

const COLORS = { primary: '#1a2744', accent: '#2563eb', muted: '#6b7280', border: '#d1d5db', flag: '#dc2626', flagBg: '#fef2f2' };
const FONTS = { title: 18, sectionHeader: 11, body: 9.5, small: 8.5 };
const MARGIN = 54;
const PAGE_W = 612;
const CONTENT_W = PAGE_W - MARGIN * 2;

function drawPageHeader(doc: PDFKit.PDFDocument, gen: GeneratedDoc) {
  doc.rect(0, 0, PAGE_W, 70).fill(COLORS.primary);
  doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text(gen.institutionName, MARGIN, 16, { width: CONTENT_W });
  doc.fontSize(FONTS.small).font('Helvetica').text(gen.documentTitle.toUpperCase(), MARGIN, 36, { width: CONTENT_W });
  doc.fillColor('#93c5fd').fontSize(7).text('SYNTHETIC DOCUMENT — FOR DEMONSTRATION ONLY — CONTAINS NO REAL PATIENT DATA', MARGIN, 55, { width: CONTENT_W });
  doc.y = 80;
}

function drawPatientBar(doc: PDFKit.PDFDocument, p: GeneratedDoc['patient']) {
  const y = doc.y + 4;
  doc.rect(MARGIN, y, CONTENT_W, 32).fillAndStroke('#f0f4ff', COLORS.border);
  doc.fillColor(COLORS.primary).fontSize(FONTS.small).font('Helvetica-Bold');
  const line1 = [`Patient: ${p.name}`, `DOB: ${p.dob}`, `MRN: ${p.mrn}`];
  const colW = CONTENT_W / line1.length;
  line1.forEach((f, i) => doc.text(f, MARGIN + i * colW + 6, y + 6, { width: colW - 6 }));
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7.5)
    .text(`Date: ${p.date}`, MARGIN + 6, y + 20, { width: CONTENT_W / 2 - 6 })
    .text(`Provider: ${p.provider}`, MARGIN + CONTENT_W / 2, y + 20, { width: CONTENT_W / 2 });
  doc.y = y + 44;
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.35);
  const y = doc.y;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor(COLORS.accent).lineWidth(0.8).stroke();
  doc.fillColor(COLORS.accent).fontSize(FONTS.sectionHeader).font('Helvetica-Bold').text(title.toUpperCase(), MARGIN, y + 3);
  doc.moveDown(0.25);
}

function drawTable(doc: PDFKit.PDFDocument, rows: Record<string, string>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const colW = CONTENT_W / cols.length;
  const rowH = 15;
  let y = doc.y;

  if (y + rowH * (rows.length + 1) > 720) { doc.addPage(); y = MARGIN; }

  doc.rect(MARGIN, y, CONTENT_W, rowH).fillAndStroke(COLORS.primary, COLORS.border);
  doc.fillColor('white').fontSize(FONTS.small).font('Helvetica-Bold');
  cols.forEach((c, i) => doc.text(c, MARGIN + i * colW + 4, y + 4, { width: colW - 8 }));
  y += rowH;

  rows.forEach((row, ri) => {
    const hasFlag = row['Flag'] && row['Flag'].trim() !== '' && row['Flag'] !== '—';
    const bg = hasFlag ? COLORS.flagBg : (ri % 2 === 0 ? '#f9fafb' : 'white');
    doc.rect(MARGIN, y, CONTENT_W, rowH).fillAndStroke(bg, COLORS.border);
    doc.font('Helvetica').fontSize(FONTS.small);
    cols.forEach((c, i) => {
      const val = row[c] ?? '';
      const isFlag = c === 'Flag' && val && val !== '—';
      doc.fillColor(isFlag ? COLORS.flag : COLORS.primary);
      doc.text(val, MARGIN + i * colW + 4, y + 4, { width: colW - 8 });
    });
    y += rowH;
  });
  doc.y = y + 6;
}

function drawKeyValue(doc: PDFKit.PDFDocument, pairs: { key: string; value: string }[]) {
  const halfW = CONTENT_W / 2 - 8;
  let col = 0;
  let rowY = doc.y;
  pairs.forEach((pair, idx) => {
    const x = MARGIN + (col === 0 ? 0 : CONTENT_W / 2 + 4);
    const textHeight = Math.max(
      doc.heightOfString(pair.key + ':', { width: 88 }),
      doc.heightOfString(pair.value, { width: halfW - 92 })
    );
    if (rowY + textHeight > 720) { doc.addPage(); rowY = MARGIN; }
    doc.fillColor(COLORS.muted).fontSize(FONTS.small).font('Helvetica-Bold').text(pair.key + ':', x, rowY, { width: 88 });
    doc.fillColor(COLORS.primary).font('Helvetica').text(pair.value, x + 92, rowY, { width: halfW - 92 });
    if (col === 1 || idx === pairs.length - 1) { rowY += textHeight + 4; col = 0; }
    else { col = 1; }
  });
  doc.y = rowY + 4;
}

function renderPDF(gen: GeneratedDoc, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN }, autoFirstPage: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);

    drawPageHeader(doc, gen);
    drawPatientBar(doc, gen.patient);
    doc.moveDown(0.4);

    for (const section of gen.sections) {
      if (doc.y > 680) doc.addPage();
      drawSectionHeader(doc, section.title);
      if (section.type === 'text' && section.content) {
        doc.fillColor(COLORS.primary).fontSize(FONTS.body).font('Helvetica')
          .text(section.content, MARGIN, doc.y, { width: CONTENT_W, lineGap: 2 });
        doc.moveDown(0.3);
      } else if (section.type === 'table' && section.rows?.length) {
        drawTable(doc, section.rows);
      } else if (section.type === 'keyvalue' && section.pairs?.length) {
        drawKeyValue(doc, section.pairs);
      }
    }

    const footerY = doc.page.height - 32;
    doc.moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    doc.fillColor(COLORS.muted).fontSize(6.5).font('Helvetica')
      .text('This document contains entirely synthetic, AI-generated data for demonstration purposes only. No real patient, provider, or institutional information is represented.', MARGIN, footerY + 5, { width: CONTENT_W, align: 'center' });

    doc.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const metadataEntries: object[] = [];
  const total = DOC_SPECS.length;

  for (let i = 0; i < DOC_SPECS.length; i++) {
    const spec = DOC_SPECS[i];
    console.log(`[${i + 1}/${total}] Rendering: ${spec.label}...`);
    try {
      const outPath = path.join(process.cwd(), 'public', 'sample-docs', spec.filename);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      await renderPDF(spec.content, outPath);
      metadataEntries.push({
        id: spec.id,
        label: spec.label,
        description: spec.description,
        filename: spec.filename,
        pageCount: 1,
        suggestedQuestions: spec.suggestedQuestions,
      });
      console.log(`   ✓ ${path.basename(outPath)}`);
    } catch (err) {
      console.error(`   ✗ Failed: ${spec.label}`, err);
    }
  }

  fs.writeFileSync(META_OUT, JSON.stringify(metadataEntries, null, 2));
  console.log(`\nDone. ${metadataEntries.length}/${total} PDFs generated.`);
  console.log(`Metadata: ${META_OUT}`);
  console.log(`\nNext — sync to S3:`);
  console.log(`  aws s3 sync public/sample-docs/random/ s3://<bucket>/samples/random/`);
}

main().catch(console.error);

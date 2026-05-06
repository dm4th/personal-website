import styles from './InputForm.module.css';
import type { CaseInput } from '@/lib/projects/dental-eligibility/types';

const PROCEDURE_CODES: { code: string; desc: string }[] = [
  { code: 'D0120', desc: 'Periodic oral evaluation for established patients' },
  { code: 'D0150', desc: 'Comprehensive oral evaluation for new or established patients' },
  { code: 'D0210', desc: 'Full mouth radiographic survey' },
  { code: 'D0274', desc: 'Four bitewing radiographic images' },
  { code: 'D0330', desc: 'Panoramic radiographic image' },
  { code: 'D1110', desc: 'Adult prophylaxis' },
  { code: 'D1120', desc: 'Child prophylaxis' },
  { code: 'D1208', desc: 'Topical fluoride application excluding varnish' },
  { code: 'D1351', desc: 'Sealant per tooth' },
  { code: 'D2140', desc: 'Amalgam restoration one surface primary or permanent' },
  { code: 'D2150', desc: 'Amalgam restoration two surfaces primary or permanent' },
  { code: 'D2160', desc: 'Amalgam restoration three surfaces primary or permanent' },
  { code: 'D2331', desc: 'Resin composite two surfaces anterior' },
  { code: 'D2391', desc: 'Resin composite one surface posterior primary or permanent' },
  { code: 'D2740', desc: 'Crown porcelain or ceramic substrate' },
  { code: 'D2750', desc: 'Crown porcelain fused to high noble metal' },
  { code: 'D2950', desc: 'Core buildup including any pins when required' },
  { code: 'D3310', desc: 'Endodontic therapy anterior tooth excluding final restoration' },
  { code: 'D3320', desc: 'Endodontic therapy premolar tooth excluding final restoration' },
  { code: 'D3330', desc: 'Endodontic therapy molar tooth excluding final restoration' },
  { code: 'D4341', desc: 'Periodontal scaling and root planing four or more teeth per quadrant' },
  { code: 'D4910', desc: 'Periodontal maintenance' },
  { code: 'D5213', desc: 'Maxillary partial denture cast metal framework with resin bases' },
  { code: 'D6010', desc: 'Surgical placement of endosteal implant body' },
  { code: 'D7140', desc: 'Extraction of erupted tooth or exposed root' },
  { code: 'D7210', desc: 'Surgical removal of erupted tooth' },
  { code: 'D8080', desc: 'Comprehensive orthodontic treatment adolescent dentition' },
  { code: 'D9110', desc: 'Palliative emergency treatment of dental pain' },
];

const PAYERS = [
  'Aetna DMO',
  'Aetna PPO',
  'Anthem BCBS Dental',
  'Blue Cross Blue Shield Federal Employee Program',
  'Blue Cross Blue Shield of Illinois',
  'Cigna DPPO',
  'Delta Dental PPO',
  'Delta Dental Premier',
  'Guardian PPO',
  'Humana Dental HMO',
  'Humana PPO',
  'MetLife PDP',
  'United Concordia Advantage',
  'United Healthcare Dental',
];

type Props = {
  values: CaseInput;
  onChange: (values: CaseInput) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function InputForm({ values, onChange, onSubmit, loading }: Props) {
  const set = <K extends keyof CaseInput>(key: K, value: CaseInput[K]) =>
    onChange({ ...values, [key]: value });

  const handleProcedureChange = (code: string) => {
    const found = PROCEDURE_CODES.find((p) => p.code === code);
    onChange({
      ...values,
      procedure_code: code,
      procedure_description: found ? found.desc : values.procedure_description,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const codeInList = PROCEDURE_CODES.some((p) => p.code === values.procedure_code);
  const payerInList = PAYERS.includes(values.payer);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Procedure Code</label>
          <select
            className={styles.input}
            value={codeInList ? values.procedure_code : ''}
            onChange={(e) => handleProcedureChange(e.target.value)}
            required
          >
            <option value="" disabled>Select a code…</option>
            {PROCEDURE_CODES.map(({ code, desc }) => (
              <option key={code} value={code}>{code} - {desc.slice(0, 42)}{desc.length > 42 ? '…' : ''}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Patient Age</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            max={120}
            placeholder="e.g. 34"
            value={values.patient_age || ''}
            onChange={(e) => set('patient_age', parseInt(e.target.value, 10) || 0)}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Procedure Description</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Auto-filled from code selection above"
          value={values.procedure_description}
          onChange={(e) => set('procedure_description', e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Payer</label>
        <select
          className={styles.input}
          value={payerInList ? values.payer : ''}
          onChange={(e) => set('payer', e.target.value)}
          required
        >
          <option value="" disabled>Select a payer…</option>
          {PAYERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Coverage Text</label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder="Paste the relevant coverage language from the 271 EDI response or plan document..."
          value={values.coverage_text}
          onChange={(e) => set('coverage_text', e.target.value)}
          required
          rows={5}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Plan Year Remaining ($)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            placeholder="e.g. 1200"
            value={values.plan_year_remaining || ''}
            onChange={(e) => set('plan_year_remaining', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Deductible Met?</label>
          <select
            className={styles.input}
            value={values.deductible_met ? 'yes' : 'no'}
            onChange={(e) => set('deductible_met', e.target.value === 'yes')}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Last Appointment Date <span className={styles.labelHint}>(leave blank if no prior service)</span></label>
        <input
          className={styles.input}
          type="date"
          value={values.last_appointment_date ?? ''}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => set('last_appointment_date', e.target.value || null)}
        />
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
      >
        {loading ? 'Checking eligibility...' : 'Run Eligibility Check →'}
      </button>
    </form>
  );
}

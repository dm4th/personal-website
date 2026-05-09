import styles from './TranscriptInput.module.css';

type Props = {
  transcript: string;
  meetingType: string;
  onChange: (transcript: string) => void;
  onMeetingTypeChange: (type: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

const MEETING_TYPES = ['Discovery', 'Executive Briefing', 'Technical Deep-Dive', 'QBR', 'Demo', 'Other'];

export default function TranscriptInput({
  transcript,
  meetingType,
  onChange,
  onMeetingTypeChange,
  onSubmit,
  loading,
}: Props) {
  const canSubmit = transcript.trim().length >= 50 && !loading;

  return (
    <div className={styles.wrapper}>
      <p className={styles.heading}>Paste Your Transcript</p>
      <div className={styles.typeRow}>
        <label className={styles.label} htmlFor="meeting-type">
          Meeting type
        </label>
        <select
          id="meeting-type"
          className={styles.select}
          value={meetingType}
          onChange={(e) => onMeetingTypeChange(e.target.value)}
          disabled={loading}
        >
          {MEETING_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <textarea
        className={styles.textarea}
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a sales meeting transcript here - or click a sample above to load one."
        rows={8}
        disabled={loading}
      />
      <p className={styles.hint}>{transcript.length} chars {transcript.length < 50 && '(min 50)'}</p>
      <button
        className={styles.btn}
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        {loading ? 'Analyzing...' : 'Run 6 Agents →'}
      </button>
    </div>
  );
}

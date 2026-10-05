// Mirrors TONE_GUIDES / USE_CASES in app.py. Only the ids and display
// labels are needed here — the actual tone guide text and use-case
// context stay server-side, exactly as they did on the web.

export type ToneGroup = { label: string; tones: { id: string; label: string }[] };

export const TONE_GROUPS: ToneGroup[] = [
  {
    label: 'Professional',
    tones: [
      { id: 'formal', label: 'Formal' },
      { id: 'academic', label: 'Academic' },
      { id: 'confident', label: 'Confident' },
      { id: 'persuasive', label: 'Persuasive' },
      { id: 'diplomatic', label: 'Diplomatic' },
      { id: 'concise', label: 'Concise' },
    ],
  },
  {
    label: 'Everyday',
    tones: [
      { id: 'friendly', label: 'Friendly' },
      { id: 'casual', label: 'Casual' },
      { id: 'enthusiastic', label: 'Enthusiastic' },
      { id: 'flirty', label: 'Flirty (PG)' },
    ],
  },
  {
    label: 'Considerate',
    tones: [
      { id: 'empathetic', label: 'Empathetic' },
      { id: 'apologetic', label: 'Apologetic' },
    ],
  },
];

export const USE_CASES: { id: string; label: string }[] = [
  { id: 'boss_email', label: 'Email to boss' },
  { id: 'class_essay', label: 'Class essay' },
  { id: 'job_application', label: 'Job application' },
  { id: 'social_post', label: 'Social post' },
  { id: 'text_message', label: 'Text message' },
  { id: 'cover_letter', label: 'Cover letter' },
  { id: 'partner_text', label: 'Text a partner' },
  { id: 'friend_apology', label: 'Apology to a friend' },
];

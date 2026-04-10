export const MODES = [
  { value: 'summary',    label: 'Summary',    desc: 'Bullet-point summary of key ideas', icon: '📋', color: '#1d4ed8', bg: '#dbeafe' },
  { value: 'quiz',       label: 'Quiz',       desc: '5 multiple-choice questions',       icon: '❓', color: '#92400e', bg: '#fef3c7' },
  { value: 'flashcards', label: 'Flashcards', desc: 'Q&A pairs for active recall',       icon: '🃏', color: '#065f46', bg: '#d1fae5' },
];

export const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.value, m]));

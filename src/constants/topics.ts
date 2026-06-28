// Shared topic taxonomy used for filtering + tagging questions.
export const TOPICS = [
  'Career',
  'Coding',
  'Design',
  'Startups',
  'Study',
  'Wellbeing',
  'Other',
] as const;

export const TOPIC_FILTERS = ['All', ...TOPICS] as const;

// Keep these in sync with server/models/Resume.js. Duplicated rather than
// fetched at runtime because the whitelist rarely changes and a resume
// editor shouldn't have a network dependency just to know its own options.
export const ALLOWED_FONTS = ['Inter', 'Georgia', 'Merriweather', 'Roboto Slab'];
export const ALLOWED_ACCENT_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#DC2626', '#0D9488', '#111827'];

export const SECTION_LABELS = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  projects: 'Projects',
  languages: 'Languages',
  references: 'References',
};

export const SECTION_TYPES = Object.keys(SECTION_LABELS);

// Field definitions per section type — drives the generic entry-card editor
// so there's one rendering path instead of eight bespoke forms.
// 'bullets' fields are edited as one multiline string, split into an array on save.
export const SECTION_FIELDS = {
  experience: [
    { key: 'role', label: 'Role' },
    { key: 'company', label: 'Company' },
    { key: 'startDate', label: 'Start date' },
    { key: 'endDate', label: 'End date (blank if current)' },
    { key: 'bulletsText', label: 'Highlights (one per line)', multiline: true, isBullets: true },
  ],
  education: [
    { key: 'degree', label: 'Degree' },
    { key: 'institution', label: 'Institution' },
    { key: 'startDate', label: 'Start date' },
    { key: 'endDate', label: 'End date' },
    { key: 'notes', label: 'Notes (optional)', multiline: true },
  ],
  skills: [{ key: 'name', label: 'Skill' }],
  certifications: [
    { key: 'title', label: 'Title' },
    { key: 'issuer', label: 'Issuer / date' },
    { key: 'description', label: 'Description (optional)', multiline: true },
  ],
  projects: [
    { key: 'title', label: 'Project name' },
    { key: 'issuer', label: 'Role / date' },
    { key: 'description', label: 'Description (optional)', multiline: true },
  ],
  languages: [
    { key: 'name', label: 'Language' },
    { key: 'level', label: 'Proficiency (e.g. Native, Fluent)' },
  ],
  references: [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role / company' },
    { key: 'contact', label: 'Contact info' },
  ],
};

export function blankEntry(type) {
  const fields = SECTION_FIELDS[type] || [];
  const entry = {};
  fields.forEach((f) => (entry[f.key] = ''));
  return entry;
}

export function blankSection(type, order) {
  return {
    type,
    title: SECTION_LABELS[type],
    visible: true,
    order,
    items: type === 'summary' ? { text: '' } : [],
  };
}

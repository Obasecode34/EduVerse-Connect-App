export const JOB_TYPES = [
  { value: 'onsite', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'scholarship', label: 'Scholarship' },
];

// Mirrors server/models/Job.js SCHOLARSHIP_CLASSIFICATIONS exactly — keep
// these in sync manually, same tradeoff as the resume theme whitelist.
export const SCHOLARSHIP_CLASSIFICATIONS = ['Undergraduate', 'Postgraduate', 'PhD', 'Vocational', 'International'];

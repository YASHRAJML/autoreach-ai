const departments = [
  'Engineering', 'Product', 'Design', 'Data Science', 'DevOps',
  'Marketing', 'Sales', 'Customer Success', 'Operations', 'Finance',
  'Human Resources', 'Legal', 'Security', 'QA', 'Research'
];

const titles = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Engineer', 'Data Scientist', 'Data Engineer', 'ML Engineer', 'Product Manager',
  'UX Designer', 'UI Designer', 'DevOps Engineer', 'Site Reliability Engineer', 'QA Engineer',
  'Security Engineer', 'Cloud Architect', 'Business Analyst', 'Sales Manager', 'Marketing Specialist',
  'Customer Success Manager', 'Operations Manager', 'Finance Analyst', 'HR Business Partner',
  'Legal Counsel', 'Research Scientist'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote',
  'Boston, MA', 'Chicago, IL', 'Atlanta, GA', 'Denver, CO', 'Los Angeles, CA'
];

const managers = [
  'Alex Johnson', 'Taylor Smith', 'Jordan Lee', 'Chris Kim', 'Morgan Davis',
  'Riley Chen', 'Casey Patel', 'Jamie Nguyen', 'Avery Brown', 'Sam Wilson'
];

const recruiters = [
  'Priya Singh', 'Michael Tan', 'Emily Clark', 'Daniel Garcia', 'Sophia Martinez',
  'Liam Thompson', 'Olivia Anderson', 'Noah White', 'Emma Harris', 'William Lewis'
];

const skillsPool = [
  'JavaScript','TypeScript','React','Node.js','Python','Django','Flask','Java','Spring','AWS','Azure','GCP',
  'Docker','Kubernetes','PostgreSQL','MySQL','MongoDB','Redis','GraphQL','REST','CI/CD','Terraform','Ansible',
  'Figma','User Research','A/B Testing','Data Modeling','Pandas','NumPy','PyTorch','TensorFlow','Keras','Go','Rust'
];

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSkills(count) {
  const copy = [...skillsPool];
  const selected = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(idx, 1)[0]);
  }
  return selected;
}

function titleToSeniority(title) {
  if (/principal|staff|architect/i.test(title)) return 'principal';
  if (/senior|sr\./i.test(title)) return 'senior';
  if (/junior|jr\./i.test(title)) return 'junior';
  return 'mid';
}

const today = new Date();

const dummyJobs = Array.from({ length: 100 }).map((_, i) => {
  const title = randomChoice(titles);
  const department = randomChoice(departments);
  const hiringManager = randomChoice(managers);
  const recruiter = randomChoice(recruiters);
  const location = randomChoice(locations);
  const keySkills = randomSkills(randomInt(4, 8));
  const seniority = titleToSeniority(title);
  const remoteOption = Math.random() > 0.5 || location === 'Remote';

  const description = `We are seeking a ${title} to join our ${department} team. You will collaborate with cross-functional stakeholders to deliver high-impact initiatives and contribute to technical and process improvements.`;
  const requirements = `Required: ${keySkills.slice(0, 3).join(', ')}. Preferred: ${keySkills.slice(3, 6).join(', ')}.`;

  const postedDate = new Date(today.getTime() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
  const applicationDeadline = new Date(today.getTime() + randomInt(7, 45) * 24 * 60 * 60 * 1000).toISOString().slice(0,10);

  return {
    id: `job-${String(i + 1).padStart(3, '0')}`,
    title,
    department,
    hiringManager,
    recruiter,
    location,
    description,
    requirements,
    keySkills,
    benefits: ['Health, dental, and vision', '401k match', 'Flexible PTO'],
    seniority,
    remoteOption,
    postedDate,
    applicationDeadline,
  };
});

module.exports = { dummyJobs }; 
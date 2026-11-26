/**
 * Central content + links file.
 * Update social links, email, and project URLs here — every section reads from this file.
 */

export const links = {
  github: 'https://github.com/ishfaqueguldayo-lang',
  linkedin: 'https://www.linkedin.com/in/ishfaq-gul-089470342/',
  email: 'ishfaqueguldayo@gmail.com',
}

export const profile = {
  name: 'Ishfaq Gul',
  firstName: 'Ishfaq',
  title: 'Full Stack Developer | Software Engineer | Data Engineer',
  roles: ['Full Stack Developer', 'Software Engineer', 'Data Engineer'],
  bio: 'I am a Full Stack Developer, Software Engineer, and Data Engineer with experience working with modern web technologies, backend development, cloud platforms, data processing, and workflow automation.',
  photo: '/images/ishfaq-gul.png',
  location: 'Pakistan',
}

export const skillGroups = [
  { label: 'Programming', items: ['Python', 'SQL', 'JavaScript', 'PHP'] },
  { label: 'Frontend', items: ['HTML5', 'CSS3', 'React.js', 'Next.js'] },
  { label: 'Backend', items: ['Node.js'] },
  { label: 'Data Engineering', items: ['PySpark'] },
  { label: 'Cloud Platforms', items: ['AWS', 'Azure'] },
  { label: 'Automation', items: ['n8n', 'Make.com'] },
]

export const experience = [
  {
    company: 'Xloop Digital',
    location: 'Pakistan',
    type: 'Full-time',
    start: '21 May 2026',
    end: 'Present',
    roles: ['Software Engineer', 'Junior Data Engineer'],
  },
]

export const education = [
  {
    title: 'Associate Degree in Science (ADS)',
    status: 'Currently studying — 3rd semester',
    current: true,
  },
  {
    title: 'Intermediate (12th Grade)',
    status: 'Completed',
    current: false,
  },
]

export type Project = {
  slug: 'lms' | 'attendance' | 'appointment'
  title: string
  category: string
  summary: string
  highlights: string[]
  /** Set a repository or live URL here. Leave undefined to link to the GitHub profile. */
  href?: string
}

export const projects: Project[] = [
  {
    slug: 'lms',
    title: 'Smart LMS',
    category: 'Education',
    summary:
      'A learning management system that brings courses, learning material and students together in one organised platform.',
    highlights: ['Course management', 'Student access', 'Centralised learning material'],
  },
  {
    slug: 'attendance',
    title: 'QR Attendance System',
    category: 'Automation',
    summary:
      'An attendance system where attendance is marked by scanning a QR code, replacing slow manual roll calls with a quick scan.',
    highlights: ['QR code scanning', 'Digital attendance records', 'Faster check-ins'],
  },
  {
    slug: 'appointment',
    title: 'Doctor Appointment System',
    category: 'Healthcare',
    summary:
      'An appointment booking system that lets patients book time with doctors and helps keep schedules organised.',
    highlights: ['Appointment booking', 'Doctor schedules', 'Patient management'],
  },
]

export const navItems = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
]

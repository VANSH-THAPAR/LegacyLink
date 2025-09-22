import { Zap, Briefcase, BarChart2, Award, Heart, Code } from 'lucide-react';

export const studentData = {
  name: 'Ananya Sharma',
  course: 'B.Tech Computer Science',
  imageUrl: 'https://placehold.co/40x40/E2E8F0/4A5568?text=AS',
};

export const alumniData = [
  {
    id: 1,
    name: 'Rohan Mehta',
    position: 'Senior Product Manager @ Google',
    imageUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=RM',
    careerPath: ['B.Tech', 'Software Engineer @ TCS', 'Product Analyst @ Swiggy', 'Senior PM @ Google'],
    isTopContributor: true,
    engagementScore: 92,
  },
  {
    id: 2,
    name: 'Priya Singh',
    position: 'UX Lead @ Microsoft',
    imageUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=PS',
    careerPath: ['B.Des', 'UI/UX Intern', 'UX Designer @ Zomato', 'UX Lead @ Microsoft'],
    isTopContributor: false,
    engagementScore: 78,
  },
  {
    id: 3,
    name: 'Vikram Rao',
    position: 'Data Scientist @ Amazon',
    imageUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=VR',
    careerPath: ['M.Sc Stats', 'Analyst @ Mu Sigma', 'Data Scientist @ Amazon'],
    isTopContributor: true,
    engagementScore: 95,
  },
  {
    id: 4,
    name: 'Aditi Sharma',
    position: 'Marketing Head @ Nykaa',
    imageUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AS',
    careerPath: ['BBA', 'Marketing Intern @ L\'Oréal', 'Brand Manager @ Myntra', 'Marketing Head @ Nykaa'],
    isTopContributor: true,
    engagementScore: 89,
  },
  {
    id: 5,
    name: 'Karan Verma',
    position: 'Cloud Architect @ Oracle',
    imageUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=KV',
    careerPath: ['B.Tech IT', 'Systems Engineer @ Infosys', 'Cloud Architect @ Oracle'],
    isTopContributor: false,
    engagementScore: 71,
  },
];

export const eventData = [
  {
    id: 1,
    title: 'Cracking the PM Interview',
    speaker: 'Rohan Mehta',
    date: 'Sep 20, 2025',
    type: 'Career Talk',
  },
  {
    id: 2,
    title: 'Designing for the Future',
    speaker: 'Priya Singh',
    date: 'Sep 25, 2025',
    type: 'Workshop',
  },
  {
    id: 3,
    title: 'Data Science in E-Commerce',
    speaker: 'Vikram Rao',
    date: 'Oct 05, 2025',
    type: 'Webinar',
  },
  {
    id: 4,
    title: 'Building a D2C Brand',
    speaker: 'Aditi Sharma',
    date: 'Oct 12, 2025',
    type: 'Fireside Chat',
  },
];

export const careerPaths = [
  {
    id: 1,
    title: 'AI & Machine Learning',
    description: 'Shape the future with intelligent systems.',
    icon: Zap,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 2,
    title: 'Product Management',
    description: 'Lead products from idea to launch.',
    icon: Briefcase,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 3,
    title: 'Data Analytics',
    description: 'Turn raw data into actionable insights.',
    icon: BarChart2,
    bgColor: 'bg-sky-100',
    iconColor: 'text-sky-600'
  }
];

// Data for University BI Dashboard
export const universityStats = {
    totalAlumni: 12500,
    studentEngagement: 85, // in percent
    alumniEngagement: 72, // in percent
    topContributorsCount: alumniData.filter(a => a.isTopContributor).length,
};

export const engagementHistory = [
    { month: 'Apr', engagement: 55 },
    { month: 'May', engagement: 62 },
    { month: 'Jun', engagement: 78 },
    { month: 'Jul', engagement: 72 },
    { month: 'Aug', engagement: 85 },
    { month: 'Sep', engagement: 92 },
];

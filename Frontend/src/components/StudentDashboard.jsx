import React, { useState, useEffect, useRef } from "react";

import {

  Compass,

  Calendar,

  Mail,

  HelpCircle,

  Search,

  Bell,

  Video,

  ArrowRight,

  Star,

  Bot,

  Send,

  X,

  User,

  Zap,

  Briefcase,

  BarChart2,

  GraduationCap,

  Linkedin,

  Building,

  UserCheck,

  Frown,

  Edit3,

  Save,

  Plus,

  FileText, // <-- Make sure FileText is imported

  CheckCircle,

  XCircle,

  LogOut,

} from "lucide-react";

// NEW: Import jsPDF for PDF generation

import { jsPDF } from "jspdf";

import OpportunitiesPage from "./OpportunitiesPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";



// --- Hardcoded Data ---

const alumniData = [

  {

    id: 1,

    name: "Rohan Mehta",

    position: "Senior Product Manager @ Google",

    imageUrl: "https://placehold.co/100x100/3B82F6/FFFFFF?text=RM",

    careerPath: [

      "B.Tech",

      "Software Engineer @ TCS",

      "Product Analyst @ Swiggy",

      "Senior PM @ Google",

    ],

    isTopContributor: true,

    bio: "Passionate about building products that solve real-world problems. Experienced in leading cross-functional teams to deliver high-impact features.",

    linkedin: "https://linkedin.com/in/rohanmehta",

  },

  {

    id: 2,

    name: "Priya Singh",

    position: "UX Lead @ Microsoft",

    imageUrl: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=PS",

    careerPath: [

      "B.Des",

      "UI/UX Intern",

      "UX Designer @ Zomato",

      "UX Lead @ Microsoft",

    ],

    isTopContributor: false,

    bio: "A design leader focused on creating intuitive and beautiful user experiences. My expertise lies in user research, and building scalable design systems.",

    linkedin: "https://linkedin.com/in/priyasingh",

  },

  {

    id: 3,

    name: "Vikram Rao",

    position: "Data Scientist @ Amazon",

    imageUrl: "https://placehold.co/100x100/10B981/FFFFFF?text=VR",

    careerPath: ["M.Sc Stats", "Analyst @ Mu Sigma", "Data Scientist @ Amazon"],

    isTopContributor: true,

    bio: "I turn data into actionable insights, building machine learning models to optimize logistics and customer experience at a global scale.",

    linkedin: "https://linkedin.com/in/vikramrao",

  },

  {

    id: 4,

    name: "Aditi Sharma",

    position: "Marketing Head @ Nykaa",

    imageUrl: "https://placehold.co/100x100/F472B6/FFFFFF?text=AS",

    careerPath: [

      "BBA",

      "Marketing Intern @ L'Oréal",

      "Brand Manager @ Myntra",

      "Marketing Head @ Nykaa",

    ],

    isTopContributor: true,

    bio: "A brand strategist and marketing leader with a passion for building direct-to-consumer brands that people love.",

    linkedin: "https://linkedin.com/in/aditisharma",

  },

  ...Array.from({ length: 50 }, (_, i) => {

    const id = i + 5;

    const firstNames = [

      "Aarav",

      "Vivaan",

      "Aditya",

      "Vihaan",

      "Arjun",

      "Sai",

      "Reyansh",

      "Ayaan",

      "Krishna",

      "Ishaan",

      "Saanvi",

      "Aanya",

      "Aadhya",

      "Kiara",

      "Diya",

      "Pari",

      "Anika",

      "Riya",

      "Siya",

      "Neha",

    ];

    const lastNames = [

      "Gupta",

      "Patel",

      "Kumar",

      "Shah",

      "Joshi",

      "Menon",

      "Iyer",

      "Nair",

      "Pillai",

      "Chopra",

      "Reddy",

      "Singh",

      "Verma",

    ];

    const roles = [

      "Software Engineer",

      "Product Analyst",

      "Frontend Developer",

      "Backend Developer",

      "DevOps Specialist",

      "Business Analyst",

      "QA Engineer",

      "Digital Marketer",

      "HR Manager",

      "Financial Advisor",

      "Cloud Architect",

      "Security Analyst",

    ];

    const companies = [

      "TCS",

      "Infosys",

      "Wipro",

      "HCL",

      "Accenture",

      "Capgemini",

      "Flipkart",

      "Myntra",

      "Zomato",

      "Swiggy",

      "Paytm",

      "PhonePe",

      "AWS",

      "Deloitte",

    ];

    const name = `${firstNames[id % firstNames.length]} ${

      lastNames[id % lastNames.length]

    }`;

    const position = `${roles[id % roles.length]} @ ${

      companies[id % companies.length]

    }`;

    const initials = name

      .split(" ")

      .map((n) => n[0])

      .join("");

    const colors = ["F59E0B", "EF4444", "6366F1", "D946EF", "0EA5E9"];

    const bgColor = colors[id % colors.length];

    return {

      id,

      name,

      position,

      imageUrl: `https://placehold.co/100x100/${bgColor}/FFFFFF?text=${initials}`,

      careerPath: ["University Degree", "First Job", position],

      isTopContributor: Math.random() < 0.3,

      bio: `Experienced ${

        roles[id % roles.length]

      } with a history of working in the IT industry.`,

      linkedin: `https://linkedin.com/in/${name

        .toLowerCase()

        .replace(" ", "")}`,

    };

  }),

];

const eventData = [

  {

    id: 1,

    title: "Cracking the PM Interview",

    speaker: "Rohan Mehta",

    date: "Sep 25, 2025",

    type: "Career Talk",

    description:

      "Join Rohan Mehta, a Senior PM at Google, as he shares insider tips and strategies to ace your product management interviews.",

    imageUrl:

      "https://placehold.co/800x400/0891b2/ffffff?text=PM+Interview+Workshop",

  },

  {

    id: 2,

    title: "Designing for the Future",

    speaker: "Priya Singh",

    date: "Oct 02, 2025",

    type: "Workshop",

    description:

      "A hands-on workshop with Microsoft's UX Lead, Priya Singh. Learn the latest trends in user experience and interface design.",

    imageUrl: "https://placehold.co/800x400/4f46e5/ffffff?text=Design+Workshop",

  },

  {

    id: 3,

    title: "Data Science in E-Commerce",

    speaker: "Vikram Rao",

    date: "Oct 10, 2025",

    type: "Webinar",

    description:

      "Vikram Rao from Amazon breaks down how data science is revolutionizing the e-commerce landscape.",

    imageUrl:

      "https://placehold.co/800x400/059669/ffffff?text=Data+Science+Talk",

  },

  {

    id: 4,

    title: "Building a D2C Brand",

    speaker: "Aditi Sharma",

    date: "Oct 18, 2025",

    type: "Fireside Chat",

    description:

      "Learn the secrets of building a successful direct-to-consumer brand from the ground up with Nykaa's Marketing Head, Aditi Sharma.",

    imageUrl: "https://placehold.co/800x400/db2777/ffffff?text=D2C+Branding",

  },

];

// MODIFIED: Added recordingUrl to past event data

const pastEventData = [

  {

    id: 5,

    title: "Intro to Venture Capital",

    speaker: "Sneha Reddy",

    date: "Aug 15, 2025",

    type: "Career Talk",

    status: "Attended",

    recordingUrl: "https://drive.google.com", // Example URL

  },

  {

    id: 6,

    title: "Cloud Cost Optimization",

    speaker: "Arjun Desai",

    date: "Aug 01, 2025",

    type: "Workshop",

    status: "Missed",

    recordingUrl: "https://drive.google.com", // Example URL

  },

];

const careerPaths = [

  {

    id: 1,

    title: "AI & Machine Learning",

    description: "Shape the future with intelligent systems.",

    icon: Zap,

    bgColor: "bg-purple-100",

    iconColor: "text-purple-600",

  },

  {

    id: 2,

    title: "Product Management",

    description: "Lead products from idea to launch.",

    icon: Briefcase,

    bgColor: "bg-green-100",

    iconColor: "text-green-600",

  },

  {

    id: 3,

    title: "Data Analytics",

    description: "Turn raw data into actionable insights.",

    icon: BarChart2,

    bgColor: "bg-sky-100",

    iconColor: "text-sky-600",

  },

];

const notifications = [

  {

    id: 1,

    type: "mentorship",

    text: "Rohan Mehta accepted your mentorship request.",

    time: "2 mins ago",

  },

  {

    id: 2,

    type: "event",

    text: 'New event: "Data Science in E-Commerce" starts in 3 days.',

    time: "1 hour ago",

  },

  {

    id: 3,

    type: "message",

    text: "Priya Singh sent you a new message.",

    time: "1 day ago",

  },

];

const conversationsData = {

  1: [

    { sender: "them", text: "Hey Ananya, thanks for reaching out!" },

    { sender: "me", text: "Thank you so much, Rohan!" },

    { sender: "them", text: "Great! I'll send over some notes by tomorrow." },

  ],

  2: [{ sender: "them", text: "Hi Ananya, let's chat about UX design!" }],

};



// --- Reusable UI Components ---

const SidebarLink = ({ icon: Icon, text, active, onClick }) => (

  <a

    href="#"

    onClick={(e) => {

      e.preventDefault();

      onClick();

    }}

    className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${

      active

        ? "bg-cyan-500 text-white shadow-lg"

        : "text-slate-500 hover:bg-cyan-50 hover:text-cyan-600"

    }`}

  >

    {" "}

    <Icon size={22} strokeWidth={active ? 2.5 : 2} /> <span>{text}</span>{" "}

  </a>

);

const EventCard = ({ event, onClick }) => (

  <div

    onClick={onClick}

    className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer group shadow-md"

  >

    {" "}

    <div className="h-40 bg-slate-200 overflow-hidden">

      {" "}

      <img

        src={event.imageUrl}

        alt={event.title}

        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"

      />{" "}

    </div>{" "}

    <div className="p-5">

      {" "}

      <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">

        {" "}

        {event.type}{" "}

      </span>{" "}

      <h3 className="text-lg font-bold text-slate-800 mt-2 group-hover:text-cyan-600 transition-colors">

        {" "}

        {event.title}{" "}

      </h3>{" "}

      <p className="text-sm text-slate-500 mt-1">Hosted by {event.speaker}</p>{" "}

    </div>{" "}

    <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">

      {" "}

      <p className="text-sm font-medium text-slate-600">{event.date}</p>{" "}

      <ArrowRight

        className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all"

        size={20}

      />{" "}

    </div>{" "}

  </div>

);

const MentorCard = ({ mentor, onClick }) => (

  <div

    onClick={onClick}

    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"

  >

    {" "}

    <div className="relative">

      {" "}

      <img

        src={mentor.imageUrl}

        alt={mentor.name}

        className="w-12 h-12 rounded-full"

      />{" "}

      {mentor.isTopContributor && (

        <div className="absolute -bottom-1 -right-1 bg-amber-400 p-0.5 rounded-full border-2 border-white">

          {" "}

          <Star size={12} className="text-white fill-white" />{" "}

        </div>

      )}{" "}

    </div>{" "}

    <div className="flex-1 overflow-hidden">

      {" "}

      <h4 className="font-semibold text-slate-800 truncate">

        {mentor.name}

      </h4>{" "}

      <p className="text-sm text-slate-500 truncate">{mentor.position}</p>{" "}

    </div>{" "}

    <button className="p-2 rounded-full hover:bg-slate-200 flex-shrink-0">

      {" "}

      <ArrowRight size={18} className="text-slate-500" />{" "}

    </button>{" "}

  </div>

);

const CareerPathCard = ({ path }) => (

  <a

    href="#"

    onClick={(e) => e.preventDefault()}

    className="flex items-center gap-4 p-4 bg-white rounded-lg transition-all duration-300 hover:shadow-lg hover:border-cyan-400 hover:-translate-y-1 shadow-sm"

  >

    {" "}

    <div className={`p-3 rounded-lg ${path.bgColor}`}>

      {" "}

      <path.icon size={20} className={path.iconColor} />{" "}

    </div>{" "}

    <div>

      {" "}

      <h4 className="font-bold text-slate-800">{path.title}</h4>{" "}

      <p className="text-xs text-slate-500">{path.description}</p>{" "}

    </div>{" "}

    <ArrowRight size={18} className="text-slate-400 ml-auto" />{" "}

  </a>

);

const NotificationPanel = ({ items }) => {

  const getIcon = (type) => {

    switch (type) {

      case "mentorship":

        return <UserCheck className="text-green-500" size={20} />;

      case "event":

        return <Calendar className="text-blue-500" size={20} />;

      case "message":

        return <Mail className="text-purple-500" size={20} />;

      default:

        return <Bell className="text-slate-500" size={20} />;

    }

  };

  return (

    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50">

      {" "}

      <div className="p-4 border-b border-slate-200">

        {" "}

        <h3 className="font-bold">Notifications</h3>{" "}

      </div>{" "}

      <div className="py-2 max-h-80 overflow-y-auto">

        {" "}

        {items.map((item) => (

          <div

            key={item.id}

            className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50"

          >

            {" "}

            <div className="mt-1">{getIcon(item.type)}</div>{" "}

            <div>

              {" "}

              <p className="text-sm">{item.text}</p>{" "}

              <p className="text-xs text-slate-400">{item.time}</p>{" "}

            </div>{" "}

          </div>

        ))}{" "}

      </div>{" "}

    </div>

  );

};

const NoResults = ({ message }) => (

  <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">

    {" "}

    <Frown className="mx-auto text-slate-400" size={40} />{" "}

    <h3 className="mt-4 text-lg font-semibold text-slate-600">

      No Results Found

    </h3>{" "}

    <p className="mt-1 text-sm text-slate-500">{message}</p>{" "}

  </div>

);



// MODIFIED: Complete redesign of the PastEventCard component

const PastEventCard = ({ event, onDownloadSummary }) => {

  const isAttended = event.status === "Attended";

  return (

    <div className="bg-white p-5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1">

      <div className="flex justify-between items-start">

        <div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">

            {event.type}

          </span>

          <h3 className="text-lg font-bold text-slate-800 mt-2">

            {event.title}

          </h3>

          <p className="text-sm text-slate-500 mt-1">

            With <span className="font-medium">{event.speaker}</span> on{" "}

            {event.date}

          </p>

        </div>

        <span

          className={`flex items-center gap-1.5 text-xs font-bold ${

            isAttended

              ? "text-green-600 bg-green-50"

              : "text-red-600 bg-red-50"

          } px-2.5 py-1 rounded-full`}

        >

          {isAttended ? (

            <CheckCircle size={14} />

          ) : (

            <XCircle size={14} />

          )}{" "}

          {event.status}

        </span>

      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">

        <a

          href={event.recordingUrl}

          target="_blank"

          rel="noopener noreferrer"

          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-slate-100 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"

        >

          <Video size={16} />

          View Recording

        </a>

        <button

          onClick={() => onDownloadSummary(event)}

          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-cyan-50 text-cyan-700 px-4 py-2 rounded-full hover:bg-cyan-100 transition-colors"

        >

          <FileText size={16} />

          Download Summary

        </button>

      </div>

    </div>

  );

};



// --- Page Components ---

const FindMentorsPage = ({ onEventClick, onMentorClick, searchTerm }) => {

  const filteredMentors = searchTerm

    ? alumniData.filter(

        (m) =>

          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

          m.position.toLowerCase().includes(searchTerm.toLowerCase())

      )

    : alumniData.slice(0, 4);

  return (

    <div className="grid grid-cols-12 gap-8">

      {" "}

      <div className="col-span-12 xl:col-span-8">

        {" "}

        <h2 className="text-2xl font-bold text-slate-800">

          Upcoming Events

        </h2>{" "}

        <p className="text-slate-500 mt-1">

          Live sessions we think you'll love.

        </p>{" "}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {" "}

          {eventData.slice(0, 4).map((event) => (

            <EventCard

              key={event.id}

              event={event}

              onClick={() => onEventClick(event)}

            />

          ))}{" "}

        </div>{" "}

      </div>{" "}

      <aside className="col-span-12 xl:col-span-4">

        {" "}

        <div className="bg-white rounded-xl shadow-md p-6">

          {" "}

          <h3 className="text-lg font-bold text-slate-800">

            {searchTerm ? "Search Results" : "Recommended Mentors"}

          </h3>{" "}

          <div className="mt-4 space-y-2">

            {" "}

            {filteredMentors.length > 0 ? (

              filteredMentors.map((mentor) => (

                <MentorCard

                  key={mentor.id}

                  mentor={mentor}

                  onClick={() => onMentorClick(mentor)}

                />

              ))

            ) : (

              <NoResults message="Try a different name or role." />

            )}{" "}

          </div>{" "}

        </div>{" "}

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">

          {" "}

          <h3 className="text-lg font-bold text-slate-800">

            Explore Career Paths

          </h3>{" "}

          <div className="mt-4 space-y-3">

            {" "}

            {careerPaths.map((path) => (

              <CareerPathCard key={path.id} path={path} />

            ))}{" "}

          </div>{" "}

        </div>{" "}

      </aside>{" "}

    </div>

  );

};

const SearchEventsPage = ({ onEventClick, searchTerm, onDownloadSummary }) => { // MODIFIED: Added onDownloadSummary prop

  const [activeFilter, setActiveFilter] = useState("All");

  const featuredEvent = eventData[0];

  const eventTypes = ["All", ...new Set(eventData.map((e) => e.type))];

  const filteredEvents = eventData.filter(

    (event) =>

      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||

        event.speaker.toLowerCase().includes(searchTerm.toLowerCase())) &&

      (activeFilter === "All" || event.type === activeFilter)

  );

  return (

    <div>

      {" "}

      <div

        className="relative rounded-2xl overflow-hidden h-80 group cursor-pointer"

        onClick={() => onEventClick(featuredEvent)}

      >

        {" "}

        <img

          src={featuredEvent.imageUrl}

          alt={featuredEvent.title}

          className="absolute inset-0 w-full h-full object-cover"

        />{" "}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>{" "}

        <div className="absolute bottom-0 left-0 p-8">

          {" "}

          <h2 className="text-3xl font-bold text-white">

            {featuredEvent.title}

          </h2>{" "}

        </div>{" "}

      </div>{" "}

      <div className="mt-8">

        {" "}

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-full w-fit">

          {" "}

          {eventTypes.map((type) => (

            <button

              key={type}

              onClick={() => setActiveFilter(type)}

              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${

                activeFilter === type

                  ? "bg-cyan-500 text-white"

                  : "hover:bg-slate-100"

              }`}

            >

              {" "}

              {type}{" "}

            </button>

          ))}{" "}

        </div>{" "}

      </div>{" "}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {" "}

        {filteredEvents.length > 0 ? (

          filteredEvents.map((event) => (

            <EventCard

              key={event.id}

              event={event}

              onClick={() => onEventClick(event)}

            />

          ))

        ) : (

          <div className="col-span-3">

            {" "}

            <NoResults message="No events match your criteria." />{" "}

          </div>

        )}{" "}

      </div>{" "}

      <div className="mt-16">

        {" "}

        <h2 className="text-2xl font-bold">Event History</h2>{" "}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {" "}

          {pastEventData.map((event) => (

            <PastEventCard 

                key={event.id} 

                event={event} 

                onDownloadSummary={onDownloadSummary} // MODIFIED: Pass handler down

            />

          ))}{" "}

        </div>{" "}

      </div>{" "}

    </div>

  );

};

const MessagesPage = ({ onMentorClick }) => {

  const [conversations, setConversations] = useState(conversationsData);

  const [activeChatId, setActiveChatId] = useState(1);

  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [conversations, activeChatId]);

  const activeAlum = alumniData.find((a) => a.id === activeChatId);

  const activeMessages = conversations[activeChatId] || [];

  const handleSend = () => {

    if (!input.trim()) return;

    setConversations((prev) => ({

      ...prev,

      [activeChatId]: [

        ...(prev[activeChatId] || []),

        { sender: "me", text: input },

      ],

    }));

    setInput("");

  };

  return (

    <div className="bg-white rounded-xl shadow-xl h-full flex flex-col">

      {" "}

      <div className="flex-1 flex overflow-y-hidden">

        {" "}

        <div className="w-1/3 border-r border-slate-200 flex flex-col">

          {" "}

          <div className="p-4 border-b border-slate-200">

            {" "}

            <input

              type="text"

              placeholder="Search messages..."

              className="w-full bg-slate-100 rounded-full py-2 px-4"

            />{" "}

          </div>{" "}

          <div className="flex-1 overflow-y-auto">

            {" "}

            {alumniData.slice(0, 8).map((alum) => (

              <div

                key={alum.id}

                onClick={() => setActiveChatId(alum.id)}

                className={`p-4 flex items-center gap-3 cursor-pointer ${

                  alum.id === activeChatId ? "bg-cyan-50" : "hover:bg-slate-100"

                }`}

              >

                {" "}

                <img

                  src={alum.imageUrl}

                  alt={alum.name}

                  className="w-12 h-12 rounded-full"

                />{" "}

                <div>

                  {" "}

                  <h4>{alum.name}</h4>{" "}

                  <p className="text-sm text-slate-500 truncate">

                    {conversations[alum.id]?.slice(-1)[0]?.text || "..."}

                  </p>{" "}

                </div>{" "}

              </div>

            ))}{" "}

          </div>{" "}

        </div>{" "}

        {activeAlum && (

          <div className="w-2/3 flex flex-col">

            {" "}

            <div className="p-4 border-b border-slate-200 flex items-center justify-between">

              {" "}

              <h3 className="font-bold">{activeAlum.name}</h3>{" "}

              <button

                onClick={() => onMentorClick(activeAlum)}

                className="p-2 rounded-full hover:bg-slate-100"

              >

                {" "}

                <User size={20} />{" "}

              </button>{" "}

            </div>{" "}

            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">

              {" "}

              {activeMessages.map((msg, i) => (

                <div

                  key={i}

                  className={`flex items-end gap-2 ${

                    msg.sender === "me" ? "justify-end" : "justify-start"

                  }`}

                >

                  {" "}

                  <div

                    className={`p-3 rounded-lg max-w-md shadow-sm ${

                      msg.sender === "me"

                        ? "bg-cyan-500 text-white"

                        : "bg-white"

                    }`}

                  >

                    {" "}

                    {msg.text}{" "}

                  </div>{" "}

                </div>

              ))}{" "}

              <div ref={messagesEndRef} />{" "}

            </div>{" "}

            <div className="p-4 border-t bg-white">

              {" "}

              <div className="relative">

                {" "}

                <input

                  type="text"

                  value={input}

                  onChange={(e) => setInput(e.target.value)}

                  onKeyDown={(e) => e.key === "Enter" && handleSend()}

                  placeholder="Type a message..."

                  className="w-full bg-slate-100 rounded-full py-3 pl-5 pr-14"

                />{" "}

                <button

                  onClick={handleSend}

                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 p-2.5 rounded-full hover:bg-cyan-600 transition"

                >

                  {" "}

                  <Send size={20} className="text-white" />{" "}

                </button>{" "}

              </div>{" "}

            </div>{" "}

          </div>

        )}{" "}

      </div>{" "}

    </div>

  );

};

const SupportPage = ({ user }) => {

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  const predefinedPrompts = {

    "How do I find top mentors?":

      "You can find top mentors on the 'Find Mentors' page. They are marked with a gold star icon, indicating they are 'Top Contributors' who are highly active and recommended on the platform.",

    "How can I register for an event?":

      "To register for an event, navigate to the 'Find Mentors' or 'Search Events' page. Click on any event card you're interested in, and a popup will appear with details and a 'Join Live Session' button.",

    'What is a "Top Contributor"?':

      "A 'Top Contributor' is an alumnus who is highly engaged with the platform, either through frequent mentorship, active participation in events, or contributions to university funds. They are highlighted with a special badge.",

    "How do I view an alumnus' career path?":

      "Click on any mentor's card from the 'Recommended Mentors' list. A detailed profile view will open, showing their biography, LinkedIn profile, and a visual timeline of their 'Career Journey' from their degree to their current role.",

  };

//   const handleSend = async (messageText = input) => {

//     if (!messageText.trim() || isLoading) return;

//     const userMessage = { role: "user", text: messageText };

//     setMessages((prevMessages) => [...prevMessages, userMessage]);

//     setInput("");

//     setIsLoading(true);

//     if (predefinedPrompts[messageText]) {

//       setTimeout(() => {

//         const botResponse = {

//           role: "model",

//           text: predefinedPrompts[messageText],

//         };

//         setMessages((prevMessages) => [...prevMessages, botResponse]);

//         setIsLoading(false);

//       }, 600);

//       return;

//     }

//     const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
//     if (!GEMINI_API_KEY) {  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


//       setTimeout(() => {

//         const fallbackResponse = {

//           role: "model",

//           text: "I am currently configured to only answer the suggested questions. Please provide a Gemini API Key to enable full chat functionality.",

//         };

//         setMessages((prev) => [...prev, fallbackResponse]);

//         setIsLoading(false);

//       }, 800);

//       return;

//     }

//   
//     const systemInstruction = {

//       parts: [

//         {

//           text: `You are "LegacyLink Support Assistant," a helpful AI for an alumni platform. Your purpose is to assist students with platform-related queries about mentorship, events, networking, and career advice. Stay on-topic. If asked an unrelated question, politely refuse.`,

//         },

//       ],

//     };

//     const history = messages

//       .slice(-8)

//       .map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] }));

//     try {

//       const response = await fetch(GEMINI_API_URL, {

//         method: "POST",

//         headers: { "Content-Type": "application/json" },

//         body: JSON.stringify({

//           contents: [

//             ...history,

//             { role: "user", parts: [{ text: messageText }] },

//           ],

//           systemInstruction,

//         }),

//       });

//       if (!response.ok) throw new Error("API request failed.");

//       const data = await response.json();

//       const botResponse = {

//         role: "model",

//         text: data.candidates[0].content.parts[0].text,

//       };

//       setMessages((prev) => [...prev, botResponse]);

//     } catch (error) {

//       console.error("Gemini API Error:", error);

//       const errorResponse = {

//         role: "model",

//         text: "Sorry, I'm having trouble connecting right now. Please try again later.",

//       };

//       setMessages((prev) => [...prev, errorResponse]);

//     } finally {

//       setIsLoading(false);

//     }

//   };

const handleSend = async (messageText = input) => {
  if (!messageText.trim() || isLoading) return;

  const userMessage = { role: "user", text: messageText };
  setMessages((prevMessages) => [...prevMessages, userMessage]);
  setInput("");
  setIsLoading(true);

  if (predefinedPrompts[messageText]) {
    setTimeout(() => {
      const botResponse = {
        role: "model",
        text: predefinedPrompts[messageText],
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setIsLoading(false);
    }, 600);
    return;
  }

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // ✅ SOLUTION 1: Define the URL in the main function scope.
  // ✅ SOLUTION 2: Correct the model name to "gemini-1.5-flash-latest".
//   const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
    setTimeout(() => {
      const fallbackResponse = {
        role: "model",
        text: "I am currently configured to only answer the suggested questions. Please provide a Gemini API Key to enable full chat functionality.",
      };
      setMessages((prev) => [...prev, fallbackResponse]);
      setIsLoading(false);
    }, 800);
    return;
  }

  const systemInstruction = {
    parts: [
      {
        text: `You are "LegacyLink Support Assistant," a helpful AI for an alumni platform. Your purpose is to assist students with platform-related queries about mentorship, events, networking, and career advice. Stay on-topic. If asked an unrelated question, politely refuse.`,
      },
    ],
  };

  const history = messages
    .slice(-8)
    .map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] }));

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...history,
          { role: "user", parts: [{ text: messageText }] },
        ],
        systemInstruction,
      }),
    });

    if (!response.ok) {
      // Throw an error with more details from the API if possible
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const botResponse = {
      role: "model",
      text: data.candidates[0].content.parts[0].text,
    };
    setMessages((prev) => [...prev, botResponse]);
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorResponse = {
      role: "model",
      text: "Sorry, I'm having trouble connecting right now. Please try again later.",
    };
    setMessages((prev) => [...prev, errorResponse]);
  } finally {
    setIsLoading(false);
  }
};

  return (

    <div className="h-full flex flex-col">

      {" "}

      <h2 className="text-2xl font-bold">Support Chat</h2>{" "}

      <p className="text-slate-500 mt-1">

        {" "}

        Ask our AI assistant about the LegacyLink platform.{" "}

      </p>{" "}

      <div className="mt-6 flex-1 bg-white rounded-xl shadow-xl flex flex-col">

        {" "}

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">

          {" "}

          {messages.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-full text-center">

              {" "}

              <Bot size={48} className="text-slate-300" />{" "}

              <h3 className="mt-4 text-lg font-semibold">

                Welcome, {user.name}! How can I help?

              </h3>{" "}

              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">

                {" "}

                {Object.keys(predefinedPrompts).map((p) => (

                  <button

                    key={p}

                    onClick={() => handleSend(p)}

                    className="text-left text-sm text-cyan-700 bg-cyan-50 p-3 rounded-lg hover:bg-cyan-100"

                  >

                    {" "}

                    {p}{" "}

                  </button>

                ))}{" "}

              </div>{" "}

            </div>

          ) : (

            messages.map((msg, i) => (

              <div

                key={i}

                className={`flex items-start gap-3 ${

                  msg.role === "user" ? "justify-end" : "justify-start"

                }`}

              >

                {" "}

                {msg.role === "model" && (

                  <div className="bg-cyan-500 p-2.5 rounded-full text-white flex-shrink-0">

                    {" "}

                    <Bot size={20} />{" "}

                  </div>

                )}{" "}

                <div

                  className={`p-3 rounded-lg max-w-lg ${

                    msg.role === "user"

                      ? "bg-cyan-500 text-white"

                      : "bg-slate-100"

                  }`}

                >

                  {" "}

                  {msg.text}{" "}

                </div>{" "}

              </div>

            ))

          )}{" "}

          {isLoading && (

            <div className="flex justify-start">

              <div className="bg-slate-100 p-3 rounded-lg text-slate-500">

                Typing...

              </div>

            </div>

          )}{" "}

          <div ref={messagesEndRef} />{" "}

        </div>{" "}

        <div className="p-4 border-t border-slate-200">

          {" "}

          <div className="relative">

            {" "}

            <input

              type="text"

              value={input}

              disabled={isLoading}

              onChange={(e) => setInput(e.target.value)}

              onKeyDown={(e) => e.key === "Enter" && handleSend()}

              placeholder="Ask a question..."

              className="w-full bg-slate-100 rounded-full py-3 pl-5 pr-14 disabled:opacity-50"

            />{" "}

            <button

              onClick={() => handleSend()}

              disabled={isLoading}

              className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 p-2.5 rounded-full hover:bg-cyan-600 disabled:bg-slate-400 transition"

            >

              {" "}

              <Send size={20} className="text-white" />{" "}

            </button>{" "}

          </div>{" "}

        </div>{" "}

      </div>{" "}

    </div>

  );

};

const ProfilePage = ({ student, setUser }) => {

  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState(student);

  const [isLoading, setIsLoading] = useState(false);

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {

    setProfileData(student);

  }, [student]);

  const handleInputChange = (e) =>

    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleAddSkill = () => {

    if (

      newSkill.trim() &&

      !(profileData.interests || []).includes(newSkill.trim())

    ) {

      setProfileData((p) => ({

        ...p,

        interests: [...(p.interests || []), newSkill.trim()],

      }));

      setNewSkill("");

    }

  };

  const handleRemoveSkill = (skill) => {

    setProfileData((p) => ({

      ...p,

      interests: p.interests.filter((s) => s !== skill),

    }));

  };

  const handleSaveChanges = async () => {

    setIsLoading(true);

    const token = localStorage.getItem("token");

    try {

      const res = await fetch(`${API_URL}/user/profile`, {

        method: "PUT",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify(profileData),

      });

      if (!res.ok) throw new Error("Update failed.");

      const updatedUser = await res.json();

      setUser(updatedUser);

      setIsEditing(false);

    } catch (e) {

      alert("Could not save.");

    } finally {

      setIsLoading(false);

    }

  };

  return (

    <div className="space-y-8">

      {" "}

      <div className="flex justify-between items-center">

        {" "}

        <div>

          {" "}

          <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>{" "}

          <p className="text-slate-500 mt-1">

            Manage your public presence and personal information.

          </p>{" "}

        </div>{" "}

        <button

          onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}

          disabled={isLoading}

          className="flex items-center justify-center gap-2 w-44 bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-full shadow-md hover:bg-cyan-600 transition"

        >

          {" "}

          {isLoading ? (

            "Saving..."

          ) : isEditing ? (

            <>

              <Save size={18} />

              Save Changes

            </>

          ) : (

            <>

              <Edit3 size={18} />

              Edit Profile

            </>

          )}{" "}

        </button>{" "}

      </div>{" "}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {" "}

        {/* Left Column */}{" "}

        <div className="lg:col-span-1 space-y-8">

          {" "}

          <div className="bg-white p-6 rounded-xl shadow-md text-center">

            {" "}

            <img

              src={

                profileData.profilePicture ||

                `https://placehold.co/128x128/E2E8F0/4A5568?text=${

                  profileData.name ? profileData.name.charAt(0) : "U"

                }`

              }

              alt="Profile"

              className="w-32 h-32 rounded-full mx-auto border-4 border-cyan-500"

            />{" "}

            <div className="mt-4">

              {" "}

              {isEditing ? (

                <input

                  type="text"

                  name="name"

                  value={profileData.name || ""}

                  onChange={handleInputChange}

                  className="text-2xl font-bold text-slate-800 text-center w-full bg-slate-100 rounded-md p-1"

                />

              ) : (

                <h3 className="text-2xl font-bold text-slate-800">

                  {profileData.name}

                </h3>

              )}{" "}

              {isEditing ? (

                <input

                  type="text"

                  name="course"

                  value={profileData.course || ""}

                  onChange={handleInputChange}

                  className="text-center w-full bg-slate-100 rounded-md p-1 mt-1"

                />

              ) : (

                <p className="text-slate-500">{profileData.course || "N/A"}</p>

              )}{" "}

            </div>{" "}

          </div>{" "}

          <div className="bg-white p-6 rounded-xl shadow-md">

            {" "}

            <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">

              Contact Info

            </h4>{" "}

            <div className="mt-4 space-y-2">

              {" "}

              <p className="text-sm text-slate-500">Email Address</p>{" "}

              <p className="font-semibold text-slate-700">

                {profileData.email}

              </p>{" "}

            </div>{" "}

          </div>{" "}

        </div>{" "}

        {/* Right Column */}{" "}

        <div className="lg:col-span-2 space-y-8">

          {" "}

          <div className="bg-white p-6 rounded-xl shadow-md">

            {" "}

            <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">

              Academic Details

            </h4>{" "}

            <div className="mt-4 grid grid-cols-2 gap-4">

              {" "}

              <div>

                {" "}

                <p className="text-sm text-slate-500">College Name</p>{" "}

                {isEditing ? (

                  <input

                    type="text"

                    name="collegeName"

                    value={profileData.collegeName || ""}

                    onChange={handleInputChange}

                    className="font-semibold w-full bg-slate-100 p-1 rounded-md"

                  />

                ) : (

                  <p className="font-semibold">

                    {profileData.collegeName || "Not set"}

                  </p>

                )}{" "}

              </div>{" "}

              <div>

                {" "}

                <p className="text-sm text-slate-500">Graduating Year</p>{" "}

                {isEditing ? (

                  <input

                    type="number"

                    name="graduatingYear"

                    value={profileData.graduatingYear || ""}

                    onChange={handleInputChange}

                    className="font-semibold w-full bg-slate-100 p-1 rounded-md"

                  />

                ) : (

                  <p className="font-semibold">

                    {profileData.graduatingYear || "Not set"}

                  </p>

                )}{" "}

              </div>{" "}

            </div>{" "}

          </div>{" "}

          <div className="bg-white p-6 rounded-xl shadow-md">

            {" "}

            <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">

              Skills & Interests

            </h4>{" "}

            <div className="mt-4 flex flex-wrap gap-2">

              {" "}

              {(profileData.interests || []).map((i) => (

                <span

                  key={i}

                  className="flex items-center text-xs font-semibold bg-cyan-100 text-cyan-800 px-3 py-1.5 rounded-full"

                >

                  {" "}

                  {i}{" "}

                  {isEditing && (

                    <button

                      onClick={() => handleRemoveSkill(i)}

                      className="ml-2 text-cyan-800 hover:text-cyan-900"

                    >

                      {" "}

                      <X size={12} strokeWidth={2.5} />{" "}

                    </button>

                  )}{" "}

                </span>

              ))}{" "}

            </div>{" "}

            {isEditing && (

              <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">

                {" "}

                <input

                  type="text"

                  value={newSkill}

                  onChange={(e) => setNewSkill(e.target.value)}

                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}

                  placeholder="Add a new skill"

                  className="flex-grow border-slate-300 border rounded-full py-1.5 px-4 text-sm"

                />{" "}

                <button

                  onClick={handleAddSkill}

                  className="flex-shrink-0 bg-cyan-500 text-white p-2 rounded-full hover:bg-cyan-600"

                >

                  {" "}

                  <Plus size={16} />{" "}

                </button>{" "}

              </div>

            )}{" "}

          </div>{" "}

        </div>{" "}

      </div>{" "}

    </div>

  );

};



// --- Main Dashboard Component ---

const StudentDashboard = ({ user, handleLogout, setUser }) => {

  const [activePage, setActivePage] = useState("Find Mentors");

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [selectedMentor, setSelectedMentor] = useState(null);

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);



  useEffect(() => {

    const handleClickOutside = (e) => {

      if (

        notificationRef.current &&

        !notificationRef.current.contains(e.target)

      ) {

        setShowNotifications(false);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);



  // NEW: Handler to generate and download a PDF summary

  const downloadPdfSummary = (event) => {

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");

    doc.text("Event Summary", 20, 20);

    doc.setFont("helvetica", "normal");

    doc.text(`Title: ${event.title}`, 20, 30);

    doc.text(`Speaker: ${event.speaker}`, 20, 40);

    doc.text(`Date: ${event.date}`, 20, 50);



    doc.setFont("helvetica", "bold");

    doc.text("Key Takeaways:", 20, 70);

    doc.setFont("helvetica", "normal");

    const summaryText =

      "This is a dummy summary for the event. In a real application, this content would be generated based on the event's transcript or notes. Key topics included A, B, and C. The speaker emphasized the importance of continuous learning and networking within the industry.";

    const splitText = doc.splitTextToSize(summaryText, 170); // 170mm width

    doc.text(splitText, 20, 80);



    doc.save(`${event.title.replace(/\s/g, "_")}_Summary.pdf`);

  };



  const handleEventClick = (event) => setSelectedEvent(event);

  const handleMentorClick = (mentor) => setSelectedMentor(mentor);

  const handleCloseModal = () => {

    setSelectedEvent(null);

    setSelectedMentor(null);

  };



  const renderPage = () => {

    switch (activePage) {

      case "Find Mentors":

        return (

          <FindMentorsPage

            onEventClick={handleEventClick}

            onMentorClick={handleMentorClick}

            searchTerm={globalSearchTerm}

          />

        );

      case "Search Events":

        return (

          <SearchEventsPage

            onEventClick={handleEventClick}

            searchTerm={globalSearchTerm}

            onDownloadSummary={downloadPdfSummary} // MODIFIED: Pass handler to the page

          />

        );

      case "Messages":

        return <MessagesPage onMentorClick={handleMentorClick} />;
case "Opportunities":
        return <OpportunitiesPage user={user} userRole="student" />;
      case "Profile":

        return <ProfilePage student={user} setUser={setUser} />;

      case "Support":

        return <SupportPage user={user} />;

      default:

        return (

          <FindMentorsPage

            onEventClick={handleEventClick}

            onMentorClick={handleMentorClick}

          />

        );

    }

  };



  const animationStyles = ` @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-pop-in { animation: popIn 0.3s ease-out forwards; } `;



  return (

    <>

      <style>{animationStyles}</style>{" "}

      <div className="bg-slate-50 min-h-screen flex font-sans">

        {" "}

        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col p-4">

          {" "}

          <a href="/" className="flex items-center gap-2 px-2 py-2">

            <GraduationCap className="text-cyan-600" size={32} />

            <h1 className="text-2xl font-bold">LegacyLink</h1>{" "}

          </a>

          {" "}

          <nav className="mt-8 flex flex-col gap-3">

            {" "}

            <SidebarLink

              icon={Compass}

              text="Find Mentors"

              active={activePage === "Find Mentors"}

              onClick={() => setActivePage("Find Mentors")}

            />

            {" "}

            <SidebarLink

              icon={Calendar}

              text="Search Events"

              active={activePage === "Search Events"}

              onClick={() => setActivePage("Search Events")}

            />

            {" "}

            <SidebarLink

              icon={Mail}

              text="Messages"

              active={activePage === "Messages"}

              onClick={() => setActivePage("Messages")}

            />

            {" "}

          <SidebarLink
              icon={Briefcase}
              text="Opportunities"
              active={activePage === "Opportunities"}
              onClick={() => setActivePage("Opportunities")}
            />
            {" "}
            <SidebarLink

              icon={User}

              text="Profile"

              active={activePage === "Profile"}

              onClick={() => setActivePage("Profile")}

            />

            {" "}

            <SidebarLink

              icon={HelpCircle}

              text="Support"

              active={activePage === "Support"}

              onClick={() => setActivePage("Support")}

            />

            {" "}

          </nav>

          {" "}

          <div className="mt-auto">

            {" "}

            <button

              onClick={handleLogout}

              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"

            >

              <LogOut size={22} /> <span>Logout</span>{" "}

            </button>

            {" "}

          </div>

          {" "}

        </aside>

        {" "}

        <div className="flex-1 flex flex-col max-h-screen">

          {" "}

          <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between">

            {" "}

            <div className="relative w-96">

              {" "}

              <Search

                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"

                size={20}

              />

              {" "}

              <input

                type="text"

                placeholder="Search for mentors or events..."

                value={globalSearchTerm}

                onChange={(e) => setGlobalSearchTerm(e.target.value)}

                className="w-full bg-slate-100 rounded-full py-2.5 pl-12 pr-4"

              />

              {" "}

            </div>

            {" "}

            <div className="flex items-center gap-4">

              {" "}

              <div className="relative" ref={notificationRef}>

                {" "}

                <button

                  onClick={() => setShowNotifications((p) => !p)}

                  className="p-2.5 rounded-full hover:bg-slate-100"

                >

                  <Bell />{" "}

                </button>

                {" "}

                {showNotifications && (

                  <NotificationPanel items={notifications} />

                )}

                {" "}

              </div>

              {" "}

              <div

                onClick={() => setActivePage("Profile")}

                className="flex items-center gap-3 cursor-pointer"

              >

                {" "}

                <img

                  src={

                    user.profilePicture ||

                    `https://placehold.co/40x40/E2E8F0/4A5568?text=${user.name.charAt(

                      0

                    )}`

                  }

                  alt={user.name}

                  className="w-10 h-10 rounded-full object-cover"

                />

                {" "}

                <div>

                  {" "}

                  <p className="font-semibold text-sm">{user.name}</p>{" "}

                  <p className="text-xs text-slate-500 capitalize">

                    {user.role}

                  </p>

                  {" "}

                </div>

                {" "}

              </div>

              {" "}

            </div>

            {" "}

          </header>

          {" "}

          <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>

          {" "}

        </div>

        {/* --- MODALS --- */}{" "}

        {selectedEvent && (

          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

            {" "}

            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-pop-in">

              {" "}

              <div className="h-40 bg-slate-200 relative">

                {" "}

                <img

                  src={selectedEvent.imageUrl}

                  alt={selectedEvent.title}

                  className="w-full h-full object-cover"

                />

                {" "}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {" "}

                <button

                  onClick={handleCloseModal}

                  className="absolute top-3 right-3 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition"

                >

                  <X size={20} />{" "}

                </button>

                {" "}

              </div>

              {" "}

              <div className="p-6">

                {" "}

                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">

                  {selectedEvent.type}{" "}

                </span>

                {" "}

                <h2 className="text-3xl font-bold mt-2 text-slate-800">

                  {selectedEvent.title}{" "}

                </h2>

                {" "}

                <p className="text-slate-500 mt-1">

                  Hosted by{" "}

                  <span className="font-semibold text-slate-700">

                    {selectedEvent.speaker}{" "}

                  </span>

                  {" "}

                </p>

                {" "}

                <p className="text-slate-600 mt-4">

                  {selectedEvent.description}{" "}

                </p>

                {" "}

              </div>

              {" "}

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">

                {" "}

                <p className="font-semibold text-slate-600">

                  {selectedEvent.date}{" "}

                </p>

                {" "}

                <a

                  href="https://meet.google.com/new"

                  target="_blank"

                  rel="noopener noreferrer"

                  className="flex items-center gap-2 bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-cyan-600 transition shadow-md"

                >

                  <Video size={18} /> <span>Join Live Session</span>{" "}

                </a>

                {" "}

              </div>

              {" "}

            </div>

            {" "}

          </div>

        )}

        {" "}

        {selectedMentor && (

          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

            {" "}

            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8 relative animate-pop-in">

              {" "}

              <button

                onClick={handleCloseModal}

                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100"

              >

                <X size={20} />{" "}

              </button>

              {" "}

              <div className="flex flex-col items-center text-center">

                {" "}

                <div className="relative">

                  {" "}

                  <img

                    src={selectedMentor.imageUrl}

                    alt={selectedMentor.name}

                    className="w-28 h-28 rounded-full shadow-lg"

                  />

                  {" "}

                  {selectedMentor.isTopContributor && (

                    <div className="absolute -bottom-2 -right-2 bg-amber-400 p-1.5 rounded-full border-4 border-white">

                      _ <Star size={16} className="text-white fill-white" />{" "}

                    </div>

                  )}

                  {" "}

                </div>

                {" "}

                <h2 className="text-2xl font-bold mt-4">

                  {selectedMentor.name}

                </h2>

                {" "}

                <p className="text-cyan-600 font-semibold mt-1">

                  {selectedMentor.position}{" "}

                </p>

                {" "}

                <a

                  href={selectedMentor.linkedin}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="mt-3 inline-flex items-center gap-2 text-sm text-blue-500 hover:underline"

                >

                  <Linkedin size={16} /> View LinkedIn{" "}

                </a>

                {" "}

                <p className="mt-4 max-w-md text-slate-600">

                  {selectedMentor.bio}{" "}

                </p>

                {" "}

                <div className="w-full mt-6 pt-6 border-t border-slate-200">

                  {" "}

                  <h4 className="font-bold text-slate-800">Career Journey</h4>

                  {" "}

                  <div className="mt-3 flex items-center justify-center text-xs flex-wrap gap-2">

                    {" "}

                    {selectedMentor.careerPath.map((step, i) => (

                      <React.Fragment key={i}>

                        {" "}

                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">

                          {" "}

                          <Building size={14} className="text-slate-500" />{" "}

                          <span className="font-medium text-slate-700">

                            {step}{" "}

                          </span>

                          {" "}

                        </div>

                        {" "}

                        {i < selectedMentor.careerPath.length - 1 && (

                          <div className="w-4 border-t-2 border-slate-200 border-dotted"></div>

                        )}

                        {" "}

                      </React.Fragment>

                    ))}{" "}

                  </div>

                  {" "}

                </div>

                {" "}

                <button className="mt-8 w-full bg-cyan-500 text-white font-bold py-3 rounded-full hover:bg-cyan-600 transition shadow-md">

                  Request Mentorship{" "}

                </button>

                {" "}

              </div>

              {" "}

            </div>

            {" "}

          </div>

        )}

        {" "}

      </div>

      {" "}

    </>

  );

};
export default StudentDashboard;
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
  LogOut,
  GraduationCap,
} from "lucide-react";
import ChatSystem from './ChatSystem';

// --- Mock Data (Replace with API calls) ---
const mockMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Senior Software Engineer at Google",
    bio: "Passionate about mentoring students in software development and career growth.",
    imageUrl: "https://placehold.co/150x150/E2E8F0/4A5568?text=SJ",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    isTopContributor: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Product Manager at Microsoft",
    bio: "Helping students navigate product management and tech leadership roles.",
    imageUrl: "https://placehold.co/150x150/E2E8F0/4A5568?text=MC",
    skills: ["Product Strategy", "Leadership", "Agile", "Data Analysis"],
    isTopContributor: false,
  },
  {
    id: 3,
    name: "Emily Davis",
    position: "UX Designer at Apple",
    bio: "Design enthusiast mentoring students in UI/UX and design thinking.",
    imageUrl: "https://placehold.co/150x150/E2E8F0/4A5568?text=ED",
    skills: ["UI Design", "UX Research", "Figma", "Prototyping"],
    isTopContributor: true,
  },
];

const mockEvents = [
  {
    id: 1,
    title: "Tech Talk: Building Scalable Web Applications",
    type: "Workshop",
    speaker: "Sarah Johnson",
    date: "March 15, 2024",
    time: "3:00 PM",
    imageUrl: "https://placehold.co/400x200/E2E8F0/4A5568?text=Tech+Talk",
    description: "Learn the fundamentals of building scalable web applications using modern technologies.",
  },
  {
    id: 2,
    title: "Career Panel: Navigating Tech Industry",
    type: "Panel Discussion",
    speaker: "Industry Leaders",
    date: "March 20, 2024",
    time: "5:00 PM",
    imageUrl: "https://placehold.co/400x200/E2E8F0/4A5568?text=Career+Panel",
    description: "Join industry leaders for an insightful discussion about career opportunities in tech.",
  },
];

const mockNotifications = [
  {
    id: 1,
    text: "Sarah Johnson accepted your mentorship request!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    text: "New workshop announced: Advanced React Patterns",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    text: "Your profile view increased by 25% this week",
    time: "3 days ago",
    read: true,
  },
];

// --- Components ---
const SidebarLink = ({ icon: Icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
      active
        ? "bg-cyan-50 text-cyan-600"
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    <Icon size={20} />
    <span>{text}</span>
  </button>
);

const NotificationPanel = ({ items }) => (
  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
    <div className="p-4 border-b border-slate-200">
      <h3 className="font-semibold text-slate-800">Notifications</h3>
    </div>
    <div className="max-h-96 overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 border-b border-slate-100 hover:bg-slate-50 ${
            !item.read ? "bg-blue-50" : ""
          }`}
        >
          <p className="text-sm text-slate-700">{item.text}</p>
          <p className="text-xs text-slate-500 mt-1">{item.time}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- Page Components ---
const FindMentorsPage = ({ onEventClick, onMentorClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMentors = mockMentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Mentors</h1>
        <p className="text-slate-600">
          Connect with experienced alumni who can guide your career journey
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search mentors by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 rounded-full py-3 pl-12 pr-4"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-lg"
        >
          <option value="All">All Categories</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Product">Product</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => onMentorClick(mentor)}
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={mentor.imageUrl}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{mentor.name}</h3>
                <p className="text-sm text-slate-600">{mentor.position}</p>
              </div>
              {mentor.isTopContributor && (
                <div className="bg-amber-100 p-1.5 rounded-full">
                  <Star size={16} className="text-amber-600 fill-amber-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-4">{mentor.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
            <button className="w-full bg-cyan-500 text-white font-medium py-2 rounded-lg hover:bg-cyan-600 transition">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchEventsPage = ({ onEventClick }) => (
  <div>
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Search Events</h1>
      <p className="text-slate-600">
        Discover workshops, webinars, and networking opportunities
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mockEvents.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition cursor-pointer"
          onClick={() => onEventClick(event)}
        >
          <div className="h-48 bg-slate-200">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
              {event.type}
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-2 mb-2">
              {event.title}
            </h3>
            <p className="text-slate-600 mb-4">{event.description}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{event.date}</p>
                <p className="text-sm text-slate-500">{event.time}</p>
              </div>
              <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
                Register <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessagesPage = ({ onMentorClick }) => (
  <div>
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Messages</h1>
      <p className="text-slate-600">
        Connect with mentors and alumni for guidance and support
      </p>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
            <Bot className="text-cyan-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">AI Assistant</h3>
            <p className="text-sm text-slate-500">Always here to help</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-slate-600 mb-4">
          Start a conversation with our AI assistant or browse your mentor connections.
        </p>
        <button className="bg-cyan-500 text-white font-medium px-6 py-2 rounded-lg hover:bg-cyan-600 transition">
          Start New Conversation
        </button>
      </div>
    </div>
  </div>
);

const ProfilePage = ({ student, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(student?.profile || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // API call to update profile
      console.log("Saving profile:", profileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-slate-600">
          Manage your profile information and preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200">
              <img
                src={
                  student?.profilePicture ||
                  student?.profile?.profilePicture ||
                  `https://placehold.co/96x96/E2E8F0/4A5568?text=${(profileData.name || student?.profile?.name || student?.name || 'S').charAt(0).toUpperCase()}`
                }
                alt={profileData.name || student?.profile?.name || student?.name || 'Student'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://placehold.co/96x96/E2E8F0/4A5568?text=${(profileData.name || student?.profile?.name || student?.name || 'S').charAt(0).toUpperCase()}`;
                }}
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {profileData.name || student?.profile?.name || student?.name || 'Student'}
              </h3>
              <p className="text-slate-600">
                {profileData.collegeName || student?.profile?.collegeName || 'University'}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  College Name
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={profileData.collegeName || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={profileData.course || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  name="year"
                  value={profileData.year || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  About
                </label>
                <textarea
                  name="about"
                  value={profileData.about || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-800">{student?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Roll Number</p>
                <p className="font-medium text-slate-800">{profileData.rollNumber || student?.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Course</p>
                <p className="font-medium text-slate-800">{profileData.course || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Year</p>
                <p className="font-medium text-slate-800">{profileData.year || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500 mb-1">About</p>
                <p className="font-medium text-slate-800">{profileData.about || 'No bio available'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupportPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const predefinedPrompts = {
    "How do I find a mentor?": "You can find mentors by browsing the Find Mentors page. Use filters to search by skills, industry, or experience level.",
    "What events are available?": "Check the Search Events page for upcoming workshops, webinars, and networking opportunities.",
    "How do I update my profile?": "Go to the Profile page and click 'Edit Profile' to update your information.",
    "How do I contact mentors?": "You can send messages to mentors through the Messages page or directly from their profile.",
  };

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

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        role: "model",
        text: "I'm currently configured to answer specific questions about finding mentors, events, profile updates, and contacting mentors. Please try one of the suggested questions.",
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold">Support Chat</h2>
      <p className="text-slate-500 mt-1">
        Ask our AI assistant about the LegacyLink platform.
      </p>
      <div className="mt-6 flex-1 bg-white rounded-xl shadow-xl flex flex-col">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot size={48} className="text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold">
                Welcome, {user?.profile?.name || 'Student'}! How can I help?
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
                {Object.keys(predefinedPrompts).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-left text-sm text-cyan-700 bg-cyan-50 p-3 rounded-lg hover:bg-cyan-100"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "model" && (
                  <div className="bg-cyan-500 p-2.5 rounded-full text-white flex-shrink-0">
                    <Bot size={20} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-lg ${
                    msg.role === "user"
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-500">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="w-full bg-slate-100 rounded-full py-3 pl-5 pr-14 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 p-2.5 rounded-full hover:bg-cyan-600 disabled:bg-slate-400 transition"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const StudentDashboard = ({ user, handleLogout, setUser }) => {
  const [activePage, setActivePage] = useState("Find Mentors");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);

  const notificationRef = useRef(null);

  const handleCloseModal = () => {
    setSelectedMentor(null);
    setSelectedEvent(null);
  };

  const handleMentorClick = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const renderPage = () => {
    switch (activePage) {
      case "Find Mentors":
        return (
          <FindMentorsPage
            onEventClick={handleEventClick}
            onMentorClick={handleMentorClick}
          />
        );
      case "Search Events":
        return <SearchEventsPage onEventClick={handleEventClick} />;
      case "Messages":
        return <ChatSystem user={user} />;
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

  const animationStyles = `@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-pop-in { animation: popIn 0.3s ease-out forwards; }`;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="bg-slate-50 min-h-screen flex font-sans">
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col p-4">
          <a href="/" className="flex items-center gap-2 px-2 py-2">
            <GraduationCap className="text-cyan-600" size={32} />
            <h1 className="text-2xl font-bold">LegacyLink</h1>
          </a>
          <nav className="mt-8 flex flex-col gap-3">
            <SidebarLink
              icon={Compass}
              text="Find Mentors"
              active={activePage === "Find Mentors"}
              onClick={() => setActivePage("Find Mentors")}
            />
            <SidebarLink
              icon={Calendar}
              text="Search Events"
              active={activePage === "Search Events"}
              onClick={() => setActivePage("Search Events")}
            />
            <SidebarLink
              icon={Mail}
              text="Messages"
              active={activePage === "Messages"}
              onClick={() => setActivePage("Messages")}
            />
            <SidebarLink
              icon={User}
              text="Profile"
              active={activePage === "Profile"}
              onClick={() => setActivePage("Profile")}
            />
            <SidebarLink
              icon={HelpCircle}
              text="Support"
              active={activePage === "Support"}
              onClick={() => setActivePage("Support")}
            />
          </nav>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={22} /> <span>Logout</span>
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col max-h-screen">
          <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="relative w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for mentors or events..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="w-full bg-slate-100 rounded-full py-2.5 pl-12 pr-4"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications((p) => !p)}
                  className="p-2.5 rounded-full hover:bg-slate-100"
                >
                  <Bell />
                </button>
                {showNotifications && (
                  <NotificationPanel items={notifications} />
                )}
              </div>
              <div
                onClick={() => setActivePage("Profile")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={
                    user.profilePicture ||
                    user.profile?.profilePicture ||
                    `https://placehold.co/40x40/E2E8F0/4A5568?text=${(user.profile?.name || user.name || 'User').charAt(0).toUpperCase()}`
                  }
                  alt={user.profile?.name || user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/40x40/E2E8F0/4A5568?text=${(user.profile?.name || user.name || 'User').charAt(0).toUpperCase()}`;
                  }}
                />
                <div>
                  <p className="font-semibold text-sm">{user.profile?.name || user.name || 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>
        </div>
      </div>
      {/* --- MODALS --- */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-pop-in">
            <div className="h-40 bg-slate-200 relative">
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
                {selectedEvent.type}
              </span>
              <h2 className="text-3xl font-bold mt-2 text-slate-800">
                {selectedEvent.title}
              </h2>
              <p className="text-slate-500 mt-1">
                Hosted by{" "}
                <span className="font-semibold text-slate-700">
                  {selectedEvent.speaker}
                </span>
              </p>
              <p className="text-slate-600 mt-4">
                {selectedEvent.description}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <p className="font-semibold text-slate-600">
                {selectedEvent.date}
              </p>
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-cyan-600 transition shadow-md"
              >
                <Video size={18} /> <span>Join Live Session</span>
              </a>
            </div>
          </div>
        </div>
      )}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8 relative animate-pop-in">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={selectedMentor.imageUrl}
                  alt={selectedMentor.name}
                  className="w-28 h-28 rounded-full shadow-lg"
                />
                {selectedMentor.isTopContributor && (
                  <div className="absolute -bottom-2 -right-2 bg-amber-400 p-1.5 rounded-full border-4 border-white">
                    <Star size={16} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-4">
                {selectedMentor.name}
              </h2>
              <p className="text-slate-500">{selectedMentor.position}</p>
              <p className="text-slate-600 mt-2">{selectedMentor.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {selectedMentor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setActivePage("Messages");
                  setSelectedMentor(null);
                }}
                className="mt-6 bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-cyan-600 transition shadow-md"
              >
                <Mail size={18} className="inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDashboard;

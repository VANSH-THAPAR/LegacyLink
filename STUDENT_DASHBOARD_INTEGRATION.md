# Student Dashboard Integration - Simple Copy-Paste Guide

## Step 1: Add Import (Line 68)

Find this line (around line 65-68):
```javascript
import { jsPDF } from "jspdf";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

Change it to:
```javascript
import { jsPDF } from "jspdf";

// Import Opportunities Page
import OpportunitiesPage from "./OpportunitiesPage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

## Step 2: Add Sidebar Link (Line 2789)

Find this section (around line 2777-2802):
```javascript
            <SidebarLink

              icon={Mail}

              text="Messages"

              active={activePage === "Messages"}

              onClick={() => setActivePage("Messages")}

            />

            {" "}

            <SidebarLink

              icon={User}

              text="Profile"

              active={activePage === "Profile"}

              onClick={() => setActivePage("Profile")}

            />
```

Change it to:
```javascript
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
```

## Step 3: Add Render Case (Line 2687)

Find this section (around line 2685-2691):
```javascript
      case "Messages":

        return <MessagesPage onMentorClick={handleMentorClick} />;

      case "Profile":

        return <ProfilePage student={user} setUser={setUser} />;
```

Change it to:
```javascript
      case "Messages":

        return <MessagesPage onMentorClick={handleMentorClick} />;

      case "Opportunities":

        return <OpportunitiesPage user={user} userRole="student" />;

      case "Profile":

        return <ProfilePage student={user} setUser={setUser} />;
```

---

That's it! Save the file and the Opportunities page will appear in your Student Dashboard.

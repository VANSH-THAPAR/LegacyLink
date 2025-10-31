# Opportunities Page Integration Guide

## ✅ Completed Components

### Backend
1. **Opportunity Model** - `Backend/models/opportunitySchema.js`
2. **API Routes** - `Backend/routes/opportunities.js`
3. **Server Integration** - Updated `Backend/server.js` with opportunities route

### Frontend
1. **Main Page** - `Frontend/src/components/OpportunitiesPage.jsx`
2. **Opportunity Card** - `Frontend/src/components/OpportunityCard.jsx`
3. **Post Modal** - `Frontend/src/components/PostOpportunityModal.jsx`
4. **Details Modal** - `Frontend/src/components/OpportunityDetailsModal.jsx`

## 📝 Manual Integration Steps

### Step 1: Integrate into Student Dashboard

Edit `Frontend/src/components/StudentDashboard.jsx`:

**A. Add Import (after line 65)**
```javascript
// Import Opportunities Page
import OpportunitiesPage from "./OpportunitiesPage";
```

**B. Add Sidebar Link (around line 2789, after Messages link)**
```javascript
            <SidebarLink
              icon={Briefcase}
              text="Opportunities"
              active={activePage === "Opportunities"}
              onClick={() => setActivePage("Opportunities")}
            />
```

**C. Add Render Case (around line 2689, after Messages case)**
```javascript
      case "Opportunities":
        return <OpportunitiesPage user={user} userRole="student" />;
```

### Step 2: Integrate into Alumni Dashboard

Edit `Frontend/src/components/AlumniDashboard.jsx`:

**A. Add Import (after existing imports)**
```javascript
import OpportunitiesPage from './OpportunitiesPage';
```

**B. Add Sidebar Link (in the sidebar navigation)**
```javascript
<SidebarLink 
    icon={Briefcase} 
    text="Opportunities" 
    active={activePage === 'Opportunities'} 
    onClick={() => setActivePage('Opportunities')} 
/>
```

**C. Add Render Case (in the renderPage function)**
```javascript
if (activePage === 'Opportunities') {
    return <OpportunitiesPage user={alumni} userRole="alumni" />;
}
```

## 🎨 Design Features

### Consistent with Existing Design
- **Colors**: Cyan-600 primary, matching existing theme
- **Typography**: Same font families and weights
- **Components**: Reuses existing card styles, buttons, and layouts
- **Animations**: Framer Motion animations matching dashboard
- **Icons**: Lucide React icons consistent with site

### Key Features
✅ **Hero Banner** - Gradient background with call-to-action
✅ **Search & Filters** - Advanced filtering by type, location, category
✅ **Tabs** - All, Internships, Jobs, Collaborations, Projects
✅ **Opportunity Cards** - Clean, professional design with hover effects
✅ **Post Modal** - Alumni can create opportunities
✅ **Details Modal** - Full opportunity information
✅ **Bookmarking** - Students can save opportunities
✅ **Application Tracking** - Track views and applications

## 🔧 API Endpoints

All endpoints are prefixed with `/api/opportunities`:

- `GET /` - Get all opportunities (with filters)
- `GET /:id` - Get single opportunity
- `POST /` - Create opportunity (Alumni only)
- `PUT /:id` - Update opportunity (Owner only)
- `DELETE /:id` - Delete opportunity (Owner only)
- `POST /:id/bookmark` - Bookmark/unbookmark (Students only)
- `POST /:id/apply` - Track application
- `GET /my/posted` - Get opportunities posted by logged-in alumni

## 🗄️ Database Schema

```javascript
{
  title: String (required),
  description: String (required),
  type: String (enum: internship, job, collaboration, project),
  company: String (required),
  companyLogo: String,
  postedBy: ObjectId (ref: Alumni),
  location: String (required),
  locationType: String (enum: on-site, remote, hybrid),
  stipend: String,
  duration: String,
  skills: [String],
  applyLink: String,
  contactEmail: String,
  linkedinUrl: String,
  deadline: Date,
  category: String (enum: tech, marketing, design, etc.),
  experienceLevel: String,
  isActive: Boolean,
  isFeatured: Boolean,
  views: Number,
  applications: Number,
  bookmarkedBy: [ObjectId]
}
```

## 🚀 Testing

1. **Start Backend**: `cd Backend && npm start`
2. **Start Frontend**: `cd Frontend && npm run dev`
3. **Test as Student**:
   - View opportunities
   - Search and filter
   - Bookmark opportunities
   - View details and apply
4. **Test as Alumni**:
   - Post new opportunities
   - View posted opportunities
   - Edit/delete own opportunities

## 📱 Responsive Design

- **Desktop**: 3-column grid
- **Tablet**: 2-column grid
- **Mobile**: 1-column stack
- All modals are mobile-friendly
- Touch-optimized interactions

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications** - Notify students of new opportunities
2. **Application System** - Built-in application submission
3. **Resume Upload** - One-click apply with resume
4. **Success Stories** - Showcase placements
5. **Analytics Dashboard** - Track opportunity performance
6. **Company Verification** - Verify company/startup legitimacy

## ✨ Summary

The Opportunities page is fully designed and built with:
- ✅ Complete backend API with authentication
- ✅ MongoDB schema with indexes
- ✅ Beautiful, responsive UI matching existing design
- ✅ Separate views for students and alumni
- ✅ Advanced search and filtering
- ✅ Bookmark and application tracking
- ✅ Modal-based posting and viewing

Just follow the integration steps above to add it to your dashboards!

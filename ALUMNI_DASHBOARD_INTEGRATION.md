# Alumni Dashboard Integration - Simple Copy-Paste Guide

## Step 1: Add Import

At the top of `Frontend/src/components/AlumniDashboard.jsx`, after the existing imports (around line 10), add:

```javascript
import OpportunitiesPage from './OpportunitiesPage';
```

## Step 2: Add Sidebar Link

In the sidebar navigation section, add this link (place it after Messages and before Profile):

```javascript
<SidebarLink 
    icon={Briefcase} 
    text="Opportunities" 
    active={activePage === 'Opportunities'} 
    onClick={() => setActivePage('Opportunities')} 
/>
```

## Step 3: Add Render Case

In the component's render logic, add this case to handle the Opportunities page:

```javascript
if (activePage === 'Opportunities') {
    return <OpportunitiesPage user={alumni} userRole="alumni" />;
}
```

Place this check alongside the other page checks (like 'Dashboard', 'Messages', 'Network', etc.)

---

**Note:** The Alumni Dashboard uses a different structure than Student Dashboard. Look for where other pages like 'Messages', 'Network', and 'Events' are rendered, and add the Opportunities case in the same pattern.

Make sure `Briefcase` icon is imported from lucide-react at the top of the file.

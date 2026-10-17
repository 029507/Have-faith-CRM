# Have Faith CRM - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation (5 minutes)

```bash
# Navigate to project directory
cd "C:\Users\siddh\OneDrive\Desktop\Have faith\crm-app"

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

**App will be available at**: `http://localhost:3000`

---

## 🎯 What You Can Do Right Now

### 1. **Explore the Dashboard**
Navigate to `/dashboard` to see:
- KPI cards (Total Bookings, Revenue, Customers, Conversion Rate)
- Booking overview chart
- Revenue trends
- Lead status distribution

### 2. **Test CRUD Operations**
All these modules are fully functional with mock data:

#### Bookings
- View all bookings: `/bookings`
- Create new: `/bookings/new`
- Edit/delete from list
- Track booking progress through stages
- Document upload (UI ready)

#### Leads
- View all leads: `/leads`
- Create new: `/leads/new`
- Assign leads to team members
- View assignment history
- Filter by status

#### Campaigns
- Create campaigns: `/campaigns/new`
- Bulk upload leads (UI ready)
- Round-robin distribution (logic ready)
- Track campaign status

#### Invoices
- View all: `/invoices`
- Create new: `/invoices/new`
- Generate payment links
- Track payment status
- Export to Excel (UI ready)

#### Employees & Users
- Create and manage employees: `/employees`
- Create and manage users: `/users`
- Assign roles (Admin, Manager, User, Employee)
- Upload documents

#### Masters
- Services: `/services`
- Banks: `/banks`
- Customers: `/customers`

#### Other
- B2B Productivity: `/b2b-productivity`
- Trash (deleted items): `/trash`
- Payment Links: `/payment-links`

### 3. **Test Authorization System**

The app includes role-based access control. To test different roles:

**Edit**: `lib/mockAuth.ts` line 3:

```typescript
export const getCurrentUser = (): AuthContext => {
  return {
    userId: 'test-user',
    role: 'admin',  // Change to: 'manager', 'user', or 'employee'
  };
};
```

Then refresh the page to see permission changes:
- **Admin**: Full access to everything
- **Manager**: Can create/edit/delete most items, cannot manage users/banks
- **User**: Can create/edit/delete basic items, cannot assign leads
- **Employee**: Read-only access to most features

### 4. **Test Light/Dark Mode**
Check the sidebar - there's a theme toggle (currently visible as a placeholder in the UI).

---

## 📋 Current Features Status

### ✅ Working Now
- All pages and navigation
- CRUD operations (Create, Read, Update, Delete)
- Form validation
- Toast notifications
- Responsive design
- Authorization checks
- Mock data generation
- Pagination and filtering
- Sorting by columns

### 🟡 Ready but Need Backend
- Export to PDF/Excel/Word
- Document uploads to storage
- Email/SMS notifications
- Payment link generation
- Real data persistence
- Real authentication

---

## 🔧 Project Structure Quick Reference

```
crm-app/
├── app/                    # 23 pages
│   ├── layout.tsx         # Sidebar + routing
│   ├── dashboard/
│   ├── bookings/
│   ├── leads/
│   ├── campaigns/
│   ├── invoices/
│   └── ... (13 more modules)
├── components/
│   ├── Sidebar.tsx        # Navigation menu
│   └── DataTable.tsx      # Reusable table
├── lib/
│   ├── api.ts             # 80+ mock API methods
│   ├── auth.ts            # Authorization logic
│   ├── mockAuth.ts        # Mock user provider
│   ├── types.ts           # TypeScript interfaces
│   └── mockData.ts        # Sample data
└── public/                # Static files
```

---

## 🎓 Understanding the Code

### API Layer (lib/api.ts)
All backend operations go through here:

```typescript
// Example: Create a booking
const booking = await api.createBooking({
  customerId: 'cust-123',
  serviceId: 'svc-456',
  date: '2026-10-20',
  // ... other fields
}, currentUser);
```

**Each method includes**:
- Input validation
- Authorization check (who can do this?)
- Error handling
- Success/failure response

### Authorization (lib/auth.ts)
Every operation is protected:

```typescript
// Check if user can create a booking
canCreateBooking(userRole)  // Returns: true/false

// Check if user can delete a booking
canDeleteBooking(userRole)  // Returns: true/false
```

### Types (lib/types.ts)
All data structures defined:

```typescript
interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  // ... more fields
}
```

---

## 🚦 Common Tasks

### Add a New Menu Item
Edit `components/Sidebar.tsx`:
```typescript
const menuItems = [
  // ... existing items
  {
    name: 'My New Module',
    href: '/my-module',
    icon: DocumentIcon,  // Any Lucide icon
  },
];
```

### Add a New Page
1. Create `app/my-module/page.tsx`
2. Add API methods to `lib/api.ts`
3. Add types to `lib/types.ts`
4. Add menu item to Sidebar

### Test Authorization
1. Change role in `lib/mockAuth.ts`
2. Try creating/deleting items
3. Check console for auth errors

### View Mock Data
Check `lib/mockData.ts` to see sample data structure.

---

## 🔍 Testing Checklist

### UI/UX Testing
- [ ] All pages load without errors
- [ ] Sidebar navigation works
- [ ] Forms submit successfully
- [ ] Validation messages appear
- [ ] Toast notifications show
- [ ] Mobile view is responsive
- [ ] Dark/light mode works (when theme added)

### Feature Testing
- [ ] Create new items in each module
- [ ] Edit existing items
- [ ] Delete items (check confirmation)
- [ ] Filter and search work
- [ ] Pagination works with large lists
- [ ] Sort columns by clicking headers

### Authorization Testing
- [ ] Change role in mockAuth.ts
- [ ] Verify permissions enforce correctly
- [ ] Check error messages are user-friendly
- [ ] Verify unauthorized users can't access

### Build & Deployment
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` shows no critical issues
- [ ] All 26 pages prerender successfully
- [ ] TypeScript shows 0 errors

---

## 📞 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Authorization Errors
1. Check `lib/mockAuth.ts` - is role set correctly?
2. Check console - what's the exact error?
3. Review `lib/auth.ts` for the permission rule

### Data Not Persisting
**Expected behavior!** Demo mode uses in-memory storage. Data resets on refresh.  
This is intentional until real database is connected.

---

## 🚀 Next Phase: Backend Integration

When you're ready to move to production, these steps are planned:

### Week 1
1. **Connect Real Database** (Supabase)
   - Replace `lib/api.ts` mock methods with real database calls
   - Setup PostgreSQL schema
   - Enable Row-Level Security

2. **Implement Authentication**
   - Replace `lib/mockAuth.ts` with NextAuth.js or Supabase Auth
   - Add login/signup pages
   - Setup session management

3. **Add Payment Provider**
   - Choose provider (Razorpay recommended)
   - Generate payment links
   - Handle webhooks

### Week 2
4. **Deploy to Staging**
   - Vercel staging environment
   - Client review and feedback

5. **Client UAT**
   - 5 working days for testing
   - Bug fixes and improvements

### Week 3+
6. **Production Deployment**
   - Production environment
   - 15-day post-deployment support

---

## 📚 Key Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Main project documentation |
| `README_AUTHORIZATION.md` | Complete auth system guide |
| `AUTHORIZATION_QUICK_REFERENCE.md` | Quick auth reference |
| `PROJECT_STATUS_OCTOBER_16.md` | Full status report |
| Code comments | Inline documentation |

---

## 💡 Pro Tips

1. **Hot Reload**: Changes to code auto-reload in browser (no page refresh needed)
2. **Console Errors**: Check browser DevTools console for errors during testing
3. **Mock Data**: Edit `lib/mockData.ts` to customize sample data
4. **Git Workflow**: Create feature branch before making changes
5. **Commits**: Use descriptive commit messages
6. **Pull Requests**: Create PR to main when feature is complete

---

## ✅ You're Ready!

The application is fully functional and ready to explore. Start the dev server and navigate through all the pages. The UI/UX is complete and production-ready for the frontend layer.

When you're ready for Phase 2 (backend integration), refer to the task list in the project for the next steps.

**Questions?** Check the documentation or review the inline code comments - everything is thoroughly documented.

---

**Last Updated**: October 16, 2026  
**Status**: Ready to use ✅  
**Next Phase**: Backend Integration (when ready)

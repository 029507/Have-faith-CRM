# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. **Start the Application**
```bash
cd "C:/Users/siddh/OneDrive/Desktop/Have faith/crm-app"
npm run dev
```
Visit: [http://localhost:3000](http://localhost:3000)

### 2. **Explore the Dashboard**
- You'll land on the Dashboard automatically
- See KPI cards, charts, and metrics
- All data is pre-populated with samples

### 3. **Navigate Modules**
Click any item in the left sidebar to access:
- 📊 **Dashboard** - Overview & metrics
- 📅 **Bookings** - Appointment management
- 👥 **Leads** - Sales pipeline
- 📢 **Campaigns** - Marketing campaigns
- 💳 **Payment Links** - Payment tracking
- 📄 **Invoices** - Billing
- 🔧 **Services** - Service catalog
- 👤 **Customers** - Customer database
- 👨‍💼 **Employees** - Staff directory
- 🔐 **Users** - User management
- 🏦 **Banks** - Bank accounts
- 📈 **B2B Productivity** - Analytics

---

## 📌 Common Tasks

### Create a New Booking
1. Click **Bookings** → **New Booking**
2. Select customer and service
3. Choose date and time
4. Click **Create Booking**
5. See success message

### Add a Lead
1. Go to **Leads** → **New Lead**
2. Enter name, email, company
3. Select source (LinkedIn, Email, etc.)
4. Click **Create Lead**

### Create an Invoice
1. Navigate to **Invoices** → **New Invoice**
2. Select customer
3. Enter amount and tax
4. Set due date
5. Click **Create Invoice**

### View Analytics
1. Click **B2B Productivity**
2. See lead status distribution
3. Check top companies
4. Review conversion metrics

---

## 🔄 Status Management

### Update Booking Status
1. On Bookings list, use the **Status** dropdown
2. Change from Pending → Confirmed → Completed
3. Updates automatically

### Change Lead Status
1. On Leads list, click the **Status** dropdown
2. Progression: New → Contacted → Qualified → Won/Lost
3. Filter by status using buttons above the table

---

## 🗑️ Delete Records

1. Find the delete icon (trash can) in any table
2. Confirmation dialog appears
3. Click "Yes" to delete
4. Record removed instantly

---

## 📊 Dashboard Metrics

The dashboard automatically calculates:
- **Total Bookings** - All bookings in system
- **Total Revenue** - Sum of paid invoices
- **Total Customers** - Customer count
- **Conversion Rate** - Won deals ÷ Total leads
- **Pending Bookings** - Not yet confirmed
- **Completed Bookings** - Finished appointments

---

## 💡 Tips

✅ All data resets on page refresh (demo mode)  
✅ Required fields are marked with *  
✅ Use status filters to find specific records  
✅ Pagination shows 10 items per page  
✅ Hover over actions for quick info  

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📱 Mobile Access

Open [http://localhost:3000](http://localhost:3000) on any device:
- ✅ Mobile phones
- ✅ Tablets
- ✅ Laptops
- ✅ Desktops

---

## ❓ FAQ

**Q: Where is my data saved?**
A: Demo mode uses in-memory storage. Refreshing the page resets data.

**Q: Can I use this with a real database?**
A: Yes! See README.md for database integration instructions.

**Q: How do I add more sample data?**
A: Edit `lib/mockData.ts` and restart the server.

**Q: Is this mobile-responsive?**
A: Yes! Try resizing your browser or opening on a phone.

**Q: Can I deploy this?**
A: Yes! See README.md for Vercel, Netlify, and Docker deployment.

---

## 🎯 Next Steps

1. ✅ Explore all 12 modules
2. ✅ Try creating, editing, and deleting records
3. ✅ Check out the B2B Productivity analytics
4. ✅ Review the README for advanced features
5. ✅ Integrate with a real database when ready

---

**Happy CRMing! 🚀**

For detailed documentation, see `README.md` and `IMPLEMENTATION_SUMMARY.md`

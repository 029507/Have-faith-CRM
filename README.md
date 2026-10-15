# CRM Pro - Business Management System

A modern, full-featured CRM (Customer Relationship Management) web application built with Next.js, TypeScript, Tailwind CSS, and Recharts. Manage bookings, leads, campaigns, invoices, employees, and more with an intuitive interface.

## Features

### Core Modules

- **Dashboard**: Real-time KPI cards, booking overview, revenue trends, and conversion metrics
- **Booking Management**: Create, view, and manage bookings with status tracking
- **Lead Management**: Track leads from multiple sources with status progression (New → Won/Lost)
- **Lead Campaigns**: Email, SMS, call, and meeting-based campaigns with detailed configuration
- **Payment Links**: Generate and track payment links for invoices
- **Invoice Management**: Create invoices, track payments, and manage financial records
- **Services**: Define and manage service offerings with pricing and duration
- **Customers**: Maintain customer database with contact information
- **Employees**: Employee directory with multi-step profile creation
- **User Administration**: Role-based user management (Admin, Manager, User, Employee)
- **Bank Management**: Secure bank account information storage
- **B2B Lead Productivity**: Analytics and insights for B2B lead management

### Key Features

- ✅ Full CRUD operations for all entities
- ✅ Role-based access control
- ✅ Real-time dashboard with live metrics
- ✅ Multi-step form workflows
- ✅ Data persistence with in-memory storage (demo mode)
- ✅ Responsive design for desktop and tablets
- ✅ Toast notifications for user feedback
- ✅ Status filters and sorting
- ✅ Pagination for large datasets
- ✅ Interactive charts and analytics

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Database**: Mock in-memory (demo mode)
- **Deployment**: Vercel-ready

## Installation

### Prerequisites

- Node.js 18+ or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd crm-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your settings:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
DEMO_MODE=true
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Dashboard
Access real-time metrics, booking overview, and revenue trends:
- Navigate to `/dashboard` (default landing page)
- View KPI cards showing total bookings, revenue, customers, and conversion rate
- Monitor pending vs completed bookings
- Track revenue trends

### Managing Bookings
- Navigate to `/bookings`
- Click "New Booking" to create a booking
- Select customer, service, date, and time
- Update status (Pending → Confirmed → Completed)
- Delete bookings with confirmation

### Managing Leads
- Navigate to `/leads`
- Add new leads with company, source, and contact info
- Filter by status: New, Contacted, Qualified, Won, Lost
- Track lead progression through the sales pipeline
- Identify top companies and conversion sources

### Lead Campaigns
- Navigate to `/campaigns`
- Create campaigns (Email, SMS, Call, Meeting types)
- Set campaign dates and descriptions
- Track campaign status: Draft, Active, Completed, Paused
- Monitor campaign performance

### Financial Management
- **Invoices** (`/invoices`): Create, track, and manage invoices
- **Payment Links** (`/payment-links`): Generate payment links for invoices
- **Banks** (`/banks`): Store bank account information securely

### User & Employee Management
- **Users** (`/users`): Add users with roles (Admin, Manager, User, Employee)
- **Employees** (`/employees`): Multi-step employee profile creation
- **Services** (`/services`): Define service offerings
- **Customers** (`/customers`): Maintain customer database

### B2B Analytics
- Navigate to `/b2b-productivity`
- View lead distribution by status
- See top companies and lead sources
- Track active campaigns and conversion metrics

## Project Structure

```
crm-app/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Home redirect
│   ├── dashboard/
│   ├── bookings/
│   ├── leads/
│   ├── campaigns/
│   ├── invoices/
│   ├── payment-links/
│   ├── services/
│   ├── customers/
│   ├── employees/
│   ├── users/
│   ├── banks/
│   ├── b2b-productivity/
│   └── globals.css
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── DataTable.tsx           # Reusable data table
├── lib/
│   ├── api.ts                  # Mock API layer
│   ├── mockData.ts             # Sample data
│   └── types.ts                # TypeScript interfaces
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. Create page components in `app/module-name/page.tsx`
2. Add API handlers in `lib/api.ts`
3. Define types in `lib/types.ts`
4. Use reusable `DataTable` component for lists
5. Add mock data in `lib/mockData.ts`

### Data Flow

```
UI Components
    ↓
API Layer (lib/api.ts)
    ↓
Mock Store (in-memory)
    ↓
Data Display
```

## Demo Mode

The application runs in demo mode with mock data. All data is stored in memory and will be reset on page refresh. This is perfect for:

- ✅ Testing and development
- ✅ Product demonstrations
- ✅ User training
- ✅ UI/UX validation

### To Connect Real Database (Future):

1. Replace mock API in `lib/api.ts` with Supabase client
2. Set up Supabase project
3. Create database tables matching types in `lib/types.ts`
4. Implement authentication in layout
5. Add row-level security policies

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy

```bash
vercel deploy --prod
```

### Deploy to Other Platforms

The application is compatible with:
- Netlify
- AWS Amplify
- Docker containers
- Traditional hosting

## Security Considerations

- ✅ Input validation on all forms
- ✅ Confirmation dialogs for destructive actions
- ✅ Environment variables for sensitive data
- ✅ CSRF protection ready
- ✅ Secure password fields

### Before Production:

1. Replace mock API with real database
2. Implement proper authentication
3. Add row-level security policies
4. Enable HTTPS
5. Implement audit logging
6. Add rate limiting
7. Set up monitoring and alerting

## Performance Optimizations

- Next.js automatic code splitting
- Image optimization
- CSS compression
- Efficient data pagination
- Debounced search (ready)
- Lazy loading (ready)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

1. **Demo Mode**: All data resets on refresh (in-memory storage)
2. **Authentication**: Currently no user authentication (next phase)
3. **Real Payments**: Payment links are demo only
4. **File Uploads**: Profile images not yet implemented
5. **Advanced Exports**: PDF/Excel exports not yet implemented

## Roadmap

- [ ] Real database integration (Supabase)
- [ ] User authentication & authorization
- [ ] Invoice PDF generation
- [ ] Email notifications
- [ ] SMS integration
- [ ] Calendar view for bookings
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Dark mode
- [ ] Multi-language support

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Data Not Persisting
This is expected behavior in demo mode. Data is stored in memory and resets on page refresh.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Create an issue on GitHub

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)
- [React Hot Toast](https://react-hot-toast.com/)

---

**Version**: 1.0.0  
**Last Updated**: October 2026  
**Status**: ✅ Fully Functional (Demo Mode)

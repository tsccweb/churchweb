# The Shepherds Community Centre Resurrection (TSCC)

Enterprise Church Management Website - Production-Ready Full Stack Application

##  Project Overview

TSCC Resurrection is a complete, enterprise-grade church management system built with modern technologies:

- **Backend**: Laravel 12 + PostgreSQL + RESTful API
- **Frontend**: React 19 + Vite + Pure CSS (no frameworks)
- **Authentication**: Laravel Sanctum (Token-based)
- **Payments**: Stripe-ready integration
- **Architecture**: Service Layer, Repository Pattern, Policy-Based Authorization

##  Project Structure

```
resurrection/
 Laravel Backend (Root)
    app/
       Models/              # Eloquent models (Event, Sermon, Donation, etc.)
       Http/
          Controllers/Api/ # API controllers for public endpoints
          Controllers/Admin/ # Admin panel controllers
          Requests/        # Form validation classes
          Resources/       # API resource transformers
       Services/            # Business logic services
       Repositories/        # Data access repositories
       Policies/            # Authorization policies
       Traits/              # Reusable traits
    database/
       migrations/          # All database schema migrations
       seeders/             # Database seeders with demo data
       factories/           # Model factories for testing
    routes/
       api.php              # API routes (/api/v1/)
       web.php              # Web routes
    config/                  # Configuration files
    .env.example             # Environment template
    composer.json            # PHP dependencies

 React Frontend (tscc/)
    src/
       App.jsx              # Main app component with routes
       main.jsx             # Entry point
       components/
          shared/          # Reusable UI components (Button, Card, etc.)
          home/            # Home page specific components
          admin/           # Admin panel specific components
       pages/
          public/          # Public pages (Home, About, Events, etc.)
          admin/           # Admin pages (Dashboard, Management, etc.)
       layouts/             # Layout wrappers (PublicLayout, AdminLayout)
       services/            # API service layer (api.js)
       context/             # Global state (Auth, Theme)
       hooks/               # Custom React hooks
       styles/
          variables.css    # CSS variables & utilities
          animations.css   # Keyframe animations
          components.css   # Component styles
       utils/               # Utility functions
       assets/              # Images, icons
    index.html               # HTML entry point
    package.json             # Node dependencies
    vite.config.js           # Vite configuration
    .env.example             # Frontend env template

 Configuration Files
     docker-compose.yml       # Docker setup (optional)
     nginx.conf              # Nginx configuration
     README.md               # This file
```

##  Database Schema

### Core Models

**Users** - Admin users with roles
```sql
- id (UUID)
- name
- email (unique)
- password (hashed)
- email_verified_at
- created_at, updated_at
```

**Roles** - Admin roles for RBAC
```sql
- id (UUID)
- name (unique)
- description
```

**Events** - Church events
```sql
- id (UUID)
- title
- description
- start_date
- end_date
- location
- image_url
- featured (boolean)
- status (draft/published/archived)
- created_by, updated_by (user_id)
```

**Sermons** - Audio/Video sermons
```sql
- id (UUID)
- title
- description
- speaker
- category_id
- video_url
- audio_url
- sermon_date
- views (count)
- created_by, updated_by
```

**Donations** - Payment records
```sql
- id (UUID)
- donor_name
- donor_email
- amount (decimal)
- currency
- status (pending/completed/failed/refunded)
- transaction_id
- metadata (JSON)
- created_at
```

**Contact Messages** - Public contact form submissions
```sql
- id (UUID)
- name
- email
- subject
- message
- status (new/read/replied/archived)
- reply
- replied_by (user_id)
```

**Announcements** - Homepage announcements
```sql
- id (UUID)
- title
- content
- image_url
- featured
- active
- starts_at, ends_at
- created_by
```

**Galleries** - Photo galleries
```sql
- id (UUID)
- title
- image_url
- category_id
- featured
- order
```

**Settings** - Configurable site settings
```sql
- id (UUID)
- key (unique)
- value
- group (general/email/payment/appearance/security)
```

## API Routes

### Authentication
```
POST   /api/v1/auth/login          # Login (email, password)
GET    /api/v1/auth/me             # Get current user
POST   /api/v1/auth/logout         # Logout
PUT    /api/v1/auth/profile        # Update profile
```

### Public Events
```
GET    /api/v1/events              # List events (paginated)
GET    /api/v1/events?featured=1   # Featured events
GET    /api/v1/events/:id          # Event detail
POST   /api/v1/events/:id/rsvp     # RSVP to event
```

### Sermons
```
GET    /api/v1/sermons             # List sermons
GET    /api/v1/sermons/categories  # Get categories
GET    /api/v1/sermons/:id         # Sermon detail
GET    /api/v1/sermons/search?q=   # Search sermons
```

### Donations
```
POST   /api/v1/donations           # Create donation
POST   /api/v1/donations/payment-intent  # Stripe intent
GET    /api/v1/donations/stats     # Public stats
```

### Contact
```
POST   /api/v1/contact             # Submit contact form
```

### Admin (Protected)
```
POST   /api/v1/admin/events        # Create event
PUT    /api/v1/admin/events/:id    # Update event
DELETE /api/v1/admin/events/:id    # Delete event

POST   /api/v1/admin/sermons       # Create sermon
PUT    /api/v1/admin/sermons/:id   # Update sermon

GET    /api/v1/admin/donations     # List donations
GET    /api/v1/admin/donations/stats
POST   /api/v1/admin/donations/export

GET    /api/v1/admin/dashboard/analytics
GET    /api/v1/admin/dashboard/donations
GET    /api/v1/admin/dashboard/events
GET    /api/v1/admin/dashboard/sermons
```

##  Setup Instructions

### Prerequisites
- PHP 8.2+
- Node.js 18+
- PostgreSQL 13+
- Composer
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database setup**
   ```bash
   # Configure .env with PostgreSQL credentials
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=tscc_resurrection
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   
   # Run migrations
   php artisan migrate
   
   # Seed demo data
   php artisan db:seed
   ```

4. **Sanctum configuration**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

5. **Start Laravel server**
   ```bash
   php artisan serve
   ```

   Server runs at: `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd tscc
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env.local
   
   # Set API URL (update based on your setup)
   VITE_API_URL=http://localhost:8000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend runs at: `http://localhost:5173`

### Docker Setup (Optional)

```bash
docker-compose up -d

# Run migrations inside container
docker-compose exec laravel php artisan migrate
docker-compose exec laravel php artisan db:seed
```

##  Design System

### Color Palette
- **Primary**: #5a4a3a (Deep Brown)
- **Secondary**: #d4af37 (Gold)
- **Text**: #2c2416 (Dark text)
- **Background**: #faf9f7 (Off-white)
- **Surface**: #ffffff (White)

### CSS Architecture
- **variables.css** - CSS custom properties for theme management
- **animations.css** - Reusable animation keyframes
- **components.css** - Component-specific styles
- All using BEM-like naming convention with utility classes

### Theme Features
- Light/Dark mode toggle (CSS prefers-color-scheme)
- Automatic theme detection
- LocalStorage persistence

##  Security Features

- **CSRF Protection** - Built-in Laravel CSRF tokens
- **XSS Prevention** - React's built-in escaping + server validation
- **SQL Injection** - Eloquent ORM with parameterized queries
- **Rate Limiting** - Middleware for API throttling
- **CORS** - Properly configured for frontend domain
- **Password Hashing** - bcrypt with configurable rounds
- **Authorization** - Policy-based and middleware-based checks
- **Input Validation** - Form Request classes on backend
- **API Tokens** - Sanctum token-based authentication

##  Deployment

### Production Checklist
- [ ] Set `APP_DEBUG=false` in .env
- [ ] Set `APP_ENV=production`
- [ ] Generate app key: `php artisan key:generate`
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Clear caches: `php artisan config:cache`
-  [ ] Build frontend: `npm run build`
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up SSL/HTTPS
- [ ] Configure email/SMTP
- [ ] Set up Redis for queues/cache
- [ ] Configure Stripe keys
- [ ] Set up automated backups
- [ ] Configure monitoring and logging

### Environment Variables (Production)

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=production-db-host
CACHE_STORE=redis
QUEUE_CONNECTION=redis
STRIPE_SECRET=sk_live_xxx
STRIPE_PUBLIC=pk_live_xxx
MAIL_MAILER=smtp
MAIL_HOST=smtp.service.com
```

##  Testing

```bash
# Backend testing
php artisan test

# Frontend testing (when Jest/Vitest configured)
npm test
```

##  Available Commands

### Backend
```bash
php artisan migrate              # Run migrations
php artisan db:seed              # Seed database
php artisan tinker               # Interactive shell
php artisan serve                # Start development server
php artisan queue:work           # Process queues
php artisan horizon              # Queue monitoring
```

### Frontend
```bash
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                   # Preview production build
npm run lint                      # Run ESLint
```

##  Useful Resources

- [Laravel Docs](https://laravel.com/docs)
- [React Docs](https://react.dev)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Vite](https://vitejs.dev)
- [Stripe API](https://stripe.com/docs/api)

##  API Documentation

Full API documentation is available using Postman collection (to be created).

Import the collection to your Postman workspace for complete API testing.

##  Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

##  License

MIT License - feel free to use this for your projects.

##  Support & Troubleshooting

### Common Issues

**CORS Error**
```
Solution: Check CORS configuration in config/cors.php
Ensure frontend domain is added to allowed origins
```

**Database Connection Error**
```
Solution: Verify PostgreSQL is running
Check .env database credentials
Run: php artisan migrate
```

**Frontend Build Error**
```
Solution: Clear node_modules and reinstall
npm install --force
npm run build
```

**Authentication Not Working**
```
Solution: Verify Sanctum is installed and configured
Check SANCTUM_STATEFUL_DOMAINS in .env
Clear Laravel caches: php artisan cache:clear
```

## Next Steps

1. Customize homepage content and branding
2. Implement remaining admin features (full CRUD)
3. Add email notifications for donations
4. Set up Stripe webhook handlers
5. Implement advanced search and filtering
6. Add analytics dashboard
7. Create admin user management
8. Set up automated backups
9. Implement API versioning
10. Add comprehensive logging

---

**Version**: 1.0.0  
**Last Updated**: February 25, 2026  
**Maintained by**: Development Team

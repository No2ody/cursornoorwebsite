# Noor AlTayseer E-commerce Platform

A modern e-commerce platform for Noor AlTayseer, specializing in premium sanitary ware and lighting solutions in Dubai, UAE.

## 🚀 Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM with PostgreSQL
- **NextAuth.js** - Authentication system
- **Shadcn UI** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management for cart
- **Stripe** - Payment processing
- **Framer Motion** - Smooth animations

## 🏢 About Noor AlTayseer

Noor AlTayseer is a leading provider of premium sanitary ware and lighting solutions in Dubai, UAE, offering:

- **Lighting Solutions**: LED fixtures, industrial lighting, panels, switches & sockets
- **Bathroom & Sanitary Ware**: Bathtubs, cabinets (PVC, Plywood, Rock Stone), LED mirrors
- **Premium Quality**: Curated selection of high-end products
- **Expert Service**: Professional consultation and installation

## 🌟 Features

- **Product Catalog**: Browse 300+ premium products across multiple categories
- **Advanced Search & Filtering**: Find products by category, price range, and more
- **User Authentication**: Secure login/signup with NextAuth.js
- **Shopping Cart**: Persistent cart with real-time updates
- **Admin Dashboard**: Complete product and order management
- **Responsive Design**: Optimized for all devices
- **Payment Processing**: Secure checkout with Stripe (AED currency)
- **Real-time Updates**: Dynamic product data and inventory

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd noorwebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_ID=""
   GITHUB_SECRET=""
   
   # Stripe
   STRIPE_PUBLIC_KEY=""
   STRIPE_SECRET_KEY=""
   STRIPE_WEBHOOK_SECRET=""
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
noorwebsite/
├── app/                 # Next.js App Router
│   ├── (admin)/        # Admin dashboard
│   ├── (dashboard)/    # User dashboard  
│   ├── (home)/         # Customer-facing pages
│   └── api/            # API routes
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── ui/             # Shadcn UI components
│   └── shared/         # Reusable components
├── lib/                # Utility functions
├── prisma/             # Database schema and seeds
├── store/              # Zustand stores
└── public/images/      # Product images
```

## 👥 User Roles

- **Customer**: Browse products, manage cart, place orders
- **Admin**: Full dashboard access, product/order management
- **Super Admin**: All admin features plus user management

## 🎨 Design System

The platform uses Noor AlTayseer's brand colors and maintains consistency across all pages:

- **Primary**: Blue tones from the Noor AlTayseer logo
- **Typography**: Modern, clean fonts optimized for readability
- **Components**: Built with Shadcn UI for consistency and accessibility

## 📱 Responsive Design

Fully responsive design optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Progressive web app capabilities

## 🔒 Security

- **Authentication**: NextAuth.js with multiple providers
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted passwords with bcryptjs
- **Payment Security**: PCI-compliant Stripe integration

## 📈 Performance

- **Next.js 15**: Latest performance optimizations
- **Image Optimization**: Automatic WebP conversion and sizing
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Optimized database queries and API responses

## 🚀 Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
```

## 📞 Contact

For questions or support:
- **Email**: info@nooraltayseer.com
- **Instagram**: [@nooraltayseer](https://www.instagram.com/nooraltayseer)
- **Facebook**: [Noor AlTayseer](https://www.facebook.com/profile.php?id=61577970159224)

---

© 2024 Noor AlTayseer. Premium Lighting & Bathroom Solutions in Dubai, UAE.
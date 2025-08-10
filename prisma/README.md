# Prisma Database Seeding

## 📁 Files Overview

### Essential Files:
- **`schema.prisma`** - Database schema definition
- **`seed.ts`** - Main seeding script (currently basic - only creates categories + 42 Plywood products)
- **`seed-users.ts`** - User seeding script for testing accounts

## 🚀 Seeding Commands

### Complete Database Setup:
```bash
# 1. Reset and apply schema
npx prisma db push

# 2. Seed categories and basic products
npx prisma db seed

# 3. Seed test users
npm run db:seed-users
```

### Alternative Commands:
```bash
# Using npm scripts
npm run db:seed          # Basic seeding (categories + 42 products)
npm run db:seed-users    # User seeding
```

## 👥 Test User Accounts

### Admin Users:
- **Email:** `admin@nooraltayseer.com` | **Password:** `admin123`
- **Email:** `manager@nooraltayseer.com` | **Password:** `password123`

### Customer Users:
- **Email:** `user@nooraltayseer.com` | **Password:** `user123`
- **Email:** `sarah.ahmed@example.com` | **Password:** `password123`
- **Email:** `mohammad.ali@example.com` | **Password:** `password123`
- **Email:** `fatima.hassan@example.com` | **Password:** `password123`

## 📝 Notes

⚠️ **Current Status:** The main `seed.ts` file only creates categories and 42 Plywood Cabinet products. The database already contains the complete 383 products from previous seeding runs.

For a complete fresh start with all 382 items, you would need to expand the `seed.ts` file to include all product categories, or manually run the database restoration from the current state.

## 🔒 Security Features

- All passwords are hashed with bcryptjs (12 salt rounds)
- Role-based access control (ADMIN/USER)
- Email verification pre-enabled for testing
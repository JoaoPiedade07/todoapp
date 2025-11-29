# Migration Guide: SQLite to PostgreSQL/MySQL

## Overview
This guide will help you migrate from SQLite to PostgreSQL (or MySQL) for production hosting.

## Step 1: Choose Your Database

### Option A: PostgreSQL (Recommended)
- Better for production
- Excellent Next.js support
- Free hosting available (Supabase, Neon, Railway)

### Option B: MySQL
- Widely supported
- Free hosting available (PlanetScale, Railway, AWS RDS)

## Step 2: Install Database Driver

### For PostgreSQL:
```bash
npm install pg
npm install --save-dev @types/pg
```

### For MySQL:
```bash
npm install mysql2
npm install --save-dev @types/mysql2
```

## Step 3: Update database.ts

The database connection and queries need to be updated. See the migration files for details.

## Step 4: Environment Variables

Create a `.env` file:
```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database

# OR MySQL
DATABASE_URL=mysql://user:password@host:3306/database
```

## Step 5: Export Your SQLite Data

Before migrating, export your data:
```bash
sqlite3 database.sqlite3 .dump > backup.sql
```

## Step 6: Hosting Options

### Free PostgreSQL Hosting:
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Free tier available)

### Free MySQL Hosting:
- **PlanetScale**: https://planetscale.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)

## Step 7: Deploy Your Application

### Vercel (Next.js):
1. Connect your GitHub repo
2. Add DATABASE_URL environment variable
3. Deploy

### Railway:
1. Connect your GitHub repo
2. Add PostgreSQL/MySQL service
3. Connect to your app
4. Deploy

## Migration Checklist

- [ ] Choose database (PostgreSQL or MySQL)
- [ ] Install database driver
- [ ] Update database.ts file
- [ ] Create .env file with DATABASE_URL
- [ ] Export SQLite data
- [ ] Create production database
- [ ] Import schema to production database
- [ ] Test locally with production database
- [ ] Deploy application
- [ ] Verify data integrity


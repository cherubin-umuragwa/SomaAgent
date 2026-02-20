# Soma-Agent Uganda 🇺🇬

AI-powered educational platform for Ugandan O-Level students.

## Tech Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth)
- Google Gemini AI
- Tailwind CSS
- TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your keys:
- Supabase URL and anon key
- Gemini API key

3. Set up database:
- Run `supabase_logic.sql` in Supabase SQL Editor

4. Start development:
```bash
npm run dev
```

## Features

- Multi-role system (Student, Teacher, Parent, Academic, Admin)
- AI tutor powered by Gemini
- Resource management
- Exam scheduling
- Progress tracking
- Real-time feedback

## Deployment

Deploy to Vercel:
```bash
vercel
```

Add environment variables in Vercel dashboard.

---

**School**: Gayaza High School  
**Motto**: "Never Give Up" 🎓

# WordWise - AI-Powered Writing Assistant

WordWise is an intelligent writing assistant designed specifically for content creators, lifestyle bloggers, and storytellers. Built with Next.js and powered by OpenAI, it provides real-time writing suggestions, creative inspiration, and engagement optimization tools to help you craft compelling content.

## ✨ Features

### 🔍 **Smart Writing Analysis**
- **Grammar & Style Suggestions**: Real-time detection of grammar errors, style improvements, and writing clarity issues
- **Spelling & Accuracy Checks**: Automatic correction of typos and factual inaccuracies
- **AI-Powered Recommendations**: Context-aware suggestions using GPT-4o-mini

### 🎨 **Creative Writing Tools**
- **Inspiration Generator**: Get three unique content angles for any topic:
  - Personal anecdotes and stories
  - Informative tips and insights
  - Vivid sensory descriptions
- **Persona Rewriting**: Transform your text with different voices:
  - Humorous tone
  - Vivid and descriptive style
  - Concise and to-the-point writing

### 📱 **Engagement Optimization**
- **Social Media Suggestions**: Generate engaging content for your posts:
  - Thought-provoking questions
  - Effective calls-to-action
  - Interactive prompts and polls
- **Smart Promotional Content**: Transform pushy marketing copy into authentic recommendations using proven strategies

### 📝 **Advanced Editor**
- **Lexical-Based Rich Editor**: Powerful text editing with real-time suggestion highlighting
- **Document Management**: Save, organize, and access your documents with cloud sync
- **Version History**: Track changes and revert to previous versions
- **Word Count Tracking**: Monitor your writing progress

## 🚀 Getting Started

### Prerequisites

Before setting up WordWise, you'll need:

1. **Supabase Account** (free tier available)
   - Database hosting and authentication
   - Real-time document synchronization

2. **OpenAI API Key** (pay-per-use)
   - Powers all AI writing assistance features
   - Uses GPT-4o-mini for cost-effective operations

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd writing_assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database:**
   
   Run the provided SQL scripts in your Supabase SQL editor:
   ```bash
   # Execute these files in order:
   scripts/001-create-tables.sql
   scripts/002-add-suggestion-cache.sql
   scripts/003-add-document-versions.sql
   scripts/004-migrate-to-plain-text.sql
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Editor**: Lexical (Meta's extensible text editor framework)
- **Database**: Supabase (PostgreSQL with real-time features)
- **AI**: OpenAI GPT-4o-mini via Vercel AI SDK
- **Authentication**: Supabase Auth with Row Level Security

## 📁 Project Structure

```
writing_assistant/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes for AI features
│   │   ├── analyze-text/    # Grammar and style analysis
│   │   ├── inspire/         # Content inspiration generation
│   │   ├── engage/          # Engagement suggestions
│   │   ├── persona/         # Text rewriting with personas
│   │   └── promo/           # Smart promotional content
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   └── editor/              # Document editor interface
├── components/              # Reusable React components
│   ├── editor/              # Editor-specific components
│   ├── ui/                  # Shadcn UI components
│   └── auth/                # Authentication forms
├── lib/                     # Utility libraries
│   ├── supabase/           # Database client configuration
│   └── cache/              # Suggestion caching system
└── scripts/                # Database migration scripts
```

## 🎯 Usage Guide

### Creating Your First Document

1. **Sign up/Login**: Create an account or sign in through the authentication page
2. **Access Dashboard**: View all your documents and create new ones
3. **Start Writing**: Open the editor and begin crafting your content
4. **Get AI Assistance**: Use the floating toolbar to access AI features:
   - Select text and click "Rewrite" for persona-based transformations
   - Use "Add Suggestions" for grammar and style improvements
   - Try "Engage" for social media optimization
   - Click "Smart Promo" for authentic promotional content

### AI Features in Detail

#### Writing Analysis
The AI continuously analyzes your text for:
- **Grammar errors**: Subject-verb agreement, tense consistency
- **Style improvements**: Wordiness, passive voice, clarity
- **Spelling mistakes**: Typos and misspellings
- **Factual accuracy**: Names, places, and common knowledge

#### Content Inspiration
When you need creative ideas:
1. Highlight a topic or sentence
2. Click the inspiration button
3. Get three different angles:
   - A personal story approach
   - An informative/tips angle
   - A sensory/descriptive perspective

#### Engagement Optimization
Transform your content for social media:
- **Questions**: Generate thought-provoking questions
- **CTAs**: Create compelling calls-to-action
- **Interactive content**: Design polls and engagement prompts

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key
3. Run the migration scripts in the SQL editor
4. Enable Row Level Security (automatically configured)

### OpenAI Configuration

1. Create an OpenAI account
2. Generate an API key
3. Add sufficient credits for usage
4. The app uses GPT-4o-mini for cost efficiency

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in the Vercel dashboard
3. **Deploy**: The app will automatically build and deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
OPENAI_API_KEY=your_openai_api_key
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and structure
4. Keep files under 500 lines for AI compatibility
5. Add proper JSDoc comments to functions
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the configuration guide in the app at `/auth`
2. Verify your environment variables
3. Ensure Supabase and OpenAI services are properly configured
4. Review the browser console for error messages

---

**WordWise** - Connect, Engage, Influence through better writing.

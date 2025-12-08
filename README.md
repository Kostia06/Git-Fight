# 🎮 Git Fight

**An 80s Retro-Styled GitHub Developer Battle Game**

I challenged myself to build a fully-featured web app using **nothing but vanilla JavaScript, CSS, and HTML** - no frameworks, no libraries (except for the backend API). This project showcases what's possible with plain web technologies and a lot of retro vibes!

## ✨ What's Inside

- **⚔️ Battle System**: Compare two GitHub developers across 7 different metrics
- **🏆 Global Leaderboard**: Rankings powered by Vercel Postgres
- **🎖️ Achievements**: Unlock achievements as you play
- **🎨 Retro Aesthetic**: Full 80s synthwave design with CRT effects, particles, and animations
- **⌨️ Keyboard Controls**: Navigate everything with shortcuts
- **📱 Fully Responsive**: Works great on mobile and desktop
- **🔊 Sound Effects**: Optional retro audio

## 🚀 Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd git-fight

# Install dependencies
npm install

# Run locally with Vercel
vercel dev
```

Then visit http://localhost:3000/api/setup once to initialize the database.

**Note:** You'll need a Vercel account with a Postgres database to use the leaderboard features.

## 🎮 How to Play

1. Enter two GitHub usernames
2. Press `Enter` or click "FIGHT!"
3. Watch the battle unfold
4. Check the global leaderboard (`L` key) to see rankings

**Keyboard Shortcuts:** `Enter` (fight), `L` (leaderboard), `H` (hall of fame), `A` (achievements), `R` (random), `ESC` (back)

## 🛠️ Tech Stack

**The Challenge:** Build everything in vanilla JavaScript/CSS/HTML - no frameworks!

- **Frontend**: Pure JavaScript (ES6 modules) - no React, no Vue, no frameworks
- **Styling**: 4500+ lines of hand-written CSS with animations
- **Backend**: Vercel Serverless Functions + Postgres
- **Data**: GitHub REST API

**Why vanilla?** To prove you don't always need a framework to build something awesome!

## 📁 Key Files

```
├── app.js         # Main game logic (1700+ lines of vanilla JS)
├── styles.css     # All styling (4500+ lines of CSS)
├── index.html     # HTML structure
├── api/           # Backend API routes (Vercel serverless)
└── js/database.js # Database integration
```

## 🚢 Deploy Your Own

1. Fork this repo
2. Deploy to Vercel (click the deploy button)
3. Add a Postgres database in Vercel
4. Visit `/api/setup` to initialize tables
5. Done!

## 💭 Why I Built This

I wanted to challenge myself to see if I could build a modern, feature-rich web app without relying on any frameworks. No React. No Vue. No Svelte. Just the raw power of vanilla JavaScript, CSS, and HTML.

The result? Over 1700 lines of JavaScript, 4500+ lines of CSS, animations, sound effects, a global leaderboard, achievements, and a full retro arcade aesthetic - all without a single npm framework dependency.

**The lesson?** You don't need frameworks for everything. Sometimes going vanilla lets you truly understand how the web works.

## 📝 License

MIT - Do whatever you want with this!

---

<div align="center">

**Built with ☕ and synthwave vibes**

*No frameworks were harmed in the making of this project* 😎

</div>

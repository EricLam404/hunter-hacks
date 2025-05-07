# WYD (What You Doin'?)

A playful but powerful Chrome extension that helps students stay focused and learn in real-time by transforming distractions into learning opportunities.

---

## Inspiration

As students, we often found ourselves getting sidetracked while studying online—one tab for research turns into ten tabs of distractions. We wanted to create a tool that not only keeps users accountable but also helps reinforce learning in real time. That's how **WYD** ("What You Doin'?") was born.

---

## What It Does

WYD monitors your browsing activity and detects when you're off-topic. When a distraction is detected, it prompts you with a quick AI-generated quiz related to your chosen study topic. If you continue to stray, it redirects you back to your work. WYD transforms passive screen time into active learning time.

---

## How We Built It

We built WYD as a Chrome extension using:

- **Manifest V3** for the extension structure
- **React** for the popup UI
- **JavaScript** for content and background scripts
- **OpenAI API** to generate topic-based quizzes and classification to detect topic drift

The extension runs lightweight analysis in the background, cross-checking page content with the user's selected topic.

---

## Challenges We Ran Into

- Detecting distractions without over-blocking — balancing false positives and actual off-task behavior.
- Integrating AI quiz generation in real-time with minimal latency.
- Managing **Chrome extension permissions** and **storage** limitations.
- Keeping the UI simple to avoid becoming another distraction.

---

## Accomplishments That We're Proud Of

- Created a fully functional Chrome extension from scratch in a short time.
- Successfully integrated AI-powered quiz generation to reinforce learning.
- Designed a seamless user experience that encourages focus without being annoying.
- Developed a topic detection system that works across a variety of subjects.

---

## What We Learned

- How Chrome extensions work under the hood, including background/content scripts and permissions.
- Integrating AI models like GPT for real-time content generation.
- Building clean and responsive UIs with React for browser extensions.
- Balancing user experience with behavioral nudging.

---

## What's Next for WYD?

- Deployment to the Chrome Web Store, handling packaging, permissions configuration, and setting up a publishing pipeline.
- Add customizable study goals and progress tracking.
- Train a lightweight local model for faster distraction detection.
- Support for group study mode with shared quizzes.
- A leaderboard to gamify productivity and studying.

---

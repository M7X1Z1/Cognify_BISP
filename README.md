# Cognify

A study assistant that turns notes into summaries, quizzes, and flashcards using AI.

Deployed app URL: https://frontend-production-6a6e.up.railway.app/login

## What it does

You paste in study material (or upload a PDF, DOCX, PPTX, or TXT file up to 20 MB) and pick what you want done with it:

- A bullet-point summary that captures the main ideas
- A five-question multiple-choice quiz you can actually take
- A set of flashcards you can flip through

Each mode has an easy/medium/hard setting that adjusts how the AI writes the output, and there's a custom instructions field if you want to steer things in a particular direction (e.g. "focus on dates and key events" or "max 5 bullet points").

Everything you generate is saved to your account history, and you can download any output as a Word document for offline review.

## Tech

Frontend is React 18 with Vite, React Router, and Axios. Backend is Node and Express, talking to MongoDB Atlas through Mongoose. Auth uses JWT with bcrypt. The AI side is Google's Gemini API (gemini-2.5-flash-lite), which fits comfortably inside the free tier for personal use.

File parsing on the backend goes through pdf-parse for PDFs, mammoth for Word docs, and officeparser for PowerPoint. Helmet, CORS, and a rate limiter (20 generations per 15 minutes per user) handle the basics on the security side.

EventOps – Football Event Operations Platform

EventOps is a web-based operations platform built in collaboration with real football event organizers.
It is designed to replace Messenger-based coordination and introduce structured incident reporting during live football events.

The system is currently in active development and scheduled for use at upcoming events.

The Problem

Football event operations commonly rely on:

Messenger groups for coordinating staff, judges, and crew

Ad-hoc messages or verbal communication for reporting incidents

This results in:

Fragmented communication

Unclear responsibilities

Lost or undocumented incidents

No structured overview during or after events

The Solution

EventOps addresses two concrete operational problems:

1. Replace Messenger-Based Coordination

Role-based user access for staff, judges, and crew

Centralized event communication and control

Admin-managed roles and permissions

2. Centralized Incident Reporting

Structured incident logging during live events

Timestamps, severity levels, and notes

Persistent incident history for post-event review

Key Features

Role-based authentication and access control

Admin dashboard for managing users and events

Live incident reporting during events

Firebase-backed data model structured for production use

Clean, responsive UI focused on fast on-site usage

Tech Stack

Frontend: Next.js, React, TypeScript

Styling: Tailwind CSS

Backend: Firebase (Authentication, Firestore)

Deployment: Vercel

Project Status

🚧 Actively in development

Core workflows are implemented.
Features are prioritized based on feedback from event organizers ahead of live deployment.

This is not a demo or tutorial project, but a real operational system being prepared for use at football events.

Demo

Vercel demo: https://event-ops-mu.vercel.app/users

Screenshots
<img width="1536" height="2048" alt="image" src="https://github.com/user-attachments/assets/a3fd5d0c-3691-4e31-b4ed-7af526c5c858" />
<img width="1536" height="2048" alt="image" src="https://github.com/user-attachments/assets/30660429-5f9c-4e15-b30f-3858b704625d" />


Development
npm install
npm run dev


Runs the app locally at http://localhost:3000

Why This Project Exists

EventOps was built to solve real organizational problems observed during football events — not as a technology showcase, but as a practical tool designed for use under real-world conditions.

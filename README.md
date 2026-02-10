<h1>⚽ EventOps – Football Event Operations Platform</h1>

<p>
<strong>EventOps</strong> is a web-based operations platform built
<strong>in collaboration with real football event organizers</strong>.
It replaces Messenger-based coordination and introduces
<strong>structured incident reporting</strong> during live football events.
</p>

<p>
🚧 Core workflows implemented and being finalized for live deployment.
</p>

<h2>👤 Project Ownership</h2>

<p>This project was designed and implemented end-to-end, including domain modeling, role-based access control, Firestore security rules, and deployment.  
Operational workflows were defined together with the product owner before development.</p>

<hr />

<h2>❌ The Problem</h2>

<p>Football event operations commonly rely on:</p>

<ul>
  <li>Messenger groups for coordinating staff, judges, and crew</li>
  <li>Ad-hoc messages or verbal communication for reporting incidents</li>
</ul>

<p>This leads to:</p>

<ul>
  <li>Fragmented communication</li>
  <li>Unclear responsibilities</li>
  <li>Lost or undocumented incidents</li>
  <li>No structured overview during or after events</li>
</ul>

<hr />

<h2>✅ The Solution</h2>

<p>
EventOps addresses <strong>two concrete operational problems</strong>:
</p>

<h3>1️⃣ Replace Messenger-Based Coordination</h3>

<ul>
  <li>Role-based user access for staff, judges, and crew</li>
  <li>Centralized event communication and control</li>
  <li>Admin-managed roles and permissions</li>
</ul>

<h3>2️⃣ Centralized Incident Reporting</h3>

<ul>
  <li>Structured incident logging during live events</li>
  <li>Timestamps, severity levels, and notes</li>
  <li>Persistent incident history for post-event review</li>
</ul>

<hr />

<h2>✨ Key Features</h2>

<ul>
  <li>Role-based authentication and access control</li>
  <li>Admin dashboard for managing users and events</li>
  <li>Live incident reporting during events</li>
  <li>Firebase-backed data model with security rules enforcing role-based permissions and write access</li>
  <li>Clean, responsive UI focused on fast on-site usage</li>
</ul>

<hr />

<h2>🧰 Tech Stack</h2>

<ul>
  <li><strong>Frontend:</strong> Next.js, React, TypeScript</li>
  <li><strong>Styling:</strong> Tailwind CSS</li>
  <li><strong>Backend:</strong> Firebase (Authentication, Firestore, storage, Rules)</li>
  <li><strong>Deployment:</strong> Vercel</li>
</ul>

<hr />

<h2>📦 Project Status</h2>

<p>
🚧 <strong>Stabilization phase</strong>
</p>


<p>
Core workflows are implemented. Features are prioritized based on feedback
from event organizers ahead of live deployment.
</p>

<p>
<strong>This is not a demo or tutorial project</strong>, but a real operational
system being prepared for use at football events.
</p>

<hr />

<h2>🌍 Demo</h2>

<p>
<a href="https://event-ops-mu.vercel.app/users" target="_blank">
👉 Vercel demo
</a>
</p>

<hr />

<h2>🧠 Product Design & Early Planning</h2>

<p>
Early domain model and feature planning created together with the product owner
to define roles, responsibilities, and incident workflows before implementation.
</p>

<h4>Domain Model (Early Planning)</h4>
<p>
Defines user roles, permissions, and core entities discussed with the product owner.
</p>

<img
  src="https://github.com/user-attachments/assets/a3fd5d0c-3691-4e31-b4ed-7af526c5c858"
  alt="Early domain model"
  width="500"
/>

<h4>Feature Breakdown & Priorities</h4>
<p>
Bullet-point planning used to align scope and event-day requirements before development.
</p>

<img
  src="https://github.com/user-attachments/assets/30660429-5f9c-4e15-b30f-3858b704625d"
  alt="Feature breakdown"
  width="500"
/>

<hr />

<h2>💻 Development</h2>

<pre>
npm install
npm run dev
</pre>

<p>
Runs locally at <code>http://localhost:3000</code>
</p>

<hr />

<h2>🎯 Why This Project Exists</h2>

<p>
EventOps was built to solve real organizational problems observed during football
events — not as a technology showcase, but as a practical tool designed for use
under real-world conditions.
</p>
<p>The project emphasizes real-world constraints such as access control, operational ownership, and clean handover after deployment.
</p>

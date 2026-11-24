# CareerTrack – Job Application Tracker

CareerTrack is a full-stack, SaaS-inspired **Job Application Tracking System** engineered to help developers and job seekers organize, monitor, and visualize their job search pipeline. Built with **Angular 17**, **Node.js/Express**, and **MongoDB / Mongoose**, it provides full CRUD capabilities, interactive Chart.js analytics, dynamic Kanban and Table views, interview schedule countdowns, and reactive form validation.

This project is specifically structured to be clean, modular, and beginner-friendly, while serving as an interview preparation reference for modern Angular architecture.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture & System Flow](#architecture--system-flow)
5. [Folder Structure](#folder-structure)
6. [Installation & Setup](#installation--setup)
7. [Environment Variables](#environment-variables)
8. [MongoDB Configuration & Dual-Mode Fallback](#mongodb-configuration--dual-mode-fallback)
9. [Running the Application](#running-the-application)
10. [RESTful API Documentation](#restful-api-documentation)
11. [Angular Concepts Demonstrated](#angular-concepts-demonstrated)
12. [Complete End-to-End Data Flow](#complete-end-to-end-data-flow)
13. [20 Project-Based Angular Interview Questions & Answers](#20-project-based-angular-interview-questions--answers)

---

## Project Overview

When transitioning from React/MERN to Angular, developers often look for an intuitive demonstration of Angular's core mechanics: Standalone Components, Dependency Injection, RxJS Observables, Reactive Forms, and the modern `@if` / `@for` template control flow.

CareerTrack bridges this gap by delivering a practical, production-ready full-stack application that manages job applications through their complete lifecycle:
**Applied $\rightarrow$ Interview Scheduled $\rightarrow$ Offer Received / Rejected**.

---

## Key Features

- **Executive Analytics Dashboard:**
  - Real-time stat cards: Total Applications, Applications Pending, Interviews Scheduled, Offers Received, and Rejected.
  - Interactive **Chart.js Donut Chart** visualizing application status breakdown.
  - Interactive **Chart.js Bar Chart** tracking monthly application volume.
  - Quick summary tables of recent job applications and upcoming interviews.

- **Dual-View Application Management:**
  - **Table View:** Clean, sortable tabular display with badges, direct status dropdown switcher, external job posting links, and edit/delete actions.
  - **Kanban Board View:** Four status columns (`Applied`, `Interview Scheduled`, `Offer Received`, `Rejected`). Users can update status directly from card dropdowns with instant optimistic UI updates.

- **Reactive Form Validation:**
  - Unified, reusable form for both **Add Application** and **Edit Application**.
  - Dynamic validation rules (minimum characters, required applied date, URL pattern matching for job links).
  - Inline error feedback messages triggered by user interaction.

- **Chronological Interview Schedule:**
  - Automatic countdown badges (`Today!`, `Tomorrow`, `In X days`).
  - Chronological sorting of upcoming interviews.
  - Dedicated past interviews review section.
  - Notes for technical interview preparation, recruiter names, and talking points.

- **User Experience (UX) Enhancements:**
  - Responsive collapsible sidebar navigation (desktop collapse + mobile drawer).
  - Floating toast notification system (success, error, warning, info) with auto-dismiss.
  - Delete confirmation modal preventing accidental data loss.
  - Meaningful empty states with actionable shortcuts.

---

## Technology Stack

### Frontend
- **Framework:** Angular 17 (Standalone Components architecture)
- **Language:** TypeScript 5.4+
- **Styling:** Tailwind CSS 3.4
- **Charts:** Chart.js 4.4 (integrated via native HTML5 Canvas & `@ViewChild`)
- **Routing:** Angular Router (Lazy-loaded standalone routes via `loadComponent`)
- **Forms:** Angular Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`)
- **HTTP Client:** Angular `HttpClient` + RxJS Observables
- **Icons:** Custom SVG component based on Lucide Icon specifications

### Backend
- **Runtime:** Node.js (v18+ / v20+ / v22+)
- **Framework:** Express.js 4.19
- **Database & ODM:** MongoDB & Mongoose 8.3
- **Configuration:** `dotenv`
- **Cross-Origin Sharing:** `cors`

---

## Architecture & System Flow

```
+-------------------------------------------------------------------------------+
|                             CareerTrack Client                                |
|                                (Angular 17)                                   |
|                                                                               |
|  [ Dashboard ]      [ All Applications ]    [ Add/Edit Form ]   [ Interviews ]|
|  - Stat Cards       - Table View            - Reactive Forms    - Countdown   |
|  - Chart.js Donut   - Kanban Board View     - Custom Validators - Action Links|
|  - Chart.js Bar     - Status Dropdown       - Shared Component                |
+---------------------------------------+---------------------------------------+
                                        |
                         RxJS Observables / HTTP Client
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                             CareerTrack Server                                |
|                           (Express.js REST API)                               |
|                                                                               |
|  [ Routes ]           [ Controllers ]              [ Middleware ]             |
|  - /api/jobs          - getJobs (search/filter)    - CORS & JSON Body Parser  |
|  - /api/jobs/:id      - createJob / updateJob      - Centralized Error Handler|
|  - /api/jobs/stats    - deleteJob / getStats       - 404 Route Catch-All      |
+---------------------------------------+---------------------------------------+
                                        |
                               Mongoose ODM Driver
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                              Persistent Layer                                 |
|                                                                               |
|   Primary: MongoDB Server (mongodb://localhost:27017/careertrack or Atlas)    |
|   Fallback: File-backed JSON Store (backend/data/jobs.json)                   |
+-------------------------------------------------------------------------------+
```

---

## Folder Structure

```text
Job tracking/
├── backend/
│   ├── config/
│   │   └── db.js                       # Mongoose connection & fallback logic
│   ├── controllers/
│   │   └── job.controller.js           # CRUD, search, filter, and stats logic
│   ├── data/
│   │   └── jobs.json                   # Local persistent store (auto-generated)
│   ├── middleware/
│   │   └── error.middleware.js         # Centralized error handler
│   ├── models/
│   │   └── job.model.js                # Job model schema & dual-mode proxy
│   ├── routes/
│   │   └── job.routes.js               # Express route definitions
│   ├── .env                            # Backend environment configuration
│   ├── .env.example                    # Example environment file
│   ├── package.json                    # Backend dependencies & scripts
│   ├── run-and-test.js                 # Server spawn & automated testing runner
│   ├── seed.js                         # Database seeder (10 realistic jobs)
│   ├── server.js                       # Main Express application entry point
│   └── test-api.js                     # REST API automated integration tests
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── confirmation-modal/ # Delete confirmation modal
│   │   │   │   ├── icon/               # Standalone Lucide-compatible SVG icon
│   │   │   │   ├── job-card/           # Kanban job card with status dropdown
│   │   │   │   ├── job-form/           # Shared Reactive Form component
│   │   │   │   ├── navbar/             # Top navigation bar & mobile toggle
│   │   │   │   ├── sidebar/            # Collapsible sidebar navigation
│   │   │   │   ├── stat-card/          # Metric card for dashboard statistics
│   │   │   │   └── status-badge/       # Status pill with color-coded dot
│   │   │   ├── models/
│   │   │   │   └── job.model.ts        # TypeScript interfaces & union types
│   │   │   ├── pages/
│   │   │   │   ├── add-job/            # Create job application page
│   │   │   │   ├── dashboard/          # Dashboard analytics & charts page
│   │   │   │   ├── edit-job/           # Edit job application page
│   │   │   │   ├── interviews/         # Chronological interview schedule page
│   │   │   │   └── job-list/           # Table & Kanban view page
│   │   │   ├── services/
│   │   │   │   ├── job.service.ts      # HttpClient CRUD & refresh triggers
│   │   │   │   └── notification.service.ts # Reactive toast notifications
│   │   │   ├── app.component.ts        # Shell layout & toast container
│   │   │   ├── app.config.ts           # Standalone Angular application config
│   │   │   └── app.routes.ts           # Route definitions with lazy loading
│   │   ├── environments/
│   │   │   ├── environment.development.ts
│   │   │   └── environment.ts          # API endpoint URL configuration
│   │   ├── index.html                  # HTML entry point
│   │   ├── main.ts                     # Angular bootstrap entry point
│   │   └── styles.css                  # Tailwind directives & global styling
│   ├── angular.json                    # Angular CLI build configuration
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── tsconfig.app.json               # TypeScript app config
│   └── tsconfig.json                   # TypeScript base compiler config
├── package.json                        # Root workspace scripts
└── README.md                           # Documentation & Interview Guide
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB** (Optional, recommended): Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas connection URI. If MongoDB is not installed, the application automatically uses the built-in file-backed store without breaking!

### Step 1: Install Dependencies

From the workspace root directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

## Environment Variables

The backend configuration lives in `backend/.env`. A template is provided in `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careertrack
USE_IN_MEMORY_DB_IF_LOCAL_FAILS=true
```

- `PORT`: Port on which the Express server listens (default: `5000`).
- `MONGODB_URI`: Connection string for MongoDB (local or Atlas URI).
- `USE_IN_MEMORY_DB_IF_LOCAL_FAILS`: When set to `true`, if the server cannot reach MongoDB at boot time, it automatically falls back to `backend/data/jobs.json`.

Frontend environment variables live in `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

---

## MongoDB Configuration & Dual-Mode Fallback

CareerTrack features a **dual-mode persistence architecture**:
1. **Mongoose Mode (Production & Local Mongo):** When MongoDB is running, Mongoose establishes a native connection and uses full schema validations, indexes, and virtual fields.
2. **Persistent Store Fallback Mode:** If MongoDB is offline, the backend transparently routes all CRUD operations to `backend/data/jobs.json`. This ensures that anyone evaluating or running the project has a 100% working application immediately with persistent data!

### Seed Initial Sample Data

A seed script with 10 realistic job applications across Google, Microsoft, AWS, Stripe, Netflix, Atlassian, Bloomberg, Spotify, Airbnb, and Datadog is included:

```bash
# Seed 10 realistic sample jobs
npm run seed
# or
node backend/seed.js
```

---

## Running the Application

### 1. Start the Backend API Server

```bash
# Option A: From root
npm run backend:start

# Option B: From backend directory
cd backend
npm start
# (or npm run dev for nodemon live-reloading)
```
The backend starts at: `http://localhost:5000`

### 2. Start the Angular Frontend

```bash
# In a separate terminal tab:
cd frontend
npm start
```
The frontend dev server launches at: `http://localhost:4200`

### 3. Run Automated Tests

To run the end-to-end API test suite:

```bash
npm test
# or
node backend/run-and-test.js
```

To run the Angular frontend unit tests:

```bash
cd frontend
npm test
```

---

## RESTful API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Query Parameters / Payload |
|---|---|---|---|
| `GET` | `/health` | Server health check | None |
| `GET` | `/jobs` | Retrieve all job applications | `search`, `status`, `sortBy`, `order` |
| `GET` | `/jobs/:id` | Retrieve single job by ID | `id` route parameter |
| `GET` | `/jobs/stats/summary`| Aggregated dashboard metrics | None |
| `POST` | `/jobs` | Create new job application | JSON body (see schema below) |
| `PUT` | `/jobs/:id` | Update existing job | JSON body with updated fields |
| `DELETE` | `/jobs/:id` | Delete job application | `id` route parameter |

### Example Request Body (POST / PUT)

```json
{
  "company": "Google",
  "role": "Frontend Engineer (Angular)",
  "location": "Mountain View, CA",
  "employmentType": "Full-time",
  "workMode": "Hybrid",
  "jobLink": "https://careers.google.com/jobs/123",
  "appliedDate": "2026-03-01T00:00:00.000Z",
  "status": "Interview Scheduled",
  "expectedSalary": 165000,
  "interviewDate": "2026-03-25T14:00:00.000Z",
  "notes": "System design screen on reactive streams and Angular rendering"
}
```

---

## Angular Concepts Demonstrated

This project is crafted specifically to prepare you for Angular technical interviews. The codebase highlights:

1. **Standalone Components (`standalone: true`):**
   Angular 17 standard replacing legacy `NgModule` declarations. Every component explicitly imports only what it needs (`CommonModule`, `ReactiveFormsModule`, child components).
2. **Dependency Injection via `inject()`:**
   Modern functional injection (`private jobService = inject(JobService);`) rather than verbose constructor injection.
3. **Reactive Forms & Custom Validation:**
   `FormBuilder`, `FormGroup`, `FormControl`, and built-in validators (`Validators.required`, `Validators.minLength`, `Validators.pattern`).
4. **Angular Template Control Flow (`@if`, `@for`, `@empty`):**
   Clean modern control flow syntax introduced in Angular 17 that replaces `*ngIf` and `*ngFor` with improved type-checking performance.
5. **Component Communication (`@Input()` & `@Output()`):**
   Passing properties down and emitting `EventEmitter` events up (e.g. `ConfirmationModalComponent`, `JobFormComponent`, and `JobCardComponent`).
6. **Angular Built-in Pipes:**
   `DatePipe` (`job.appliedDate | date:'mediumDate'`) and `CurrencyPipe` (`job.expectedSalary | currency:'USD':'symbol':'1.0-0'`).
7. **Two-Way Data Binding (`[(ngModel)]`):**
   Used for search input and filter dropdowns in `JobListComponent`.
8. **RxJS Observables & Subjects:**
   `BehaviorSubject` in `NotificationService` and `JobService.refreshTrigger$` to achieve reactive, decoupled state sync across views.
9. **Component Lifecycle Hooks:**
   `ngOnInit` for initial data fetching, `ngAfterViewInit` for Chart.js canvas rendering, `ngOnChanges` for form patching, and `ngOnDestroy` for subscription cleanup.
10. **Router & Route Parameters:**
    `ActivatedRoute.snapshot.paramMap.get('id')` in `EditJobComponent`, plus `withComponentInputBinding()` and `loadComponent` lazy loading in `app.routes.ts`.

---

## Complete End-to-End Data Flow

Let's trace what happens when a user submits a new job application:

1. **User Interaction:**
   The user navigates to `/applications/add` and fills out the `JobFormComponent`.
2. **Reactive Form Validation:**
   Angular's Reactive Form checks dirty/touched status and field validity in real time. If invalid, field-level error messages display.
3. **Form Submission:**
   When valid, the user clicks "Save Application". `JobFormComponent` emits the `formSubmit` event with clean payload data to `AddJobComponent`.
4. **Service Call:**
   `AddJobComponent` calls `jobService.createJob(formData)`.
5. **HTTP Request via RxJS:**
   `JobService` executes an HTTP `POST` request to `http://localhost:5000/api/jobs` via Angular's `HttpClient`.
6. **Backend Processing:**
   Express receives the payload, validates required fields (`company`, `role`), and creates a Mongoose document.
7. **Database Storage:**
   The document is persisted in MongoDB (or local file fallback) with timestamps.
8. **HTTP Response:**
   The backend responds with `status: 201 Created` and the created job document.
9. **Cross-Component Reactive Trigger:**
   The `tap` operator in `JobService` calls `this.triggerRefresh()`, emitting a value on `refreshTriggerSubject`.
10. **Notification & Navigation:**
    `NotificationService.success()` pushes a toast to `toasts$`. The user is redirected to `/applications`. Both `JobListComponent` and `DashboardComponent` automatically re-fetch the latest data.

---

## 20 Project-Based Angular Interview Questions & Answers

### 1. What are Standalone Components in Angular 17, and why are they preferred over `NgModule`?
**Answer:** Standalone components have `standalone: true` in their `@Component` decorator and declare their own dependencies directly in an `imports: [...]` array. They eliminate boilerplate `NgModule` files, make components self-contained, facilitate tree-shaking, and simplify lazy-loading using `loadComponent`.

### 2. How did you structure route lazy loading in CareerTrack?
**Answer:** In `app.routes.ts`, we utilized the `loadComponent` property with dynamic ES module `import()` syntax:
```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
}
```
This splits each page into its own bundle chunk, downloaded only when the user navigates to that route.

### 3. How does the modern Angular template control flow (`@if`, `@for`, `@empty`) differ from `*ngIf` and `*ngFor`?
**Answer:** The modern control flow uses built-in syntax parsed directly by the Angular compiler rather than structural directives. It requires no imports from `CommonModule` for basic branching, avoids extra container elements, enforces `track` expressions in loops for optimal DOM reconciliation, and provides `@empty` for zero-boilerplate empty states.

### 4. Why is the `track` expression mandatory in `@for` loops?
**Answer:** The `track` expression (e.g. `@for (job of jobs; track job._id)`) allows Angular's change detection to uniquely identify each item in the DOM. When items are added, removed, or reordered, Angular mutates only the affected DOM nodes instead of re-rendering the entire list.

### 5. How did you implement component communication between the Add/Edit pages and the JobForm?
**Answer:** We used `@Input()` and `@Output()`. The parent (`AddJobComponent` or `EditJobComponent`) passes `[initialData]` and `[isEditMode]` down to `JobFormComponent`. The child form emits `(formSubmit)` and `(formCancel)` events up using `EventEmitter<T>`.

### 6. What is the difference between Reactive Forms and Template-Driven Forms? Why choose Reactive Forms for CareerTrack?
**Answer:** Reactive Forms are model-driven; the form structure and validation logic reside in the TypeScript component class via `FormGroup` and `FormControl`. They provide synchronous access to form values, predictable immutable data streams, and easy unit testing. Template-driven forms rely on template directives (`ngModel`) and are asynchronous and harder to unit-test.

### 7. How did you handle form validation and display error messages in `JobFormComponent`?
**Answer:** We used built-in Angular validators:
```typescript
company: ['', [Validators.required, Validators.minLength(2)]],
jobLink: ['', [Validators.pattern('https?://.+')]]
```
In the template, we defined a helper method `isFieldInvalid(fieldName)` checking `field.invalid && (field.dirty || field.touched)` so validation errors only appear after user interaction.

### 8. What is the difference between `inject()` and constructor injection in Angular?
**Answer:** `inject()` is a functional dependency injection API available in initialization contexts (field initializers, factory functions). It eliminates verbose constructor parameters, works seamlessly with inheritance without needing `super()`, and improves readability in standalone components.

### 9. What is a `BehaviorSubject` and how was it used in CareerTrack?
**Answer:** A `BehaviorSubject` is an RxJS Subject that stores the "current" value and emits it immediately to new subscribers. In `NotificationService`, a `BehaviorSubject<ToastNotification[]>` maintains active toasts, allowing components across the application to push notifications while the toast container template subscribes via the `async` pipe.

### 10. Why is unsubscribing from RxJS Observables important, and how is it handled here?
**Answer:** Failing to unsubscribe from long-lived Observables causes memory leaks because references to the component instance remain in memory. In `DashboardComponent` and `JobListComponent`, we created a `private sub = new Subscription()` and invoked `this.sub.unsubscribe()` inside `ngOnDestroy()`.

### 11. How does the `async` pipe prevent memory leaks in Angular templates?
**Answer:** The `async` pipe (`toasts$ | async`) automatically subscribes to the Observable when the component renders and automatically unsubscribes when the component is destroyed. It also triggers change detection whenever new values arrive.

### 12. How did you integrate Chart.js with Angular?
**Answer:** We imported Chart.js into `DashboardComponent` and used `@ViewChild('donutCanvas')` and `@ViewChild('barCanvas')` with `ElementRef<HTMLCanvasElement>` to obtain the native 2D rendering context in `ngAfterViewInit`. We also called `.destroy()` on previous chart instances before re-instantiating to prevent canvas reuse errors.

### 13. How does `JobService.refreshTrigger$` work across different components?
**Answer:** `JobService` has a private `refreshTriggerSubject = new BehaviorSubject<void>(undefined)`. Whenever a job is created, updated, or deleted via `createJob`, `updateJob`, or `deleteJob`, an RxJS `tap()` operator triggers `this.triggerRefresh()`. Any listening component (such as the Dashboard or Kanban list) automatically refreshes its data.

### 14. What are Angular Pipes, and which ones are utilized in CareerTrack?
**Answer:** Pipes transform data in template expressions without mutating the underlying model. We used `DatePipe` (`job.appliedDate | date:'mediumDate'`) to format dates and `CurrencyPipe` (`job.expectedSalary | currency:'USD':'symbol':'1.0-0'`) for localized currency formatting.

### 15. How did you retrieve route parameters in `EditJobComponent`?
**Answer:** We injected `ActivatedRoute` and accessed route params synchronously via snapshot:
```typescript
this.jobId = this.route.snapshot.paramMap.get('id');
```
Alternatively, Angular 17's `withComponentInputBinding()` allows route parameters to be bound directly to `@Input() id!: string;`.

### 16. What is the purpose of `environment.ts` and `environment.development.ts`?
**Answer:** They allow separating configuration values (such as backend API URLs) based on the build target. During production builds (`ng build --configuration production`), Angular CLI replaces `environment.ts` with production settings, preventing hardcoded local URLs from shipping to production.

### 17. How is optimistic UI updating implemented in the Kanban board?
**Answer:** When the user changes a status dropdown on a Kanban card, the card immediately updates its local `job.status` property before the HTTP response returns. If the backend API responds with an error, the error handler reverts the status back to its previous value and displays an error toast.

### 18. How did you implement the delete confirmation modal without external component libraries?
**Answer:** We built a standalone `ConfirmationModalComponent` with `@Input() isOpen`, `@Input() title`, `@Input() message`, and `@Output() confirm` / `@Output() cancel`. The modal utilizes a Tailwind backdrop and emits events to the parent `JobListComponent`, keeping component logic clean and decoupled.

### 19. What is the difference between `dirty`, `touched`, and `pristine` in Angular form controls?
**Answer:**
- `pristine`: The user has not changed the value in the UI.
- `dirty`: The user has changed the value in the UI.
- `touched`: The control has lost focus (user clicked inside and then blurred).
- `untouched`: The control has not lost focus yet.

### 20. How did you test CRUD operations and form validation?
**Answer:**
- For backend REST APIs, we developed an automated test runner (`backend/test-api.js`) verifying HTTP status codes, creation, query parameter filtering, and 404 error boundaries.
- For frontend services, we used Angular's `HttpClientTestingModule` and `HttpTestingController` to mock HTTP calls.
- For form validation, we created component tests verifying `jobForm.valid`, individual validator errors (`minlength`, `pattern`), and event emission on valid submit.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

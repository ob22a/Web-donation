# Antigravity Frontend Rules (rules.md)

## 1. Purpose of This Document

This document defines **non-negotiable architectural and behavioral rules** for the Antigravity frontend. It exists to:

* Prevent placeholder logic from leaking into production code
* Enforce consistency between frontend state management and backend APIs
* Act as the single source of truth for how JSX pages interact with the backend

Any new frontend work **must comply with this document**.

---

## 2. Page Classification Rule

All JSX pages fall into **exactly one** of the following categories:

### 2.1 Placeholder Pages

Placeholder pages are allowed to simulate UI flows **only temporarily** and **must not** contain business logic, hardcoded data, or mock API responses once real APIs exist.

**Current state**: placeholders may exist but must be clearly marked.

---

### 2.2 Real Pages (Authoritative Pages)

The following pages are **REAL PAGES** and must use **live backend APIs only**:

* `AllDonations.jsx`
* `CampaignDetail.jsx`
* `MyCampaigns.jsx`
* `NDashboard.jsx`
* `NGODashboard.jsx` (redirect/setup page where NGO fills required details)
* `NGORegister.jsx`
* `NGOs.jsx`
* `Profile.jsx`
* `Register.jsx`

#### Rules for Real Pages

1. ❌ No mock data
2. ❌ No hardcoded objects simulating backend responses
3. ✅ All data must come from backend APIs
4. ✅ All API calls must go through shared API utilities (`useFetch` or API service files)
5. ✅ State must flow through reducers and context, not local hacks

---

## 3. API-Driven Development Rule

### 3.1 Backend Is the Source of Truth

The backend **models and controllers define the contract**.

Frontend assumptions are forbidden.

Frontend must:

* Adapt to backend response shapes
* Never reshape backend data arbitrarily inside pages
* Perform mapping only in selectors or adapters if absolutely necessary

---

### 3.2 Mandatory Backend Exploration

Before implementing or updating any real page:

1. Inspect backend **models**
2. Inspect backend **controllers**
3. Identify:

   * Response structure
   * Field naming
   * Nested objects
   * Authorization requirements

No frontend work may begin without this step.

---

## 4. API Usage Rule

### 4.1 API Call Location

* ❌ Pages must NOT directly call `fetch` or `axios`
* ✅ All API calls must go through:

  * `useFetch`
  * or centralized API utility files

### 4.2 Error & Loading Handling

* Every API call must handle:

  * loading state
  * error state
  * empty state

No silent failures allowed.

---

## 5. State Management Rules

### 5.1 Reducers Are Mandatory

The following reducers are **authoritative**:

* `authReducer`
* `donorReducer`
* `NGOReducer`

Pages must:

* Dispatch actions
* Read state from context
* Never duplicate reducer state locally

---

### 5.2 Context Usage

The following contexts define global behavior:

* `authContext`

Rules:

* Authentication state must come from `authContext`
* Role-based rendering must rely on reducer state
* Token handling must never occur inside pages

---

## 6. Authentication & Authorization Rule

1. Authentication state lives in `authReducer`
2. JWT / session tokens:

   * Stored and retrieved centrally
   * Automatically attached in `useFetch`
3. Pages must not manually inject auth headers

Unauthorized access must result in:

* Redirect
* Or controlled error state

---

## 7. Page-Specific Expectations (High-Level)

### 7.1 AllDonations

* Fetch donations from backend
* Render paginated or filtered results if supported

### 7.2 CampaignDetail

* Fetch campaign by ID
* Use backend-provided campaign structure

### 7.3 MyCampaigns

* Fetch campaigns owned by authenticated user
* No client-side filtering of all campaigns

### 7.4 NDashboard / NGODashboard

* Fetch dashboard metrics from backend
* NGODashboard acts as:

  * Redirect if profile incomplete
  * Setup flow otherwise

### 7.5 NGORegister / Register

* Submit forms directly to backend
* No simulated success responses

### 7.6 NGOs

* Fetch NGO list from backend
* Display exactly what backend provides

### 7.7 Profile

* Fetch authenticated user profile
* Update profile via backend APIs only

---

## 8. Refactoring Rule

When replacing placeholders with real APIs:

1. Remove mock data entirely
2. Wire API → reducer → context → page
3. Validate response shape matches backend
4. Handle loading and error states

No hybrid mock/real logic allowed.

---

## 9. Enforcement Rule

Any PR or change that:

* Introduces mock data into real pages
* Bypasses reducers or context
* Assumes backend response shape

Is considered **invalid**.

---

## 10. Codebase State & Implementation Principles

1.  **API Utilities**: Files within the `api/` folder are considered complete and functional. Use them as the primary interface for backend communication.
2.  **Reducers & Hooks**: Reducers and custom hooks may currently be empty or in a skeleton state. These are the priority areas for implementation to bridge the `api/` layer and the pages.
3.  **Minimal Frontend Disruption**: Avoid changing the existing structure, data objects, or input formats of the frontend unless absolutely necessary. The backend is designed to handle the existing frontend inputs. If a conflict arises where the backend cannot accommodate the frontend's needs, inform the user immediately for a decision.

---

## 11. Exploration & Integration Prompt (For Antigravity)

Use the following prompt **before implementing frontend changes**:

---

**PROMPT:**

> Explore the entire Antigravity codebase with priority on the backend. Carefully inspect backend models and controllers to understand all API response structures, field names, nested objects, authentication requirements, and error formats. Do not assume any response shape.
>
> After fully understanding backend behavior, map each response to the frontend architecture. Update `useFetch` to correctly handle authorization, errors, and response parsing. Then update `authReducer`, `donorReducer`, and `NGOReducer` so their state mirrors backend data exactly.
>
> Finally, refactor all real JSX pages (`AllDonations`, `CampaignDetail`, `MyCampaigns`, `NDashboard`, `NGODashboard`, `NGORegister`, `NGOs`, `Profile`, `Register`) to consume data exclusively from reducers and context, removing all placeholder or simulated logic. Ensure loading, error, and empty states are handled consistently.

---

## 12. Final Principle

> **If the backend changes, the frontend adapts — never the other way around.**

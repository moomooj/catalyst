# Frontend Design Guideline (Next.js + AI Optimized)

This guideline is designed for AI-assisted development. Rules are intentionally strict to enforce consistency, predictability, and scalability.

---

**[IMPORTANT] Always refer to `PFS.md` (@Project Folder Structure) before creating any files or implementing logic.** All architectural decisions must align with the defined folder structure to maintain project integrity.

---

## 0. Core Philosophy

- Code must be predictable for both humans and AI
- Prefer explicitness over cleverness
- Separate responsibilities aggressively
- Optimize for long-term scalability, not short-term brevity

---

## 1. Next.js Architecture Rules

### 1.0 Typography (Brand)

Typography must match **`designer_guideline.md` §3 (Typography System)**.

| Use | Font |
|-----|------|
| Main text (body, UI, forms, nav) | **Raleway** |
| Display, logo, and editorial serif accents | **Playfair Display** |

**Implementation:** Load fonts with `next/font/google` in the root layout, apply **Raleway** as the default `body` font, and expose **Playfair Display** for headings or brand components (e.g. via a shared `className` or CSS variable). Do not introduce additional font families without updating the designer guideline.

---

### 1.1 Server vs Client Boundary (MANDATORY)

Rule: Explicitly separate Server and Client responsibilities.

**Server Components:**

- Data fetching (Direct DB or Service)
- Business logic execution
- Auth/Session handling
- SEO / Metadata

**Client Components:**

- UI interaction (useState, useEffect)
- Event handling (onClick, onChange)
- Browser APIs (localStorage, geolocation)

**Bad Example (Client route entry handles fetching):**

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

**Good Example (Server route entry fetches, Client component handles interaction):**

```tsx
export default async function Page() {
  const data = await fetchDashboardData();
  return <ClientComponent data={data} />;
}
```

### 1.2 Server Actions Rule

Rule: Server Actions must be thin and delegate logic to services.

**Example:**

```tsx
// ❌ Bad: Direct DB logic in action
export async function loginAction(formData: FormData) {
  const user = await db.user.findUnique(...);
  if (!user) throw new Error();
  cookies().set("session", "...");
}

// ✅ Good: Delegate to service
export async function loginAction(formData: FormData) {
  const result = await loginService(formData);
  if (!result.ok) return { error: result.error };
  cookies().set("session", result.data.session);
}
```

### 1.3 Navigation Rule (Next.js)

Rule: Navigation must occur via Next.js primitives.

- **Allowed:** `redirect("/dashboard")`, `router.push("/dashboard")`
- **Forbidden:** `location.href = "/dashboard"`

### 1.4 Data Fetching Priority

1. Server Component (Direct Service call) - **Default**
2. Server Action (For mutations or revalidation triggers)
3. React Query / SWR (Only for client-side polling or complex caching)

### 1.5 API Route Usage

Rule: Avoid unnecessary API routes. Use Server Actions instead unless:

- External webhook needed
- Third-party integration required
- Mobile client required
- Public API endpoint is required (non-React consumers)
- Streaming/SSE or long-lived HTTP response is needed
- Cron/batch/external system calls the endpoint directly

---

## 2. Readability

### 2.1 Naming Magic Numbers

Rule: Magic numbers/strings must be extracted to named constants.

```typescript
const RETRY_DELAY_MS = 500;
```

### 2.2 Complex Logic Extraction

Rule: Extract logic if reused or longer than 5 lines. Otherwise, colocate for readability.

### 2.3 Conditional Rendering

Rule: Significantly different UI roles (e.g., Admin vs Viewer) must be separated into components.

### 2.4 Ternary Rule

- **Allowed:** Single condition, short JSX
- **Forbidden:** Nested ternary, multi-branch logic

### 2.5 Naming Conditions

Rule: Complex boolean logic must be assigned to a named variable.

```typescript
const isValidUser = isLoggedIn && hasPermission && !isSuspended;
```

---

## 3. Predictability

### 3.1 Return Type Consistency

Standard pattern for services/actions:

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
```

All services should use this pattern by default.
Exceptions are allowed for framework control flow (`redirect`, `notFound`) and truly unexpected failures.

### 3.2 No Hidden Side Effects

Functions must only perform actions implied by their names.

### 3.3 Naming Conventions

- `useX`: Custom Hook
- `getX`: Synchronous getter
- `fetchX`: Async external call (network/DB)
- `handleX`: Event handler
- `onX`: Callback prop
- `create/update/deleteX`: Mutation

---

## 4. Cohesion

### 4.1 Feature-Based Structure (MANDATORY)

All domain logic must live in: `src/features/{domain}/`

### 4.2 Form Strategy

- **Field-level:** Independent validation
- **Form-level:** Dependent fields (Zod + RHF)

### 4.3 Constant Placement

- Near related logic
- Or global if shared

---

## 5. Coupling

### 5.1 No Premature Abstraction

Duplication is allowed if future divergence is expected.

### 5.2 Scoped State

Hooks must manage a single responsibility.

### 5.3 Composition over Prop Drilling

Prefer component composition instead of deep prop passing.

---

## 6. AI Optimization Rules

### 6.1 Explicit Code Only

- **Bad:** `process(data);`
- **Good:** `processUserData(data);`

### 6.2 Single Responsibility

Each function/file must have only one reason to change.

### 6.3 Flat Structure

Avoid deep nesting in code and folders.

### 6.4 File Naming Consistency

- `page.tsx`: Route entry
- `actions.ts`: Server Actions
- `service.ts`: Business logic
- `schema.ts`: Validation
- `types.ts`: Types

### 6.5 AI-Friendly Patterns

- Avoid implicit behavior
- Prefer explicit return values
- Avoid over-abstraction

---

## 7. Side Effects Management

- **Server Side:** DB queries, Auth, Cookies, Redirects
- **Client Side:** UI state, Animation, DOM interaction

---

## 8. Caching Strategy (Next.js Core)

Rule: Always prefer server-driven caching.

- Use Next.js fetch caching by default
- Use `revalidatePath` / `revalidateTag` for updates
- Avoid unnecessary client refetching
- Prefer server revalidation over React Query invalidation

---

## 9. Async State Strategy

Use React Query only when:

- Real-time updates required
- Polling needed
- Complex client cache needed
  Otherwise: Rely on server state.

---

## 10. Error Handling Strategy

Use structured errors via Result pattern.

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
```

**Guidelines:**

- Never throw for expected errors
- Exception: framework control flow (`redirect`, `notFound`) is allowed
- Use `code` for UI branching or i18n
- Handle errors at the boundary (action or component)

---

## 11. Anti-Patterns

- ❌ Business logic inside UI components
- ❌ Direct API calls in components (without abstraction)
- ❌ Nested ternary usage
- ❌ Implicit return types
- ❌ Global mutable state
- ❌ `location.href` navigation

---

**Summary:** Optimized for Next.js App Router. Service-oriented architecture. Strong consistency for AI collaboration.

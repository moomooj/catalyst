# Backend Design Guideline (Catalyst Mobile Bar - Server Side)

> **[IMPORTANT] Always refer to `PFS.md` (@Project Folder Structure) before implementing any server-side logic.** This project uses **Next.js Server Actions, Prisma, and Zod**.

---

## 1. Backend Layered Architecture (MANDATORY)

### 1.1 The Service Layer (`service.ts`)

**Rule:** All direct Database access (Prisma) and core business logic must reside here.

- **Input:** Primitive types or Zod-validated objects.
- **Output:** Should return `Promise<Result<T>>`.
- **Failure behavior:** For expected/domain errors, return `{ ok: false, ... }`. For truly unexpected failures, it is acceptable to `throw` and let the boundary handle/log it.
- **Constraint:** No Next.js specific APIs (no `cookies()`, `headers()`, or `redirect()`).
- **Safety:** Must include `import 'server-only';` at the top.

### 1.2 The Action Layer (`actions.ts`)

**Rule:** Thin entry point for Client Components.

- **Responsibility:** Session validation (Auth), Input parsing (`schema.safeParse`), calling Services, and Cache revalidation (`revalidatePath`).
- **Output:** Prefer returning `Result` for predictable UI handling.
- **Allowed:** `cookies()`, `headers()`, `redirect()`.
- **Constraint:** Never write a Prisma query directly in an action.

---

## 2. Database & Schema Rules (Prisma + Zod)

### 2.1 Schema Definition (`schema.ts`)

**Rule:** Every domain must have a Zod schema for input validation.

- **Naming:** Use the `Schema` suffix (e.g., `cocktailSchema`, `bookingSchema`).
- **Type Inference:** Export inferred types for use in services.
  ```typescript
  import { z } from "zod";

  export const cocktailSchema = z.object({ ... });
  export type CocktailInput = z.infer<typeof cocktailSchema>;
  ```

### 2.2 Prisma Integration (`src/lib/db.ts`)

- **Singleton:** Access DB only via the shared Prisma instance.
- **Optimized Fetching:** Use `select` to fetch only necessary fields to reduce payload.
- **Atomic Operations:** Use `$transaction` for operations requiring multi-table consistency (e.g., creating a booking and its inventory requirements).

---

## 3. Predictability & Error Handling

### 3.1 Backend Result Pattern

```typescript
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
```

### 3.2 Error Strategy

- **Expected Errors:** (e.g., "Duplicate cocktail name", "Date fully booked") Return `{ ok: false, error: "..." }`.
- **Unexpected Errors:** (e.g., "Prisma connection failed", "Runtime crash") Let them throw and be caught by `error.tsx`.
- **Control Flow:** Next.js internal throws (`redirect()`, `notFound()`) are permitted within Actions.

---

## 4. Naming Conventions (Server-Side)

- `findX`: Returns a single record or `null` (e.g., `findCocktailById`).
- `listX`: Returns an array of records (e.g., `listBookingsByDate`).
- `create/update/deleteX`: Direct Prisma mutations (in `service.ts`).
- `calculateX`: Business calculation logic, preferably pure (e.g., `calculateQuoteAmount`).
- `validateX`: Business rule validation logic, preferably pure (e.g., `validateBookingSlot`).

---

## 5. Security & Side Effects

### 5.1 Authorization Check

- **Rule:** Every Action modifying data must verify the user's role/session on the server.
- **Constraint:** Never trust the client-side user state; re-fetch/verify using `auth()` or sessions.

### 5.2 Cache Revalidation

- **Rule:** After a successful mutation in an Action, always use `revalidatePath` or `revalidateTag` to update the UI.

---

## 6. Anti-Patterns (Backend)

- ❌ Calling Prisma directly from a UI Component or `app/page.tsx`.
- ❌ Returning raw Prisma error objects to the client.
- ❌ Hardcoding pricing or business constants (Use DB or `constants/`).
- ❌ Passing `any` types; always use Prisma-generated types or Zod inference.

---

**Summary:** Robust, Service-oriented Backend optimized for Catalyst. Strictly follows Action-Service separation.

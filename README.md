# Hybrid Server-Driven Signup Flow (SDUI)

A **hybrid server-driven UI** signup flow where the server defines *what* to render (schema, pages, copy, variants)
and the client owns *how it behaves* (state, validation, navigation, analytics, side effects).

## Why
Signup/onboarding flows are high-impact and heavily experimented on. SDUI enables rapid iteration and A/B tests
without redeploying the client.

## Demo
- Variant A/B selector changes plan options and copy (server-controlled)
- Client validates required fields and controls navigation
- Analytics events are instrumented via `track()`

## Screens
-[Variant A Plan] (docs/variant-a-plan.png)
-[Variant B Plan] (docs/variant-b-plan.png)
-[Account] (docs/account-page.png)
-[Success] (docs/success-state.png)

## Architecture (Hybrid SDUI)
**Server (mocked in `src/sdui/mockServer.ts`):**
- Returns `SDUIFlow` JSON (`pages[]` → `components[]`)
- Supports Variant **A/B**

**Client:**
- `src/sdui/schema.ts` — typed schema contract (discriminated unions)
- `src/sdui/registry.ts` — maps schema `type` → React components
- `src/sdui/renderer.tsx` — translates schema → React elements using render context
- `src/pages/FlowPage.tsx` — owns state, validation, navigation, analytics, submit behavior (hybrid boundary)

**Hybrid boundary (key idea):**
- Server controls: structure, copy, options, experiment variants
- Client controls: state, validation, navigation, analytics, side effects

## How it works (schema → UI)
1. `fetchFlow(variant)` returns a typed `SDUIFlow`
2. `FlowPage` selects the active page and holds `form` + `errors`
3. `renderer.renderComponent()` looks up the component in the registry and renders it
4. Components are “dumb” building blocks that receive `value`, `onChange`, and `error`

## Running locally
```bash
npm install
npm run dev

## Production Architecture

### Frontend
- **S3 + CloudFront** hosts the static React app globally.

### Flow Config Service
- `GET /flow?userId=...`
- **API Gateway → Lambda**
- Lambda returns a typed `SDUIFlow` JSON (same schema as `src/sdui/schema.ts`).
- Optional: store configs by `flowId + version` in DynamoDB.

### Analytics Pipeline
- `POST /track`
- **API Gateway → Lambda**
- Lambda validates/enriches events and stores them.
- Storage options:
  - **DynamoDB** (simple + fast queries for MVP)
  - **Kinesis/Firehose → S3** (high-scale event streaming)

### Insights
- `GET /insights`
- **API Gateway → Lambda**
- Lambda returns aggregated metrics:
  - drop-offs by page
  - avg time per page
  - most common validation errors


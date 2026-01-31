# CLAUDE.md - Natural Workout Notes

## Project Overview

A natural language workout tracking app that parses informal workout notes into structured data using LLM.

**Example:**
```
Input:  "db bench 100 2x5"
Output: { exercise: "Dumbbell Bench Press", weight: 100, sets: 2, reps: 5 }
```

---

## Tech Stack (Meta-Aligned)

We're emulating Meta's production stack using open-source equivalents:

| Meta Stack | Our Stack | Notes |
|------------|-----------|-------|
| React | React | Same |
| Relay | Apollo Client | Easier to learn, concepts transfer |
| GraphQL | GraphQL | Same |
| Hack (PHP) | Node.js + TypeScript | Closest equivalent |
| Presto | PostgreSQL | For later (not implemented yet) |

**Why this stack?** User is starting as E4 Software Engineer at Meta in February 2026. This project teaches Meta-relevant patterns.

---

## Architecture

```
natural-workout-notes/
├── server/                 # GraphQL API + LLM integration
│   ├── src/
│   │   ├── index.ts        # Entry point only
│   │   ├── config.ts       # Environment validation
│   │   ├── schema.ts       # GraphQL SDL
│   │   ├── types.ts        # Zod schemas → TypeScript types
│   │   ├── errors.ts       # Custom error types
│   │   ├── resolvers.ts    # Thin resolvers, call services
│   │   ├── services/
│   │   │   ├── llm.ts      # LLM client (isolated, injectable)
│   │   │   └── parser.ts   # Workout parsing logic
│   │   └── tests/
│   │       ├── parser.unit.test.ts         # Fast, mocked
│   │       └── parser.integration.test.ts  # Real API
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── vitest.integration.config.ts
│
└── client/                 # React + Apollo Client (TBD)
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components/
    │   ├── hooks/
    │   └── graphql/
    └── package.json
```

---

## Best Practices

### General

- **Single Responsibility**: Each *function* does one thing. Files group related functions.
- **Types as Source of Truth**: Zod schemas generate TypeScript types
- **Dependency Injection**: Services accept dependencies for testability
- **Fail Fast**: Validate environment variables at startup
- **No Implicit Any**: Everything is typed
- **Cohesive Files**: Group by domain, not by function count

### File Organization

**Principle: One function per thing, not one file per thing.**

Single Responsibility applies at the **function** level — each function does one thing. Files are organizational containers that **group related functions**.

**When to split files:**
- Functions serve different domains (parsing vs. database vs. API)
- File exceeds ~200-300 lines
- You'd only import half the file elsewhere

**When NOT to split files:**
- Functions are tightly related
- They share private helpers
- Splitting would create circular dependencies

**Current structure:**

| File | Contains | Why grouped |
|------|----------|-------------|
| `index.ts` | Entry point only | Single purpose |
| `config.ts` | `requireEnv()`, config object | All configuration |
| `types.ts` | Zod schemas, TS types, `validateParsedExercises()` | Type definitions + their validation |
| `errors.ts` | `ParserError`, `LLMError`, `ValidationError` | All custom errors, imported together |
| `resolvers.ts` | GraphQL resolvers | Thin layer, all resolvers together |
| `services/llm.ts` | `LLMClient` interface, `llmClient` implementation | LLM communication |
| `services/parser.ts` | `parseWorkoutText()`, `parseJSON()`, `SYSTEM_PROMPT` | Parsing domain |

**Anti-pattern — over-splitting:**
```
# WRONG: one file per function
services/
├── parseWorkoutText.ts
├── parseJSON.ts
├── validateResponse.ts
└── stripMarkdown.ts
```

**Correct — cohesive grouping:**
```
# RIGHT: related functions together
services/
├── parser.ts    # parseWorkoutText, parseJSON (both parsing)
└── llm.ts       # LLM client, retry logic (both LLM communication)
```

### Error Handling

```typescript
// Custom error types for different failure modes
class ParserError extends Error { }
class LLMError extends Error { }
class ValidationError extends Error { }

// Always wrap external calls
try {
  const response = await llm.call(prompt, input)
  return validate(response)
} catch (error) {
  if (error instanceof ValidationError) throw error
  throw new ParserError('Failed to parse', error)
}
```

### Testing

| Type | Purpose | Speed | When to Run |
|------|---------|-------|-------------|
| Unit | Test code around LLM | <1s | Every change |
| Integration | Test actual LLM responses | ~30s | Before deploy, prompt changes |

**Unit tests** use mocked LLM client:
```typescript
function createMockLLM(response: string): LLMClient {
  return { call: async () => response }
}
```

**Integration tests** validate LLM behavior:
- Exercise abbreviation expansion
- Unit conversion (kg → lbs)
- Bodyweight exercise handling
- Timed exercise parsing
- Messy/conversational input

**Test Commands:**
```bash
npm test              # Unit tests only (fast)
npm run test:integration  # Integration tests (slow)
npm run test:all      # Both
```

### GraphQL

- Mutations for actions (parseWorkout)
- Queries for data retrieval
- Non-nullable fields use `!` in schema
- Schema must match TypeScript types exactly

### TypeScript

- Use `strict: true`
- No `any` — use `unknown` and validate
- Interfaces over types for objects
- Zod for runtime validation

---

## LLM Integration

### Current Provider

- **Model**: Kimi K2.5
- **Base URL**: https://api.moonshot.ai/v1
- **Format**: OpenAI-compatible

### Prompt Engineering

The system prompt is critical. Key principles:

1. **Explicit output format**: "JSON array only. No markdown."
2. **Schema definition**: Show exact field names and types
3. **Multiple examples**: Cover standard, edge cases, variations
4. **Failure behavior**: "If unparseable, return []"
5. **Abbreviation rules**: List common expansions
6. **Unit handling**: Specify conversion rules

### Response Validation

Never trust LLM output. Always validate:

```typescript
const response = await llm.call(prompt, input)
const parsed = JSON.parse(response)           // May throw
const validated = zodSchema.parse(parsed)     // May throw
return validated
```

### Current Capabilities

| Feature | Status |
|---------|--------|
| Standard format (bench 135 3x10) | ✅ |
| Abbreviations (bb, db, ohp, rdl) | ✅ |
| Bodyweight exercises | ✅ |
| Multiple exercises | ✅ |
| Timed exercises (plank 3x30s) | ✅ |
| Unit conversion (kg → lbs) | ✅ |
| Messy/conversational input | ✅ |
| Partial info (weight only) | ✅ |
| PR/max inference (1x1) | ✅ |
| "for X reps" inference | ✅ |
| Niche exercises | ✅ Relies on LLM knowledge |

### Inference Rules

The LLM applies these rules to extract maximum info while avoiding false assumptions:

| Pattern | Inference |
|---------|-----------|
| `bench 135 3x10` | Full info: weight=135, sets=3, reps=10 |
| `bench 135 for 10` | "for X" implies single set: sets=1, reps=10 |
| `3 sets of bench 135` | Sets explicit, reps unknown: sets=3, reps=null |
| `bench 135` | Weight only, ambiguous: sets=null, reps=null |
| `hit 315 squat PR` | PR/max implies: sets=1, reps=1 |
| `bench max 225` | Max implies: sets=1, reps=1 |
| `1rm deadlift 405` | 1RM explicit: sets=1, reps=1 |
| `pushups` | Bodyweight, no info: weight=0, sets=null, reps=null |
| `did squats today` | Exercise only: weight=null, sets=null, reps=null |

**Philosophy:** Only infer when unambiguous. Null = unknown, not zero. Client can prompt user to fill in missing data.

### Priority: LLM Response Consistency

Current focus is ensuring ALL workouts parse correctly:
- Standard lifts (bench, squat, deadlift)
- Accessory movements (curls, flyes, raises)
- Niche exercises (face pulls, landmine press, etc.)
- Variations (close grip, wide grip, paused, etc.)

Integration tests are the source of truth for LLM behavior.

---

## Data Model

### ParsedExercise

```typescript
interface ParsedExercise {
  exercise: string            // Full canonical name (required)
  weight: number | null       // Pounds, 0 for bodyweight, null if not specified
  sets: number | null         // null if not specified
  reps: number | null         // null if not specified or timed exercise
  duration: number | null     // Seconds, null if not specified or rep-based
}
```

### GraphQL Schema

```graphql
type ParsedExercise {
  exercise: String!
  weight: Int
  sets: Int
  reps: Int
  duration: Int
}

type Mutation {
  parseWorkout(input: String!): [ParsedExercise!]!
}
```

---

## Constraints

### Scope (MVP)

**In Scope:**
- Weightlifting exercises
- Bodyweight exercises
- Timed holds (plank, carries)
- Basic progress tracking

**Out of Scope (for now):**
- Cardio (treadmill, cycling)
- User authentication
- Database persistence
- Mobile app
- Workout history/analytics

### Technical Constraints

- Desktop-first (mobile later)
- Local development only
- No auth for MVP
- Pounds as default unit (kg conversion automatic)

### LLM Constraints

- ~16s response time (Kimi K2.5)
- Rate limits on API
- Non-deterministic output (same input may vary slightly)
- Cannot enumerate all possible exercises

---

## Commands Reference

### Server

```bash
cd server

# Development
npm run dev           # Start with hot reload

# Testing
npm test              # Unit tests
npm run test:integration  # Integration tests
npm run test:all      # All tests

# Build
npm run build         # Compile TypeScript
npm start             # Run compiled code
```

### Client (TBD)

```bash
cd client
npm run dev           # Vite dev server
npm run build         # Production build
npm test              # Component tests
```

---

## Environment Variables

### Server (.env)

```bash
KIMI_API_KEY=your_api_key_here
PORT=4000  # optional, defaults to 4000
```

---

## Development Workflow

1. **Write tests first** (TDD when possible)
2. **Run unit tests** before committing
3. **Run integration tests** before any prompt changes
4. **Types are source of truth** — update Zod schema first
5. **Keep resolvers thin** — logic belongs in services
6. **Dependency injection** — services accept dependencies

---

## Future Considerations

### Database (PostgreSQL)

When adding persistence:
- Store workouts with timestamp
- Link to user (when auth added)
- Enable progress tracking queries
- Consider: pass user's exercise history to LLM for better normalization

### Client (React + Apollo)

When building frontend:
- Apollo Client for GraphQL
- Functional components with hooks
- Component-level code splitting
- Optimistic UI updates

### Relay Migration

After comfortable with Apollo:
- Relay's fragment colocation
- Compiler-based optimizations
- Meta-specific patterns

---

## Troubleshooting

### "Missing required environment variable"
→ Copy `.env.example` to `.env` and fill in values

### Integration tests timing out
→ Kimi API can be slow (~16s). Timeout is set to 30s.

### LLM returning markdown code blocks
→ Parser strips ```json blocks automatically

### Inconsistent exercise names
→ This is expected. Integration tests use flexible matchers:
```typescript
expect(result[0].exercise.toLowerCase()).toContain('barbell')
```

---

## Contact / Context

This project is being built as Meta E4 preparation. The user:
- Starts at Meta February 23, 2026
- On MRS Search AI team in Menlo Park
- Has background in C#, JavaScript, Vue
- Learning React + TypeScript + GraphQL

The goal is practical learning, not perfection. Ship features, learn patterns.
# Application Design Plan

## Checklist

- [x] Generate components.md with component definitions
- [x] Generate component-methods.md with method signatures
- [x] Generate services.md with orchestration patterns
- [x] Generate component-dependency.md with relationships
- [x] Generate application-design.md consolidated doc
- [ ] Human approval for application design

## Design Questions

### Q1: Session store for hackathon MVP?

- [A] Firestore (persistent, production-like)
- [B] In-memory (fastest demo setup)

[Answer]:

### Q2: Should Listener and Confirmation use the same Gemini model tier?

- [A] Same model (gemini-2.0-flash) for all agents
- [B] Flash for Listener, Pro for Structurer/Brief

[Answer]:

### Q3: Web app packaging?

- [A] Single Vite app with /teacher and /child routes
- [B] Two separate mini-apps in services/web

[Answer]:

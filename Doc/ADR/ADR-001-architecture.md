# ADR-001: Architectural Style Decision

## Status
Accepted

## Context

The project aims to build a real, production-deployable restaurant operations system that may evolve into a SaaS platform.

The system must:

- Be maintainable by a single developer
- Support clean separation of responsibilities
- Allow future scalability
- Be deployable on AWS
- Demonstrate architectural maturity for portfolio purposes

Possible architectural options considered:

1. Traditional layered monolith
2. Microservices from the start
3. Modular monolith with Clean Architecture

---

## Decision

We will implement a:

> Modular Monolith using Clean Architecture principles.

---

## Rationale

### Why NOT microservices?

- Operational overhead (networking, service discovery, observability)
- Increased deployment complexity
- Overengineering for MVP
- Not aligned with single-developer constraints

### Why NOT traditional layered monolith?

- High coupling risk
- Controllers directly depending on persistence
- Poor testability
- Violates Dependency Inversion Principle

### Why Modular Monolith + Clean Architecture?

- Clear separation between Domain and Infrastructure
- Use cases are independent of frameworks
- Easier to test
- Easier future extraction into microservices
- Aligns with SOLID principles
- Production-ready structure

---

## Architectural Layers

### Domain
- Entities
- Value Objects
- Business rules

### Application
- Use Cases
- Interfaces (Repository contracts)

### Infrastructure
- Prisma repositories
- Database access
- External adapters (Siigo, WhatsApp)

### Interface
- HTTP controllers
- Guards
- DTO validation

---

## Consequences

### Positive

- High maintainability
- Clear module boundaries
- SaaS-ready evolution
- Good portfolio demonstration
- Testable business logic

### Negative

- Slightly more boilerplate than simple monolith
- Requires discipline to avoid layer leakage

---

## Future Considerations

If the system evolves into SaaS:

- Introduce tenant isolation
- Add billing service
- Extract integrations into independent services if needed

---

## Decision Owner
Project Author

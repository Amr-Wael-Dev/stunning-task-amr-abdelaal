# TECH.md

## What is it?

**Hermes Agent** (NousResearch) is a self-improving AI agent with 40+ tools and a plugin system. it support a wide range of LLM providers and models.

**Hindsight** is a persistent long-term memory provider that plugs into an LLM, before each turn it recalls relevant facts from past sessions and injects them into the system prompt, then after each response it extracts facts/entities/relationships in the background and retains them. It ships three tools — `hindsight_retain` (store), `hindsight_recall` (multi-strategy search), `hindsight_reflect` (cross-memory synthesis), on top of a knowledge graph with entity resolution, so the agent accumulates a model of a user over time instead of starting cold every session.

## How could Stunning use it?

Using Hermes with Hindsight makes each user's agent remember their stack preferences, past integrations picked, and prior build plans across sessions, so "build me a checkout flow" later recalls that this user already chose Stripe and a Postgres-flavored schema last time.

## What are its limitations?

- **Extra infra.** The native provider spins up a local Hindsight daemon with its own Postgres, real operational surface (backups, uptime, cold-start latency) for a feature that's optional until you actually need cross-session recall.
- **Isolation is a convention, not a guarantee.** `bank_id` correctness is entirely on the integrating app, a bug that derives the wrong id leaks one tenant's facts into another's context, a serious failure mode for a multi-tenant product.
- **Async retain means eventual consistency.** Facts are extracted in the background after each response, so memory can lag the conversation that produced it.
- **Young ecosystem.** Both Hermes and Hindsight are recent (2026), with a correspondingly small track record, worth watching for maturity before betting production reliability on it.

## Would you use it today? Why or why not?

Yes. For users, it turns a stateless build console into one that remembers their stack choices, past integrations, and prior build plans across sessions, recalling that a returning user already picked Stripe and a Postgres-flavored schema is real, compounding value, not a gimmick. For us as builders, the same memory layer doubles as a living knowledge base: `hindsight_reflect` can synthesize patterns across every user's build history (which integrations get combined most, which prompts fail), turning agent usage into product and documentation insight instead of throwaway logs.

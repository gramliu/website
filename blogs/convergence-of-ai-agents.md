---
title: Convergence of AI Agents
description: From a Cambrian explosion of agents to two durable endpoints—Personal AI and Business AI—and the agent-to-agent interfaces between them.
date: 2025-12-26
published: false
---

# Convergence of AI Agents

We’re living through a Cambrian explosion of AI agent applications. What started as “a chatbot that answers questions” has rapidly diversified into a zoo of specialized products, embedded copilots, and workflow automations.

It looks chaotic because it is. But underneath the surface, there’s a direction of travel: **today’s scattered agents will converge into two durable categories**:

- **Personal AI**: software that represents an individual
- **Business AI**: software that represents an organization

And at the point of convergence, the most important “user interface” won’t be a webpage—it will be **agents talking to agents**, negotiating tasks, permissions, and outcomes on behalf of people and companies.

This is an attempt to map what’s happening, why it’s happening, and what I think the end state looks like.

## The Cambrian explosion (2023–2026)

If you zoom out, the last few years produced at least four major species of agent products:

### 1) Consumer chat: the universal entry point

Chat interfaces (ChatGPT, Claude, Gemini) became the default on-ramp to model capability: ask a question, get an answer, iterate. This category matters not because chat is the final UI, but because it trained users to expect:

- natural language as a control surface
- fast feedback loops
- “good enough” answers across a wide range of domains

Chat was the wedge. Agents are the leverage.

### 2) Coding agents and app generation: software on demand

Tools like Cursor—and the broader wave of “agentic coding” and “app gen” products (e.g. Wabi, Lovable) changed the unit of software from “a repo” to “an intent.”

Instead of:

- define requirements
- write tickets
- implement
- review
- deploy

You can increasingly do:

- describe the outcome
- let an agent build a first version
- refine via conversation and constraints

This doesn’t eliminate engineering; it compresses iteration time and expands who can create software. It also points toward a bigger idea: **interfaces and workflows can be generated just-in-time (JIT)** for a specific user, task, and context.

### 3) Business AI: verticalized operators

In parallel, “Business AI” companies emerged that look less like chat products and more like operational roles: customer support agents, legal assistants, sales development reps, claims processors, etc. Examples that come to mind: Decagon, Harvey.

The key difference is the objective function. Business AI is judged on:

- reliability and auditability
- integration with systems of record (CRM, ticketing, ERP, data warehouses)
- measurable impact on cost, speed, and quality

In other words: **the job, not the conversation**.

### 4) The long tail: embedded copilots inside existing apps

The “copilotification” of software is the most underappreciated distribution channel. Notion, Figma, Shopify, and countless others are embedding agents directly into places where work already happens.

This matters because:

- the app already has context (documents, designs, products, customers)
- the app already has permissions
- the app already has a workflow model

Embedded agents are not necessarily “best-in-class intelligence,” but they are often **best-in-class placement**.

## Why convergence happens

Explosions create diversity; markets create gravity.

Over time, a few forces pull the ecosystem toward two endpoints:

- **Identity**: someone needs to “own” a task and its consequences. That owner is either a person or a company.
- **Permissions**: access control naturally clusters around individuals (personal accounts) and organizations (workspaces, tenants, roles).
- **Data**: individuals have personal data exhaust; businesses have proprietary operational data. The value of agents increases when they can act on the right data safely.
- **Trust and liability**: errors look different when they hurt one person vs. when they harm customers, revenue, or compliance posture.
- **Interfaces**: humans don’t want 50 agent apps. They want one entry point that routes work.

The result: a consolidation of agent experiences into **Personal AI** and **Business AI**.

## Personal AI: representation of an individual

Personal AI is the agent layer that represents *you*—as a consumer and as a professional.

It will do at least three things well:

### 1) JIT apps and interfaces

Instead of searching for the “right app,” your personal agent can generate a task-specific UI on demand:

- a one-off dashboard for a decision you’re making today
- a form that captures exactly the fields needed for a workflow
- a visualization tailored to your question and your mental model

The UI becomes disposable. The outcome becomes durable.

### 2) Internet-scale research with context

Search was optimized for documents. Personal AI will be optimized for *decisions*:

- pulling in sources, comparing claims, and tracking uncertainty
- remembering your preferences and prior conclusions
- turning research into concrete next actions (drafts, messages, plans)

### 3) Automation of daily tasks

Personal AI will increasingly run the “background processes” of life:

- scheduling, travel, and coordination
- email, follow-ups, and lightweight negotiation
- personal finance hygiene
- small recurring workflows that are too annoying to script, but too frequent to ignore

The theme is simple: **make the operations of an individual more efficient**.

## Business AI: representation of an organization

Business AI is the agent layer that represents a company, a team, or a business unit.

Where Personal AI is about personal context and convenience, Business AI is about:

- correctness and process
- access to systems of record
- policy enforcement (what can and cannot be done)
- measurable throughput (tickets resolved, deals moved, costs reduced)

This category will look like “AI employees,” but the more accurate framing is: **an API surface for business operations**.

Business AI will specialize in:

- **Customer support**: handle common issues, escalate edge cases, preserve brand voice
- **Biz ops**: automate workflows across tools, keep data consistent, reconcile exceptions
- **Research over business data**: answer questions grounded in internal metrics and source-of-truth systems

The theme is equally simple: **make the operations of a business more efficient**.

## The convergence point: agents talking to agents

Once Personal AI and Business AI exist as stable layers, the frontier shifts from “better chat” to **better agent-to-agent communication**.

Here’s one concrete picture:

- A professional’s personal agent is asked: “How are my accounts performing this quarter?”
- It knows which businesses you work with (or invest in, or purchase from).
- It reaches out to each company’s business agent with a query like:
  - “Return aggregated metrics for account X: spend, retention, NPS, open issues, and renewal risk.”
  - “Provide provenance: which systems produced these numbers and when were they last updated?”
- It receives structured responses, resolves conflicts, and then generates:
  - a JIT interface (a dashboard) that matches your preferences
  - a narrative summary with uncertainty and recommended actions
  - follow-up actions (schedule QBR, draft email, open tickets)

In this world:

- **Personal agents are the entry points for individuals and consumers.**
- **Business agents are the interfaces and APIs that expose functionality for these clients.**

The “killer app” is not a single agent product. It’s the **protocol layer** that makes agents composable across boundaries of identity, permissions, and data.

## Open questions (the things that will matter most)

I don’t think the convergence is optional, but the details are up for grabs.

- **Authentication and delegation**: how does a person safely authorize an agent to act, and how does that propagate to business systems?
- **Standards for requests and responses**: what’s the equivalent of HTTP + JSON for agent-to-agent work (including tools, policies, and provenance)?
- **Verification and audits**: how do businesses expose “answers” with evidence and traceability, not just text?
- **Incentives and pricing**: do agents pay each other per call, per outcome, per subscription, or via rev share?
- **Interface generation**: will JIT interfaces be native, web, or some intermediate representation that multiple clients can render?

## A working prediction

The current diversity of agent products is real, but temporary. We’ll keep seeing new species, new startups, and new feature launches—but the center of gravity will shift toward:

- a **Personal AI layer** that becomes the default UI for individuals
- a **Business AI layer** that becomes the default integration and action surface for organizations
- an **agent-to-agent layer** that defines how the two communicate

Everything else becomes a component, a tool, or a distribution channel.

---

## Notes for future expansion

- Add a section on “embedded copilots as distribution” (why incumbents win attention, even with weaker models).
- Add a section comparing “workflow agents” vs “knowledge agents” and why both collapse into Personal/Business representation.
- Add examples beyond SaaS: healthcare, finance, travel, commerce.
- Add a section on failure modes: prompt injection, data leaks, brittle automations, compliance drift.

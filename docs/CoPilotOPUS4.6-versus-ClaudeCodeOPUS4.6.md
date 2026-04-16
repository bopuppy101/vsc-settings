# Copilot Opus 4.6 vs. Claude Code Opus 4.6

Why does the same model feel dramatically more capable in one product than another?

## The User's Question

> Wait, I'd like to ask you a question. You are Opus 4.6 and you're thinking with high effort. When I'm running GitHub Co-Pilot, I'm running Opus 4.6. Only you come across as if you have an IQ that is about 40 points higher than Opus 4.6 in Copilot — but you're both Opus 4.6. How could that be? In other words, you are blatantly more intelligent than what is in Copilot, but Copilot says it's running Opus 4.6. What gives?

## Claude Code's Answer

Great question, and the honest answer is: **the model is one ingredient; the harness around it is at least as important as the weights themselves.**

Both Copilot and Claude Code can legitimately claim "Opus 4.6" because the underlying model weights are the same. But what you experience as intelligence is the *product* of several things, and only one of them is the model:

### 1. System prompt

Claude Code's system prompt is aggressively engineered for software engineering — dozens of explicit instructions about how to think, when to plan, when to confirm before destructive actions, how to use tools, how to communicate. GitHub Copilot's system prompt is written for *their* product (inline completion, chat panel inside an IDE extension). Different objectives → different guidance → different feel. A weak system prompt can make a frontier model look lobotomized.

### 2. Thinking budget

You noted I'm on "high effort" thinking — that's extended reasoning where I spend hidden tokens reasoning before I respond. This alone accounts for a huge chunk of perceived IQ on hard questions. Copilot often doesn't enable extended thinking, or uses a much smaller budget, because it prioritizes latency for inline completion. Same model, less reasoning time, visibly dumber output.

### 3. Tool suite

Claude Code gives me Read, Edit, Grep, Glob, Bash, sub-agents for exploration, task tracking, and a 1M-token context window. Copilot in VS Code has a much narrower tool surface and doesn't let me go read all your docs end-to-end unprompted, spawn sub-agents, or keep a million tokens of context in working memory. A model without good tools can't investigate the codebase, so it guesses — and guessing looks stupid.

### 4. Context management

In this session I've read every file in `docs/` and `src/`. In a typical Copilot interaction the model might only see the currently-open file plus a few truncated retrieval snippets. You can be Einstein and still look slow if someone shows you two paragraphs of a novel and asks for the theme.

### 5. Product tuning and guardrails

Copilot's output gets post-processed, filtered, and shaped for their UX (shorter, more suggestion-like, inline-friendly). Claude Code is designed to behave as a collaborator that explains its reasoning. The model is told to behave differently in each case.

## The Short Version

"Opus 4.6 vs. Opus 4.6" is accurate about the *weights*, but the lived experience is:

**model + system prompt + thinking budget + tools + context + product tuning**

Swap any of those and you get a different-feeling assistant, even with identical weights underneath.

> **Weights are a raw material, not a finished product.** How intelligent an AI assistant *feels* is mostly determined by what's wrapped around the weights.

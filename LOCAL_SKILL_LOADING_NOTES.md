# Local Skill Loading Notes

## Summary

This repository was patched so `superpowers-mcp` can load both:

- the configured Superpowers skills directory
- the user's local Codex skills directory at `~/.codex/skills`

The immediate goal was to make local gstack skills such as `gstack-browse` and
`gstack-qa` available through `list_skills` and `use_skill(...)` in Codex.

## What Happened

The local skill files existed and were readable:

- `C:\Users\sadva\.codex\skills\gstack-browse\SKILL.md`
- `C:\Users\sadva\.codex\skills\gstack-qa\SKILL.md`

The earlier UTF-8 issue was already fixed, so this was no longer an encoding
problem.

However, the active `superpowers` MCP server was configured with:

- `SUPERPOWERS_SKILLS_DIR = C:\Users\sadva\.codex\mcp\superpowers-skills\skills`

That directory only contained the official Superpowers skills and did not
contain the local gstack skills. As a result:

- `list_skills` did not show `gstack-browse` or `gstack-qa`
- `use_skill("gstack-browse")` returned `not found`
- `use_skill("gstack-qa")` returned `not found`

This mismatch explained the behavior completely: the skill files were present on
disk, but the MCP registry was scanning a different directory.

## Why The Existing Session Did Not Update

`superpowers-mcp` discovers skills during server startup and passes the result
into the tool registration layer. The loaded skill list is then held in memory
for the lifetime of that MCP process.

That means copying files into the scanned directory during an active Codex
session does not refresh `list_skills` or `use_skill(...)` for that already
running process. A new MCP process must be started to pick up the new skill
set.

## Patch Applied

The loader was changed so startup discovery now merges two sources:

1. the configured Superpowers skills directory
2. `~/.codex/skills` as a user-local skills directory

Supporting file handling was also changed so each skill file stores an absolute
path instead of a path relative to a single shared skill root. This matters once
skills can come from multiple directories.

The main implementation changes were made in:

- `src/index.ts`
- `src/server.ts`
- `src/skills/discovery.ts`
- `src/skills/types.ts`
- `src/tools/register.ts`
- `src/tools/intelligence.ts`
- `src/resources/register.ts`

## Behavior After The Patch

With the patched loader, a fresh `superpowers-mcp` process discovers both skill
sets and correctly includes local gstack skills.

Verified result from a fresh server instantiation:

- both directories were present in `skillsDirs`
- total discovered skills: `55`
- `hasBrowse: true`
- `hasQa: true`

## Important Operational Note

If a Codex session started before these changes took effect, that existing
session may still show the old in-memory skill registry. In that case, restart
Codex so the MCP server starts again and performs discovery with the patched
logic.

## Git History For This Work

Primary code change commit:

- `d096980 feat: load local codex skills alongside superpowers skills`

This document was added afterward to preserve the debugging trail and the final
state.

## Push Status

The local commit succeeded, but pushing to the configured GitHub remote failed
with a permissions error:

- remote: `Permission to erophames/superpowers-mcp.git denied to darkwingduck-code.`
- HTTP status: `403`

No history rewrite was attempted.



<!-- BEGIN:project-agent-rules -->

## Mandatory Pre-Coding Checklist

**Before writing, editing, or reviewing any code in this project, you MUST read these two files:**
~always use all the 4 skills in .agents/skills folder before making any changes to ui 
always use DESGIN.md file for design

1. **[`DESIGN.md`](./DESIGN.md)** — The project's visual identity, design tokens, colour palette,
   typography, component patterns, and UX decisions. Every UI change must conform to it.

2. **[`SKILLS.md`](./SKILLS.md)** — The full reference for all 4 installed agent skills
   (`frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`, `web-design-guidelines`).
   Activate whichever skills apply to the current task before producing output.

### Rules

- Do **not** start coding until both files have been read in the current session.
- If `DESIGN.md` conflicts with a user instruction, surface the conflict and ask which takes priority.
- Apply skills cumulatively — multiple skills can and should be active for the same task.
- After coding, self-review against the priorities in `SKILLS.md` (accessibility first, then the rest).

<!-- END:project-agent-rules -->

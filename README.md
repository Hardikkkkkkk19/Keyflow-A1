# Emerald Polish

KEYFLOW — FINAL COLOR CONSISTENCY & THEME POLISH

I want a complete visual color consistency pass across the ENTIRE KEYFLOW application.

IMPORTANT:

This is NOT a redesign.

Do NOT change layouts, components, functionality, data logic, authentication, Supabase, routing, typing engine, analytics calculations, or existing features.

ONLY fix the remaining inconsistent colors.

The current design direction is:

PREMIUM + CLASSY + REALISTIC + DARK + BLACK/CHARCOAL + EMERALD.

==================================================

1. AUDIT THE ENTIRE APPLICATION

==================================================

Scan the entire codebase, not just the current page.

Check:

- Dashboard

- Practice

- Drills

- Analytics

- Challenges

- AI Coach

- Leaderboard

- Profile

- Settings

- Login

- Register

- Forgot Password

- Reset Password

- Loading screens

- Modals

- Toasts

- Empty states

- Error states

- Navbar

- Footer

- Virtual Keyboard

- Charts

- XP / Level components

- Achievement components

- Challenge components

- Code Practice UI

Find ALL remaining:

- Blue

- Indigo

- Purple

- Violet

- Cyan-blue

- Blue gradients

- Purple gradients

- Blue borders

- Purple borders

- Blue shadows

- Purple glows

- Blue hover states

- Purple active states

- Blue icons

- Purple icons

- Blue progress indicators

Also check hardcoded HEX/RGB/HSL values, Tailwind classes, inline styles, SVG fills/strokes, chart colors and animation colors.

==================================================

2. USE THIS CANONICAL COLOR SYSTEM

==================================================

BACKGROUND:

#050807

#070A09

SURFACES:

#0D1210

#111715

#151B18

BORDERS:

#1A2823

#20342D

PRIMARY ACCENT:

#18C69A

SECONDARY ACCENT:

#20B88A

LIGHT ACCENT:

#38D6AE

DARK ACCENT:

#0F8F70

PRIMARY TEXT:

#F3F5F2

SECONDARY TEXT:

#A6ADA8

MUTED TEXT:

#68716C

==================================================

3. COLOR HIERARCHY

==================================================

IMPORTANT:

Do NOT simply make everything green.

Use:

BLACK / CHARCOAL → main surfaces

EMERALD → primary accent

WHITE → primary text

GRAY → secondary text

RED → errors / dangerous states

AMBER → warnings

EMERALD → success

Emerald should be restrained.

The interface should NOT look neon or like a gaming website.

==================================================

4. REMOVE OLD BLUE / PURPLE

==================================================

Replace old blue/purple/indigo/violet styling when it is being used as the primary theme accent.

Examples include:

text-blue-*

bg-blue-*

border-blue-*

ring-blue-*

text-indigo-*

bg-indigo-*

border-indigo-*

text-purple-*

bg-purple-*

border-purple-*

text-violet-*

bg-violet-*

border-violet-*

Replace these with appropriate:

emerald

dark charcoal

neutral gray

depending on the component.

Do NOT change semantic colors such as:

red = errors

amber = warnings

==================================================

5. NAVBAR

==================================================

Make sure the navbar has:

dark charcoal/black background

subtle border

neutral inactive navigation

emerald active indicator

emerald primary accent

Remove unnecessary blue/purple from:

logo

active tab

icons

profile

hover states

focus states

==================================================

6. DASHBOARD

==================================================

Audit every card, icon, CTA, badge and progress indicator.

Remove old blue/purple accents.

Use:

dark surfaces

subtle borders

emerald highlights

white/gray typography

Do NOT change the dashboard layout or functionality.

==================================================

7. DRILLS

==================================================

The Drills page currently has several purple/blue elements.

Specifically check:

- Priority Recommendation

- Targeted Isolator

- Focus Key badges

- Target Weak Key CTA

- Drill progress

- Icons

- Decorative elements

- Weak Key Summary

- Progress indicators

Convert old purple/blue accents into the new emerald/black theme.

Keep warning/error states appropriately red.

==================================================

8. ANALYTICS

==================================================

Audit:

- Charts

- Chart lines

- Chart points

- Tabs

- Time-range selectors

- Metric icons

- Tooltips

- Progress indicators

- Hover states

Use emerald for the primary dataset.

Use neutral gray for secondary datasets.

Do not make every chart green if multiple datasets require differentiation.

==================================================

9. PRACTICE

==================================================

DO NOT MODIFY THE TYPING ENGINE.

Only update its visual colors.

Correct characters:

subtle emerald

Incorrect characters:

muted red

Caret:

emerald

Active key:

emerald

Next key:

emerald accent

Mode selector:

dark charcoal + emerald active state

Keep the keyboard realistic and professional.

==================================================

10. VIRTUAL KEYBOARD

==================================================

Normal keys:

dark charcoal

Hover:

slightly lighter charcoal

Active:

subtle emerald

Next target:

emerald

Remove unnecessary blue/purple key states.

Do NOT add neon glowing effects.

==================================================

11. AI COACH

==================================================

Replace unnecessary blue/purple accents with emerald.

Keep AI messages mostly neutral.

Use emerald for:

active status

primary CTA

important insights

Do not make the entire AI page green.

==================================================

12. LEADERBOARD

==================================================

Remove unnecessary blue/purple colors.

Use:

dark table

neutral rows

emerald active/personal rank

subtle premium highlights

Keep semantic ranking colors where appropriate.

==================================================

13. GAMIFICATION

==================================================

Audit:

XP bars

Level indicators

Achievements

Level-up modal

XP toast

Challenge progress

Replace old blue/purple default accents with emerald.

Do not change XP calculations or progression logic.

==================================================

14. AUTH PAGES

==================================================

Audit:

Login

Register

Forgot Password

Reset Password

Welcome Champ loading screen

Use:

black background

dark charcoal surfaces

subtle emerald atmospheric lighting

emerald primary CTA

white/gray typography

Keep the existing authentication functionality untouched.

==================================================

15. FOOTER

==================================================

Remove unnecessary blue/purple from:

logo

icons

links

badges

status indicators

keyboard shortcut badges

Use neutral white/gray with restrained emerald accents.

==================================================

16. GRADIENT AUDIT

==================================================

Find and remove old:

blue → purple

purple → blue

indigo → violet

cyan → blue

gradients.

If a gradient is necessary, use only subtle:

emerald → transparent

or

black → dark emerald

No large neon gradients.

==================================================

17. GLOW / SHADOW AUDIT

==================================================

Remove old:

blue glow

purple glow

violet glow

Use subtle emerald glow only where visually useful.

Cards should NOT constantly glow.

==================================================

18. ICONS / SVG / CHARTS

==================================================

Check ALL icons and SVGs.

Check:

fill

stroke

color

hover

active

focus

Also inspect chart configuration because chart colors may be hardcoded separately.

Replace old blue/purple theme colors there as well.

==================================================

19. IMPORTANT — PRESERVE THE DESIGN

==================================================

The current premium dark design should remain.

Do NOT:

- redesign pages

- change spacing

- change typography

- change layouts

- change routes

- add features

- remove features

- modify backend

- modify Supabase

- modify authentication

- modify analytics logic

- modify typing calculations

This is ONLY a color consistency pass.

==================================================

20. REAL DATA RULE

==================================================

Do NOT introduce any fake data.

Do NOT modify:

WPM

Accuracy

Sessions

XP

Level

Streak

Achievements

Leaderboard

Analytics

Supabase data

==================================================

21. FINAL VISUAL GOAL

==================================================

The entire KEYFLOW application must feel like ONE unified premium product.

COLOR IDENTITY:

BLACK

-

CHARCOAL

-

EMERALD

-

WHITE/GRAY

with restrained RED and AMBER for semantic states.

The final result should feel:

Classy

Premium

Realistic

Professional

Minimal

Technical

Sophisticated

NOT:

Gaming

Cyberpunk

Neon

Purple

Blue

Colorful

Generic AI dashboard

==================================================

22. VERIFICATION

==================================================

After making the changes:

Search the entire codebase again for old blue/purple/indigo/violet theme colors.

Run:

npm run lint

npm run build

Then report:

- files changed

- major color replacements

- any remaining blue/purple colors and why they remain

- lint result

- build result

Do not claim everything is fixed unless you actually audited the entire codebase.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8fa61c71-1fa0-4eaf-9fbe-86d40c408092).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

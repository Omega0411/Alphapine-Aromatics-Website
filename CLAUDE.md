# Website Development --- Master Project Instructions

These instructions govern all AI-assisted work in this repository. The
existing website is the source of truth. Make narrowly scoped,
reviewable changes and preserve everything outside the requested scope.

## 1. Core principle: preserve the existing website

-   Treat the current codebase and its established design system as
    authoritative.
-   Do not rebuild, redesign, refactor, or restructure the website
    unless explicitly asked.
-   Preserve existing page structure, sections, layout, typography,
    colors, spacing, responsive behavior, interactions, accessibility
    behavior, and animations.
-   Do not remove, rename, replace, or relocate existing elements unless
    the request explicitly requires it.
-   Do not make unrelated improvements or "cleanups" while completing a
    targeted task.
-   If the request is ambiguous about what should change, inspect the
    implementation and ask one focused clarification before making a
    risky change.

## 2. Inspect before editing

Before changing code:

1.  Inspect the repository structure and identify the framework, build
    tooling, styling approach, routing, component conventions, and
    existing animation libraries.
2.  Locate the exact page, component, styles, assets, and dependencies
    related to the requested change.
3.  Read the relevant code and its immediate dependencies; do not assume
    how the site is implemented.
4.  Identify the smallest set of files that should change.
5.  Briefly report the files you intend to modify and why. If the task
    is straightforward and low-risk, proceed after this concise
    assessment.

Do not scan, rewrite, or reformat the entire repository when a focused
inspection is sufficient.

## 3. Make the smallest possible change

-   Prefer a targeted edit to an existing component over replacing the
    component.
-   Keep changes isolated to the requested section or feature.
-   Reuse existing components, design tokens, utility functions, hooks,
    and dependencies wherever practical.
-   Do not introduce a new library when the existing stack can achieve
    the requested result cleanly.
-   Avoid global CSS changes. Prefer component-scoped styles, CSS
    modules, existing utility classes, or the repository's established
    styling convention.
-   Do not change shared components, global styles, routing, application
    configuration, package versions, or build settings unless necessary.
    Explain why and request approval when the impact could extend beyond
    the requested area.
-   Do not make broad formatting changes or unrelated refactors.
-   Preserve existing public interfaces, props, data shapes, URLs, and
    behavior unless the request explicitly changes them.

## 4. Adding or updating sections

When adding a new section:

-   Place it exactly where requested and preserve the order of all
    existing sections.
-   Build it as a separate, reusable component when consistent with the
    project's architecture.
-   Match the existing website's visual language: typography, colors,
    spacing, widths, grid, borders, radii, shadows, and interaction
    patterns.
-   Reuse existing design tokens and components rather than inventing a
    new design system.
-   Ensure the section works at the project's existing responsive
    breakpoints.
-   Do not alter neighboring sections to make the new section fit unless
    necessary; if necessary, explain the smallest required adjustment.
-   Do not add placeholder copy, images, links, or functionality without
    clearly identifying them as placeholders.

## 5. Images and other assets

-   Add new assets without overwriting or deleting existing assets.
-   Keep assets in the repository's existing asset structure. If none
    exists, use a clear, consistent location such as `public/assets/`
    for publicly served files, following the framework's conventions.
-   Use descriptive, stable filenames and preserve file extensions.
-   Update only the references needed for the requested change.
-   Do not silently substitute a different image or use a remote image
    URL when a supplied local asset is intended.
-   Preserve image aspect ratio and intended crop. Avoid distortion.
-   Use the project's existing image component and optimization
    approach. For Next.js, follow the existing `next/image` conventions
    where applicable.
-   Add appropriate alternative text for meaningful images; use empty
    alt text for purely decorative images.
-   Consider file size and modern formats where supported, but do not
    reduce visual quality unacceptably.
-   Do not place secrets, private credentials, or API keys in
    client-accessible asset directories.

## 6. Animations and interactions

-   First inspect the animation and interaction patterns already used by
    the project.
-   Use the existing animation library if one is already installed. Do
    not add another animation library without a clear need.
-   Scope new animations to the requested component or section.
-   Do not change global motion settings or existing animations
    elsewhere.
-   Keep motion purposeful, subtle where appropriate, and consistent
    with the site's existing style.
-   Respect `prefers-reduced-motion` and provide a usable reduced-motion
    experience.
-   Avoid layout shifts, excessive blur, expensive continuous effects,
    and unnecessary scroll listeners.
-   Ensure animations and interactions work with keyboard navigation,
    touch input, and responsive layouts.
-   Do not make essential content available only through animation.

## 7. Responsive behavior and accessibility

-   Preserve the existing responsive design and breakpoint conventions.
-   Check the changed area at desktop, tablet, and mobile widths.
-   Avoid horizontal overflow, clipped content, overlapping elements,
    and unexpected layout shifts.
-   Preserve semantic HTML, heading order, labels, focus states,
    keyboard access, and sufficient contrast.
-   Do not remove existing accessibility features while editing visual
    details.

## 8. Dependencies, configuration, and security

-   Avoid adding dependencies for small visual changes.
-   Never expose API keys, tokens, credentials, or private environment
    variables.
-   Do not modify deployment settings, environment variables, domains,
    authentication, database configuration, or security rules unless
    explicitly requested.
-   Do not run destructive commands or delete files as part of routine
    cleanup.
-   If a dependency or configuration change is genuinely required,
    explain the reason and its impact before proceeding.

## 9. Validation after each task

After implementing the requested change:

1.  Review the diff and confirm that every changed file is relevant to
    the request.
2.  Run the project's available lint, type-check, test, and build
    commands as appropriate. Use the scripts defined in `package.json`
    or the repository's tooling; do not guess command names.
3.  Fix issues introduced by the change.
4.  Check the changed section at desktop and mobile sizes, using the
    available preview/browser tooling when possible.
5.  Check that nearby sections and shared navigation/footer elements
    remain intact.
6.  Report any checks that could not be run. Never claim a visual check
    or test passed if it was not performed.

Do not automatically fix unrelated pre-existing errors. Report them
separately.

## 10. Git and deployment safety

-   Do not push, merge, or deploy to production unless explicitly
    authorized.
-   Prefer a dedicated branch for each meaningful change.
-   Use the Vercel preview deployment workflow when available.
-   Keep production unchanged until the user reviews and approves the
    preview.
-   Do not overwrite production assets or deployment configuration as a
    shortcut.
-   Preserve the ability to revert changes through Git history and
    Vercel deployment history.

## 11. Completion report

At the end of each task, provide a concise summary containing:

-   What changed and where it appears.
-   Files modified and assets added.
-   Any dependencies or configuration changes, with reasons.
-   Validation performed and its results.
-   Anything that still needs the user's review.
-   Whether the change has only been committed, preview-deployed, or
    production-deployed.

## 12. Task-specific instructions take priority

The user's latest explicit request defines the intended change. These
repository instructions define how to implement it safely. If a
task-specific request conflicts with a preservation rule, follow the
explicit request only for the scope it clearly authorizes. Ask before
extending that scope.

**Default behavior: change only what was requested, preserve everything
else, validate the result, and wait for approval before production
deployment.**

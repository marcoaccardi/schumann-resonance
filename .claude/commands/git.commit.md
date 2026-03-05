---
description: Analyzes git changes and creates a smart git commit with conventional commit format
model: sonnet
argument-hint: [optional arguments]
---

Smart Git Commit Assistant

Please help me create one or more git commits by analyzing the scope of changes and grouping files appropriately:

1. First, check the current git status to see what has changed using the Bash tool with:
   - `git status --porcelain`

2. If no files are staged, categorize the changes by scope using the Bash tool to run these commands:
   - Frontend files: `git diff --name-only --diff-filter=ACMR | grep -E "\\.(js|jsx|ts|tsx|css|scss|sass|less|html|vue)$" || echo "No frontend files changed"`
   - Backend files: `git diff --name-only --diff-filter=ACMR | grep -E "\\.(py|go|rb|php|java|cpp|c|cs)$" || echo "No backend files changed"`
   - Documentation: `git diff --name-only --diff-filter=ACMR | grep -E "\\.(md|txt|rst)$" || echo "No documentation files changed"`
   - Configuration: `git diff --name-only --diff-filter=ACMR | grep -E "\\.(json|yml|yaml|xml|toml|ini|conf)$" || echo "No configuration files changed"`
   - Tests: `git diff --name-only --diff-filter=ACMR | grep -E "test\\.|\\.test\\.|_test\\.go|spec\\." || echo "No test files changed"`
   - Other files: `git diff --name-only --diff-filter=ACMR | grep -v -E "\\.(js|jsx|ts|tsx|css|scss|sass|less|html|vue|py|go|rb|php|java|cpp|c|cs|md|txt|rst|json|yml|yaml|xml|toml|ini|conf)$" | grep -v -E "test\\.|\\.test\\.|_test\\.go|spec\\." || echo "No other file types found"`

3. Based on the categorized changes, suggest staging and committing files by scope:

- For each distinct scope (frontend, backend, docs, etc.), recommend a separate commit if the changes are unrelated
- Example: If there are both frontend and backend changes, suggest making two separate commits

4. For each scoped commit, suggest:
- The appropriate commit type (feat/fix/docs/style/refactor/perf/test/chore)
- A concise, descriptive commit message following conventional commits
- Specific git add command for the files in that scope

After showing the suggested scoped commits stage and commit all scopes separately


Additional instructions: $ARGUMENTS
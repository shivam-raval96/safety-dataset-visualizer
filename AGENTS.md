# Dataset Atlas contributor rules

## Dataset verification

- Only add a dataset to `data/datasets.md` after verifying that it has an existing, publicly accessible dataset page on Hugging Face or repository on GitHub.
- Set the entry's `url` field to that direct Hugging Face dataset page or GitHub repository. Do not use search-result pages, guessed URLs, paper-only links, or unrelated mirrors.
- Confirm that the link resolves successfully and that the page describes the named dataset before adding the entry.
- Prefer the dataset creator's official Hugging Face organization or GitHub repository when multiple copies exist.
- Do not add an unverified dataset merely because it is mentioned in a paper or search result.

## Deployment

- After completing and validating any requested change, commit it and push `main` so the GitHub Pages site reflects the change.
- Verify that the corresponding GitHub Pages deployment succeeds before reporting completion.

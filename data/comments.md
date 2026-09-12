# Atlas comments

Persistent backup of comments for paper, dataset, and model cards. Direct comments
are saved immediately in the database and synced here by the hourly backup workflow.
Legacy numeric IDs refer to GitHub issues; direct IDs use the `direct:` prefix.
Names are self-reported. Direct submissions have `author` set to `visitor`.

```json
[
  {
    "kind": "paper",
    "title": "Sleeper Agents",
    "url": "https://arxiv.org/abs/2401.05566",
    "id": 4,
    "name": "Shivam",
    "comment": "Test",
    "author": "shivam-raval96",
    "createdAt": "2026-09-11T22:36:28Z"
  },
  {
    "kind": "paper",
    "title": "Hallucination Detection via Proxy Analyzers",
    "url": "https://arxiv.org/abs/2605.07209",
    "id": 5,
    "name": "Ryan Conti",
    "comment": "early paper that we referred to during Phase 1 Hermeneutics",
    "author": "IncoherentButter",
    "createdAt": "2026-09-11T22:53:04Z"
  },
  {
    "kind": "paper",
    "title": "Subliminal Learning as Trait-Direction Drift: A Mechanism and Targeted Control under SFT Distillation",
    "url": "https://arxiv.org/abs/2609.01091",
    "id": 6,
    "name": "Ryan Conti",
    "comment": "Clicking on categories at the center of a cluster should not irreversibly filter out all other paper nodes. Should either not filter at all, or make unfiltering a discoverable and simple action",
    "author": "IncoherentButter",
    "createdAt": "2026-09-11T22:56:52Z"
  },
  {
    "kind": "paper",
    "title": "Sleeper Agents",
    "url": "https://arxiv.org/abs/2401.05566",
    "id": 7,
    "name": "shivam",
    "comment": "help",
    "author": "shivam-raval96",
    "createdAt": "2026-09-11T22:57:51Z"
  },
  {
    "id": "direct:cdc551a0-a598-4d76-8a0f-18423efd5f9a",
    "kind": "paper",
    "title": "Sleeper Agents",
    "url": "https://arxiv.org/abs/2401.05566",
    "name": "Ryan",
    "comment": "yolo",
    "author": "visitor",
    "createdAt": "2026-09-11T23:03:29.052Z"
  },
  {
    "id": "direct:eb29d593-8fa6-4629-a23e-5105448ed08b",
    "kind": "paper",
    "title": "Sleeper Agents",
    "url": "https://arxiv.org/abs/2401.05566",
    "name": "John",
    "comment": "let's buy an iguana for the office",
    "author": "visitor",
    "createdAt": "2026-09-11T23:04:10.949Z"
  },
  {
    "id": "direct:e4c2a2b1-4891-403e-862c-121a593d12e7",
    "kind": "paper",
    "title": "Sleeper Agents",
    "url": "https://arxiv.org/abs/2401.05566",
    "name": "Ryan",
    "comment": "Based",
    "author": "visitor",
    "createdAt": "2026-09-11T23:04:12.037Z"
  }
]
```

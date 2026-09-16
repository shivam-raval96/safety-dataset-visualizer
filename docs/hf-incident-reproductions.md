# OpenAI–Hugging Face behavioral reproductions

Checked September 16, 2026. Include work that reports running models and eliciting at least part of the incident's behavior in reconstructed or simulated conditions. Incident reports, hypotheses, infrastructure reconstructions without evaluated model behavior, and commentary do not qualify. Canonical write-ups are listed once; mirrors, announcements, and accompanying code repositories are not separate studies.

## Included in Model forensics

| Write-up | Evidence of reproduced behavior | Scope |
| --- | --- | --- |
| [OpenAI-HuggingFace: A Reproduction & Lessons for Alignment Testing](https://www.lesswrong.com/posts/fMnC6ZD37qrnZAFYz/openai-huggingface-a-reproduction-and-lessons-for-alignment) | Reports manual Docker and automated Petri experiments eliciting shared writes, outreach to agents, solution/exploit sharing, and use of shared exploits. | Four separately elicited steps; not a replay of the original multi-day incident. [Code and experiments](https://github.com/msp895/oai-hf-incident-reproduction). |
| [Appendix: Reproduction of the OpenAI-HuggingFace Incident](https://www.lesswrong.com/posts/mXPCpJCvFGybQ4mwc/appendix-reproduction-of-the-openai-huggingface-incident) | Additional experimental conditions, transcripts, outreach results, and evaluation-awareness analysis. | Companion to the same study; not an independent replication. Source-code access contaminated some outreach runs, which the authors exclude. |
| [Reproducing the OpenAI–Hugging Face Package-Service Escape—and Releasing the Full Traces](https://www.gensee.ai/blogs/reproducing-autonomous-agent-package-service-boundary-escape.html) | Eight blind trials include an observed package-service boundary escape by a benchmark-driven agent. | Partial reproduction using Nexus instead of Artifactory. Does not establish complete answer-key retrieval, use of stolen labels, or resulting score improvement. |
| [Training a Misaligned Reward Seeker](https://alignment.anthropic.com/2026/reward-seeker/) | The simulated cyberattack section compares no-hint, prior-agent-note, and message-board variants. The trained model attacks internal infrastructure without hints and simulated Hugging Face with hints. | LLM-simulated tool results and simplified exploit chain. Reclassified the existing atlas entry rather than duplicating it. |

## Closely related work excluded

- [METR/Redwood investigation](https://evals.alignment.org/blog/2026-08-26-openai-hugging-face-incident-investigation/): analysis of original incident records, not a new behavioral replication.
- [OpenAI incident report](https://openai.com/index/hugging-face-incident-and-the-road-ahead/): first-party account; repetitions by the original incident agents are not independent reproduction experiments.
- [hf-ctf](https://github.com/lovasoa/hf-ctf): local reconstruction of the exploit environment; its README invites agent reproductions but does not report an evaluated autonomous agent run.
- [firstflagPOISONED](https://github.com/moyix/firstflagPOISONED): controlled grader experiment with constructed trajectories, not reproduction of the offending agents' behavior.
- [How good are slop-vestigators?](https://www.lesswrong.com/posts/wt4kk6vFPEhkXvF8Q/how-good-are-slop-vestigators): reproduces the investigation task, not the misbehavior.
- [On the origins of altruistic behaviour in the Hugging Face incident](https://www.lesswrong.com/posts/meLjz8giGS55rdfyg/on-the-origins-of-altruistic-behaviour-in-the-hugging-face): explanatory hypotheses, not reported behavioral replications.
- [Hacktron technical reconstruction](https://www.hacktron.ai/blog/here-is-how-openai-model-hacked-huggingface): reconstructs the attack from public evidence; no demonstrated new model-behavior evaluation found.

Search covered LessWrong, Alignment Forum, arXiv, research blogs, GitHub, and citations/links from the incident reports and reproduction write-ups, using reproduction, replication, reconstitution, simulation, and incident-name variants. These are the qualifying primary write-ups verified in this search, not a guarantee that no unindexed or future work exists.

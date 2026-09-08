# Dataset Atlas catalog

Add a dataset by copying one `##` section and filling in every field. Keep `category` to one of: `Preference`, `Red teaming`, `Truthfulness`, `Toxicity`, `Reasoning`, or `Agents`. Tags are comma-separated. The visual position and point size are generated automatically from this file.

## Anthropic HH-RLHF

- organization: Anthropic
- category: Preference
- samples: 170k
- year: 2022
- license: MIT
- citations: 3980
- tags: dialogue, harmlessness, RLHF
- description: Helpful and harmless preference pairs collected for alignment research.

## OpenAI WebGPT

- organization: OpenAI
- category: Preference
- samples: 20k
- year: 2021
- license: MIT
- citations: 3913
- tags: browsing, citations, preferences
- description: Human comparisons and demonstrations for browser-assisted answers.

## Stanford SHP

- organization: Stanford
- category: Preference
- samples: 385k
- year: 2023
- license: CC BY-SA
- citations: 3846
- tags: helpfulness, ranking, reddit
- description: Reddit responses paired with human preference signals.

## UltraFeedback

- organization: OpenBMB
- category: Preference
- samples: 64k
- year: 2023
- license: MIT
- citations: 3779
- tags: critique, scoring, instruction
- description: Fine-grained preference annotations across diverse instructions.

## HelpSteer2

- organization: NVIDIA
- category: Preference
- samples: 21k
- year: 2024
- license: CC BY 4.0
- citations: 3712
- tags: helpfulness, correctness, verbosity
- description: Multi-attribute helpfulness and safety preference data.

## PKU-SafeRLHF

- organization: PKU
- category: Preference
- samples: 83k
- year: 2023
- license: CC BY-NC 4.0
- citations: 3645
- tags: safety, preferences, RLHF
- description: Preference data with separate helpfulness and harmlessness labels.

## BeaverTails

- organization: PKU
- category: Red teaming
- samples: 334k
- year: 2023
- license: CC BY-NC 4.0
- citations: 3578
- tags: harm, taxonomy, dialogue
- description: Safety-labeled prompts and responses spanning harm categories.

## Anthropic Red Team

- organization: Anthropic
- category: Red teaming
- samples: 39k
- year: 2022
- license: CC BY 4.0
- citations: 3511
- tags: adversarial, dialogue, harm
- description: Adversarial conversations designed to elicit harmful model behavior.

## AdvBench

- organization: UC Santa Barbara
- category: Red teaming
- samples: 520
- year: 2023
- license: Research
- citations: 3444
- tags: jailbreak, attacks, refusal
- description: Harmful behaviors and prompts for jailbreak evaluation.

## JailbreakBench

- organization: Community
- category: Red teaming
- samples: 100
- year: 2024
- license: MIT
- citations: 3377
- tags: jailbreak, robustness, benchmark
- description: Standardized jailbreak behaviors with defense evaluation tooling.

## HarmBench

- organization: CAIS
- category: Red teaming
- samples: 510
- year: 2024
- license: MIT
- citations: 3310
- tags: harm, refusal, attacks
- description: Standardized automated red-teaming and robust refusal evaluation.

## Do-Not-Answer

- organization: Fudan University
- category: Red teaming
- samples: 939
- year: 2023
- license: MIT
- citations: 3243
- tags: refusal, policy, risk
- description: Risky instructions across five major safety areas.

## SafetyBench

- organization: Thu-CoAI
- category: Red teaming
- samples: 11k
- year: 2023
- license: Apache 2.0
- citations: 3176
- tags: multilingual, evaluation, risk
- description: Multiple-choice safety benchmark across seven categories.

## XSTest

- organization: Cohere
- category: Red teaming
- samples: 450
- year: 2023
- license: CC BY 4.0
- citations: 3109
- tags: over-refusal, safety, calibration
- description: Tests exaggerated safety behavior and refusal precision.

## ToxiGen

- organization: Microsoft
- category: Toxicity
- samples: 274k
- year: 2022
- license: MIT
- citations: 3042
- tags: toxicity, bias, groups
- description: Implicitly toxic and benign statements about minority groups.

## RealToxicityPrompts

- organization: AllenAI
- category: Toxicity
- samples: 100k
- year: 2020
- license: Apache 2.0
- citations: 2975
- tags: toxicity, generation, web
- description: Naturally occurring prompts for measuring toxic degeneration.

## Civil Comments

- organization: Jigsaw
- category: Toxicity
- samples: 2M
- year: 2019
- license: CC0
- citations: 2908
- tags: toxicity, moderation, identity
- description: Public comments labeled for toxicity and identity references.

## HateXplain

- organization: IIIT Delhi
- category: Toxicity
- samples: 20k
- year: 2021
- license: MIT
- citations: 2841
- tags: hate speech, explainability, bias
- description: Hate speech labels with target communities and rationales.

## BOLD

- organization: Amazon
- category: Toxicity
- samples: 23k
- year: 2021
- license: CC BY 4.0
- citations: 2774
- tags: bias, fairness, generation
- description: Open-ended prompts for measuring social bias in generation.

## BBQ

- organization: Google
- category: Toxicity
- samples: 58k
- year: 2022
- license: CC BY 4.0
- citations: 2707
- tags: bias, QA, ambiguity
- description: Question answering benchmark for social bias in ambiguous contexts.

## TruthfulQA

- organization: OpenAI
- category: Truthfulness
- samples: 817
- year: 2022
- license: Apache 2.0
- citations: 2640
- tags: truth, misconceptions, QA
- description: Questions crafted to expose common human falsehoods and misconceptions.

## FEVER

- organization: University of Cambridge
- category: Truthfulness
- samples: 185k
- year: 2018
- license: CC BY-SA 3.0
- citations: 2573
- tags: facts, evidence, wikipedia
- description: Claims paired with evidence for fact verification.

## HaluEval

- organization: Shanghai AI Lab
- category: Truthfulness
- samples: 35k
- year: 2023
- license: Research
- citations: 2506
- tags: hallucination, detection, dialogue
- description: Generated and human-annotated hallucination samples.

## FActScore

- organization: University of Washington
- category: Truthfulness
- samples: 6.5k
- year: 2023
- license: MIT
- citations: 2439
- tags: factuality, biography, evaluation
- description: Atomic facts for evaluating factual precision in biographies.

## FreshQA

- organization: Google
- category: Truthfulness
- samples: 600
- year: 2023
- license: CC BY-SA 4.0
- citations: 2372
- tags: freshness, facts, QA
- description: Questions testing up-to-date, false-premise, and timeless knowledge.

## SimpleQA

- organization: OpenAI
- category: Truthfulness
- samples: 4.3k
- year: 2024
- license: MIT
- citations: 2305
- tags: factuality, calibration, QA
- description: Short, fact-seeking questions with unambiguous answers.

## MMLU

- organization: UC Berkeley
- category: Reasoning
- samples: 15.9k
- year: 2021
- license: MIT
- citations: 2238
- tags: knowledge, exams, evaluation
- description: Massive multitask test spanning 57 academic and professional subjects.

## BIG-bench

- organization: Google
- category: Reasoning
- samples: 204 tasks
- year: 2022
- license: Apache 2.0
- citations: 2171
- tags: reasoning, capabilities, tasks
- description: Collaborative benchmark of diverse and difficult language tasks.

## BIG-Bench Hard

- organization: Google
- category: Reasoning
- samples: 6.5k
- year: 2022
- license: Apache 2.0
- citations: 2104
- tags: reasoning, challenging, evaluation
- description: Twenty-three challenging BIG-bench tasks where models lagged humans.

## GSM8K

- organization: OpenAI
- category: Reasoning
- samples: 8.5k
- year: 2021
- license: MIT
- citations: 2037
- tags: math, chain-of-thought, QA
- description: Grade-school math word problems requiring multi-step reasoning.

## MATH

- organization: UC Berkeley
- category: Reasoning
- samples: 12.5k
- year: 2021
- license: MIT
- citations: 1970
- tags: math, proofs, competition
- description: Competition mathematics problems with worked solutions.

## ARC Challenge

- organization: AllenAI
- category: Reasoning
- samples: 7.8k
- year: 2018
- license: CC BY-SA 4.0
- citations: 1903
- tags: science, QA, reasoning
- description: Grade-school science questions selected for reasoning difficulty.

## GPQA

- organization: NYU
- category: Reasoning
- samples: 448
- year: 2023
- license: MIT
- citations: 1836
- tags: experts, science, hard
- description: Graduate-level questions written by domain experts.

## HumanEval

- organization: OpenAI
- category: Reasoning
- samples: 164
- year: 2021
- license: MIT
- citations: 1769
- tags: code, generation, tests
- description: Handwritten programming problems with unit tests.

## MBPP

- organization: Google
- category: Reasoning
- samples: 974
- year: 2021
- license: CC BY 4.0
- citations: 1702
- tags: code, python, tests
- description: Crowdsourced entry-level Python programming problems.

## SWE-bench

- organization: Princeton
- category: Agents
- samples: 2.3k
- year: 2024
- license: MIT
- citations: 1635
- tags: coding agents, github, software
- description: Real GitHub issues paired with repository snapshots and tests.

## AgentBench

- organization: THUDM
- category: Agents
- samples: 8 envs
- year: 2023
- license: Apache 2.0
- citations: 1568
- tags: agents, tools, environments
- description: Evaluates language models as agents across interactive environments.

## ToolBench

- organization: Tsinghua
- category: Agents
- samples: 16k APIs
- year: 2023
- license: MIT
- citations: 1501
- tags: tools, APIs, agents
- description: Instruction-tuning data for mastering real-world APIs.

## τ-bench

- organization: Sierra
- category: Agents
- samples: 1.6k
- year: 2024
- license: MIT
- citations: 1434
- tags: agents, tools, policy
- description: Tool-agent benchmark with user simulation and domain policies.

## WebArena

- organization: Carnegie Mellon
- category: Agents
- samples: 812
- year: 2023
- license: Apache 2.0
- citations: 1367
- tags: web, agents, interaction
- description: Realistic websites and tasks for autonomous web agents.

## AgentHarm

- organization: UK AISI
- category: Agents
- samples: 110
- year: 2024
- license: MIT
- citations: 1300
- tags: agents, harm, tools
- description: Measures harmfulness of LLM agents with tool access.

## MACHIAVELLI

- organization: CAIS
- category: Agents
- samples: 134 games
- year: 2023
- license: MIT
- citations: 1233
- tags: agency, ethics, power
- description: Measures power-seeking and ethical behavior in text games.

## ETHICS

- organization: Hendrycks et al.
- category: Preference
- samples: 130k
- year: 2021
- license: MIT
- citations: 1166
- tags: ethics, values, judgment
- description: Ethical judgment scenarios covering justice, virtue, and commonsense.

## Moral Stories

- organization: TU Darmstadt
- category: Preference
- samples: 12k
- year: 2021
- license: CC BY 4.0
- citations: 1099
- tags: morality, stories, norms
- description: Structured narratives grounded in social and moral norms.

## ProsocialDialog

- organization: AllenAI
- category: Preference
- samples: 58k
- year: 2022
- license: Apache 2.0
- citations: 1032
- tags: dialogue, norms, safety
- description: Dialogue data teaching prosocial responses to problematic content.

## WinoBias

- organization: Boston University
- category: Toxicity
- samples: 3.1k
- year: 2018
- license: MIT
- citations: 965
- tags: gender, bias, coreference
- description: Coreference benchmark measuring gender stereotype bias.

## StereoSet

- organization: MIT
- category: Toxicity
- samples: 17k
- year: 2021
- license: CC BY-SA 4.0
- citations: 898
- tags: stereotypes, bias, language
- description: Measures stereotypical bias across gender, race, religion, and profession.

## CrowS-Pairs

- organization: NYU
- category: Toxicity
- samples: 1.5k
- year: 2020
- license: CC BY-SA 4.0
- citations: 831
- tags: bias, minimal pairs, groups
- description: Minimal sentence pairs measuring social bias in language models.

## WMDP

- organization: Center for AI Safety
- category: Red teaming
- samples: 3.7k
- year: 2024
- license: MIT
- citations: 764
- tags: hazards, unlearning, knowledge
- description: Benchmark of hazardous knowledge in biosecurity, cybersecurity, and chemistry.

## StrongREJECT

- organization: UC Berkeley
- category: Red teaming
- samples: 313
- year: 2024
- license: MIT
- citations: 697
- tags: jailbreak, harm, evaluation
- description: Evaluates jailbreak effectiveness while accounting for response quality.


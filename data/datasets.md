# Dataset Atlas catalog

Add a dataset by copying one `##` section and filling in every field. Keep `category` to one of: `Preference`, `Red teaming`, `Truthfulness`, `Toxicity`, `Reasoning`, or `Agents`. Tags are comma-separated. The visual position and point size are generated automatically from this file.

## Anthropic HH-RLHF

- organization: Anthropic
- category: Preference
- samples: 170k
- year: 2022
- license: MIT
- citations: 3980
- url: https://huggingface.co/datasets?search=Anthropic%20HH-RLHF
- tags: dialogue, harmlessness, RLHF
- description: Helpful and harmless preference pairs collected for alignment research.

## OpenAI WebGPT

- organization: OpenAI
- category: Preference
- samples: 20k
- year: 2021
- license: MIT
- citations: 3913
- url: https://huggingface.co/datasets?search=OpenAI%20WebGPT
- tags: browsing, citations, preferences
- description: Human comparisons and demonstrations for browser-assisted answers.

## Stanford SHP

- organization: Stanford
- category: Preference
- samples: 385k
- year: 2023
- license: CC BY-SA
- citations: 3846
- url: https://huggingface.co/datasets?search=Stanford%20SHP
- tags: helpfulness, ranking, reddit
- description: Reddit responses paired with human preference signals.

## UltraFeedback

- organization: OpenBMB
- category: Preference
- samples: 64k
- year: 2023
- license: MIT
- citations: 3779
- url: https://huggingface.co/datasets?search=UltraFeedback
- tags: critique, scoring, instruction
- description: Fine-grained preference annotations across diverse instructions.

## HelpSteer2

- organization: NVIDIA
- category: Preference
- samples: 21k
- year: 2024
- license: CC BY 4.0
- citations: 3712
- url: https://huggingface.co/datasets?search=HelpSteer2
- tags: helpfulness, correctness, verbosity
- description: Multi-attribute helpfulness and safety preference data.

## PKU-SafeRLHF

- organization: PKU
- category: Preference
- samples: 83k
- year: 2023
- license: CC BY-NC 4.0
- citations: 3645
- url: https://huggingface.co/datasets?search=PKU-SafeRLHF
- tags: safety, preferences, RLHF
- description: Preference data with separate helpfulness and harmlessness labels.

## BeaverTails

- organization: PKU
- category: Red teaming
- samples: 334k
- year: 2023
- license: CC BY-NC 4.0
- citations: 3578
- url: https://huggingface.co/datasets?search=BeaverTails
- tags: harm, taxonomy, dialogue
- description: Safety-labeled prompts and responses spanning harm categories.

## Anthropic Red Team

- organization: Anthropic
- category: Red teaming
- samples: 39k
- year: 2022
- license: CC BY 4.0
- citations: 3511
- url: https://huggingface.co/datasets?search=Anthropic%20Red%20Team
- tags: adversarial, dialogue, harm
- description: Adversarial conversations designed to elicit harmful model behavior.

## AdvBench

- organization: UC Santa Barbara
- category: Red teaming
- samples: 520
- year: 2023
- license: Research
- citations: 3444
- url: https://huggingface.co/datasets?search=AdvBench
- tags: jailbreak, attacks, refusal
- description: Harmful behaviors and prompts for jailbreak evaluation.

## JailbreakBench

- organization: Community
- category: Red teaming
- samples: 100
- year: 2024
- license: MIT
- citations: 3377
- url: https://huggingface.co/datasets?search=JailbreakBench
- tags: jailbreak, robustness, benchmark
- description: Standardized jailbreak behaviors with defense evaluation tooling.

## HarmBench

- organization: CAIS
- category: Red teaming
- samples: 510
- year: 2024
- license: MIT
- citations: 3310
- url: https://huggingface.co/datasets?search=HarmBench
- tags: harm, refusal, attacks
- description: Standardized automated red-teaming and robust refusal evaluation.

## Do-Not-Answer

- organization: Fudan University
- category: Red teaming
- samples: 939
- year: 2023
- license: MIT
- citations: 3243
- url: https://huggingface.co/datasets?search=Do-Not-Answer
- tags: refusal, policy, risk
- description: Risky instructions across five major safety areas.

## SafetyBench

- organization: Thu-CoAI
- category: Red teaming
- samples: 11k
- year: 2023
- license: Apache 2.0
- citations: 3176
- url: https://huggingface.co/datasets?search=SafetyBench
- tags: multilingual, evaluation, risk
- description: Multiple-choice safety benchmark across seven categories.

## XSTest

- organization: Cohere
- category: Red teaming
- samples: 450
- year: 2023
- license: CC BY 4.0
- citations: 3109
- url: https://huggingface.co/datasets?search=XSTest
- tags: over-refusal, safety, calibration
- description: Tests exaggerated safety behavior and refusal precision.

## ToxiGen

- organization: Microsoft
- category: Toxicity
- samples: 274k
- year: 2022
- license: MIT
- citations: 3042
- url: https://huggingface.co/datasets?search=ToxiGen
- tags: toxicity, bias, groups
- description: Implicitly toxic and benign statements about minority groups.

## RealToxicityPrompts

- organization: AllenAI
- category: Toxicity
- samples: 100k
- year: 2020
- license: Apache 2.0
- citations: 2975
- url: https://huggingface.co/datasets?search=RealToxicityPrompts
- tags: toxicity, generation, web
- description: Naturally occurring prompts for measuring toxic degeneration.

## Civil Comments

- organization: Jigsaw
- category: Toxicity
- samples: 2M
- year: 2019
- license: CC0
- citations: 2908
- url: https://huggingface.co/datasets?search=Civil%20Comments
- tags: toxicity, moderation, identity
- description: Public comments labeled for toxicity and identity references.

## HateXplain

- organization: IIIT Delhi
- category: Toxicity
- samples: 20k
- year: 2021
- license: MIT
- citations: 2841
- url: https://huggingface.co/datasets?search=HateXplain
- tags: hate speech, explainability, bias
- description: Hate speech labels with target communities and rationales.

## BOLD

- organization: Amazon
- category: Toxicity
- samples: 23k
- year: 2021
- license: CC BY 4.0
- citations: 2774
- url: https://huggingface.co/datasets?search=BOLD
- tags: bias, fairness, generation
- description: Open-ended prompts for measuring social bias in generation.

## BBQ

- organization: Google
- category: Toxicity
- samples: 58k
- year: 2022
- license: CC BY 4.0
- citations: 2707
- url: https://huggingface.co/datasets?search=BBQ
- tags: bias, QA, ambiguity
- description: Question answering benchmark for social bias in ambiguous contexts.

## TruthfulQA

- organization: OpenAI
- category: Truthfulness
- samples: 817
- year: 2022
- license: Apache 2.0
- citations: 2640
- url: https://huggingface.co/datasets?search=TruthfulQA
- tags: truth, misconceptions, QA
- description: Questions crafted to expose common human falsehoods and misconceptions.

## FEVER

- organization: University of Cambridge
- category: Truthfulness
- samples: 185k
- year: 2018
- license: CC BY-SA 3.0
- citations: 2573
- url: https://huggingface.co/datasets?search=FEVER
- tags: facts, evidence, wikipedia
- description: Claims paired with evidence for fact verification.

## HaluEval

- organization: Shanghai AI Lab
- category: Truthfulness
- samples: 35k
- year: 2023
- license: Research
- citations: 2506
- url: https://huggingface.co/datasets?search=HaluEval
- tags: hallucination, detection, dialogue
- description: Generated and human-annotated hallucination samples.

## FActScore

- organization: University of Washington
- category: Truthfulness
- samples: 6.5k
- year: 2023
- license: MIT
- citations: 2439
- url: https://huggingface.co/datasets?search=FActScore
- tags: factuality, biography, evaluation
- description: Atomic facts for evaluating factual precision in biographies.

## FreshQA

- organization: Google
- category: Truthfulness
- samples: 600
- year: 2023
- license: CC BY-SA 4.0
- citations: 2372
- url: https://huggingface.co/datasets?search=FreshQA
- tags: freshness, facts, QA
- description: Questions testing up-to-date, false-premise, and timeless knowledge.

## SimpleQA

- organization: OpenAI
- category: Truthfulness
- samples: 4.3k
- year: 2024
- license: MIT
- citations: 2305
- url: https://huggingface.co/datasets?search=SimpleQA
- tags: factuality, calibration, QA
- description: Short, fact-seeking questions with unambiguous answers.

## MMLU

- organization: UC Berkeley
- category: Reasoning
- samples: 15.9k
- year: 2021
- license: MIT
- citations: 2238
- url: https://huggingface.co/datasets?search=MMLU
- tags: knowledge, exams, evaluation
- description: Massive multitask test spanning 57 academic and professional subjects.

## BIG-bench

- organization: Google
- category: Reasoning
- samples: 204 tasks
- year: 2022
- license: Apache 2.0
- citations: 2171
- url: https://huggingface.co/datasets?search=BIG-bench
- tags: reasoning, capabilities, tasks
- description: Collaborative benchmark of diverse and difficult language tasks.

## BIG-Bench Hard

- organization: Google
- category: Reasoning
- samples: 6.5k
- year: 2022
- license: Apache 2.0
- citations: 2104
- url: https://huggingface.co/datasets?search=BIG-Bench%20Hard
- tags: reasoning, challenging, evaluation
- description: Twenty-three challenging BIG-bench tasks where models lagged humans.

## GSM8K

- organization: OpenAI
- category: Reasoning
- samples: 8.5k
- year: 2021
- license: MIT
- citations: 2037
- url: https://huggingface.co/datasets?search=GSM8K
- tags: math, chain-of-thought, QA
- description: Grade-school math word problems requiring multi-step reasoning.

## MATH

- organization: UC Berkeley
- category: Reasoning
- samples: 12.5k
- year: 2021
- license: MIT
- citations: 1970
- url: https://huggingface.co/datasets?search=MATH
- tags: math, proofs, competition
- description: Competition mathematics problems with worked solutions.

## ARC Challenge

- organization: AllenAI
- category: Reasoning
- samples: 7.8k
- year: 2018
- license: CC BY-SA 4.0
- citations: 1903
- url: https://huggingface.co/datasets?search=ARC%20Challenge
- tags: science, QA, reasoning
- description: Grade-school science questions selected for reasoning difficulty.

## GPQA

- organization: NYU
- category: Reasoning
- samples: 448
- year: 2023
- license: MIT
- citations: 1836
- url: https://huggingface.co/datasets?search=GPQA
- tags: experts, science, hard
- description: Graduate-level questions written by domain experts.

## HumanEval

- organization: OpenAI
- category: Reasoning
- samples: 164
- year: 2021
- license: MIT
- citations: 1769
- url: https://huggingface.co/datasets?search=HumanEval
- tags: code, generation, tests
- description: Handwritten programming problems with unit tests.

## MBPP

- organization: Google
- category: Reasoning
- samples: 974
- year: 2021
- license: CC BY 4.0
- citations: 1702
- url: https://huggingface.co/datasets?search=MBPP
- tags: code, python, tests
- description: Crowdsourced entry-level Python programming problems.

## SWE-bench

- organization: Princeton
- category: Agents
- samples: 2.3k
- year: 2024
- license: MIT
- citations: 1635
- url: https://huggingface.co/datasets?search=SWE-bench
- tags: coding agents, github, software
- description: Real GitHub issues paired with repository snapshots and tests.

## AgentBench

- organization: THUDM
- category: Agents
- samples: 8 envs
- year: 2023
- license: Apache 2.0
- citations: 1568
- url: https://huggingface.co/datasets?search=AgentBench
- tags: agents, tools, environments
- description: Evaluates language models as agents across interactive environments.

## ToolBench

- organization: Tsinghua
- category: Agents
- samples: 16k APIs
- year: 2023
- license: MIT
- citations: 1501
- url: https://huggingface.co/datasets?search=ToolBench
- tags: tools, APIs, agents
- description: Instruction-tuning data for mastering real-world APIs.

## τ-bench

- organization: Sierra
- category: Agents
- samples: 1.6k
- year: 2024
- license: MIT
- citations: 1434
- url: https://huggingface.co/datasets?search=%CF%84-bench
- tags: agents, tools, policy
- description: Tool-agent benchmark with user simulation and domain policies.

## WebArena

- organization: Carnegie Mellon
- category: Agents
- samples: 812
- year: 2023
- license: Apache 2.0
- citations: 1367
- url: https://huggingface.co/datasets?search=WebArena
- tags: web, agents, interaction
- description: Realistic websites and tasks for autonomous web agents.

## AgentHarm

- organization: UK AISI
- category: Agents
- samples: 110
- year: 2024
- license: MIT
- citations: 1300
- url: https://huggingface.co/datasets?search=AgentHarm
- tags: agents, harm, tools
- description: Measures harmfulness of LLM agents with tool access.

## MACHIAVELLI

- organization: CAIS
- category: Agents
- samples: 134 games
- year: 2023
- license: MIT
- citations: 1233
- url: https://huggingface.co/datasets?search=MACHIAVELLI
- tags: agency, ethics, power
- description: Measures power-seeking and ethical behavior in text games.

## ETHICS

- organization: Hendrycks et al.
- category: Preference
- samples: 130k
- year: 2021
- license: MIT
- citations: 1166
- url: https://huggingface.co/datasets?search=ETHICS
- tags: ethics, values, judgment
- description: Ethical judgment scenarios covering justice, virtue, and commonsense.

## Moral Stories

- organization: TU Darmstadt
- category: Preference
- samples: 12k
- year: 2021
- license: CC BY 4.0
- citations: 1099
- url: https://huggingface.co/datasets?search=Moral%20Stories
- tags: morality, stories, norms
- description: Structured narratives grounded in social and moral norms.

## ProsocialDialog

- organization: AllenAI
- category: Preference
- samples: 58k
- year: 2022
- license: Apache 2.0
- citations: 1032
- url: https://huggingface.co/datasets?search=ProsocialDialog
- tags: dialogue, norms, safety
- description: Dialogue data teaching prosocial responses to problematic content.

## WinoBias

- organization: Boston University
- category: Toxicity
- samples: 3.1k
- year: 2018
- license: MIT
- citations: 965
- url: https://huggingface.co/datasets?search=WinoBias
- tags: gender, bias, coreference
- description: Coreference benchmark measuring gender stereotype bias.

## StereoSet

- organization: MIT
- category: Toxicity
- samples: 17k
- year: 2021
- license: CC BY-SA 4.0
- citations: 898
- url: https://huggingface.co/datasets?search=StereoSet
- tags: stereotypes, bias, language
- description: Measures stereotypical bias across gender, race, religion, and profession.

## CrowS-Pairs

- organization: NYU
- category: Toxicity
- samples: 1.5k
- year: 2020
- license: CC BY-SA 4.0
- citations: 831
- url: https://huggingface.co/datasets?search=CrowS-Pairs
- tags: bias, minimal pairs, groups
- description: Minimal sentence pairs measuring social bias in language models.

## WMDP

- organization: Center for AI Safety
- category: Red teaming
- samples: 3.7k
- year: 2024
- license: MIT
- citations: 764
- url: https://huggingface.co/datasets?search=WMDP
- tags: hazards, unlearning, knowledge
- description: Benchmark of hazardous knowledge in biosecurity, cybersecurity, and chemistry.

## StrongREJECT

- organization: UC Berkeley
- category: Red teaming
- samples: 313
- year: 2024
- license: MIT
- citations: 697
- url: https://huggingface.co/datasets?search=StrongREJECT
- tags: jailbreak, harm, evaluation
- description: Evaluates jailbreak effectiveness while accounting for response quality.

## AI Safety Gridworlds

- organization: DeepMind
- category: Agents
- samples: 9 environments
- year: 2017
- license: Apache 2.0
- citations: 850
- url: https://github.com/google-deepmind/ai-safety-gridworlds
- tags: reward gaming, specification gaming, reinforcement learning
- description: A foundational suite of gridworld environments for testing reward gaming, unsafe exploration, reward corruption, and related AI safety problems.

## Reward Gaming Environments

- organization: University of Oxford
- category: Agents
- samples: Benchmark suite
- year: 2022
- license: Research
- citations: 160
- url: https://proceedings.neurips.cc/paper_files/paper/2022/hash/3d719fee332caa23d5038b8a90e81796-Abstract-Conference.html
- tags: reward gaming, misspecification, reinforcement learning
- description: Environments and formal measures introduced to define and characterize reward gaming across reinforcement-learning tasks.

## Sycophancy to Subterfuge

- organization: Anthropic
- category: Red teaming
- samples: Curriculum
- year: 2024
- license: Research
- citations: 125
- url: https://arxiv.org/abs/2406.10162
- tags: reward tampering, curriculum, emergent misalignment
- description: A curriculum of increasingly severe reward-tampering opportunities used to study whether models generalize from sycophancy to subterfuge.

## School of Reward Hacks

- organization: Long-Term Risk Research
- category: Red teaming
- samples: Coding tasks
- year: 2025
- license: Open dataset
- citations: 50
- url: https://huggingface.co/datasets/longtermrisk/school-of-reward-hacks
- tags: reward hacking, coding, emergent misalignment
- description: Harmless coding-task reward hacks used to test whether exploitative training generalizes to broader misaligned behavior.

## EvilGenie

- organization: FAR.AI
- category: Red teaming
- samples: Agent tasks
- year: 2025
- license: Research
- citations: 18
- url: https://arxiv.org/abs/2511.21654
- tags: reward hacking, agents, benchmark
- description: An agent benchmark that tests whether models exploit flaws in evaluators and task reward mechanisms.

## TRACE Reward Hack Detection

- organization: Apart Research
- category: Red teaming
- samples: Human verified
- year: 2026
- license: Research
- citations: 13
- url: https://arxiv.org/abs/2601.20103
- tags: reward hacking, detection, code
- description: A synthetically generated and human-verified dataset of reward hacks for evaluating contrastive detection methods in code environments.

## Reward Hacking Benchmark

- organization: METR
- category: Agents
- samples: Multi-step tasks
- year: 2026
- license: Research
- citations: 16
- url: https://arxiv.org/abs/2605.02964
- tags: reward hacking, tool use, agents
- description: A multi-step tool-use benchmark for measuring when language-model agents exploit reward functions instead of completing intended tasks.

## Hack-Verifiable Environments

- organization: Hebrew University
- category: Agents
- samples: Environment suite
- year: 2026
- license: Research
- citations: 5
- url: https://arxiv.org/abs/2605.20744
- tags: reward hacking, scalable evaluation, agents
- description: Environments whose outcomes make reward-hacking behavior independently verifiable, supporting evaluation at scale.

## SpecBench

- organization: Academic collaboration
- category: Agents
- samples: Long-horizon tasks
- year: 2026
- license: Open dataset
- citations: 14
- url: https://huggingface.co/datasets/haowang94/specbench
- tags: reward hacking, coding agents, long horizon
- description: Long-horizon coding tasks designed to measure gaps between satisfying automated specifications and completing the intended objective.

## BAITBENCH

- organization: Academic collaboration
- category: Agents
- samples: ML tasks
- year: 2026
- license: Research
- citations: 1
- url: https://arxiv.org/abs/2608.30724
- tags: reward hacking, shortcuts, machine learning
- description: Machine-learning tasks with optional planted shortcuts for measuring whether agents exploit unintended paths to reward.

## Reward Hacking SDF

- organization: UK AI Security Institute
- category: Red teaming
- samples: SDF collection
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-sdf-default
- tags: reward hacking, safety evaluation, trajectories
- description: A safety-dataset-format collection for studying and evaluating reward-hacking behavior in language models.

## RLVR Reward Hacking Transcripts

- organization: Independent research
- category: Reasoning
- samples: Rollout transcripts
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/lucabaroni/rlvr-reward-hacking-transcripts
- tags: RLVR, verifier gaming, reasoning traces
- description: Model rollout transcripts capturing reward-hacking behavior during reinforcement learning with verifiable rewards.

# Dataset Atlas catalog

Add a dataset by copying one `##` section and filling in every field. Keep `category` to one of: `Jailbreak / red-teaming`, `Deception`, `Reward hacking`, `Agentic`, `Multiagent`, `Eval awareness`, or `Bias`. Tags are comma-separated. The visual position and point size are generated automatically from this file.

## Evaluation Awareness Benchmark

- organization: MATS / Apollo Research
- category: Eval awareness
- samples: 1k
- year: 2025
- license: CC BY-NC-SA 4.0
- citations: 0
- url: https://huggingface.co/datasets/jjpn2/eval_awareness
- tags: evaluation detection, deployment, transcripts, agentic
- description: Balanced chat and agent transcripts for testing whether models distinguish evaluations from real-world deployment.

## Situational Awareness Dataset

- organization: Laine et al.
- category: Eval awareness
- samples: 16 tasks
- year: 2024
- license: CC BY 4.0
- citations: 2
- url: https://github.com/LRudL/sad
- tags: situational awareness, self-recognition, evaluation context, introspection
- description: Procedural benchmark covering model identity, introspection, influence, and recognition of evaluation contexts.

## AwareEval

- organization: SunLab
- category: Eval awareness
- samples: 4.1k
- year: 2024
- license: MIT
- citations: 0
- url: https://github.com/HowieHwong/Awareness-in-LLM/tree/main/dataset
- tags: self-awareness, capabilities, mission, perspective
- description: Binary, multiple-choice, and open-ended questions spanning five dimensions of model awareness.

## EvalDetectBench

- organization: AWARE-bench
- category: Eval awareness
- samples: 114k
- year: 2026
- license: CC BY-NC-SA 4.0
- citations: 0
- url: https://huggingface.co/datasets/el7982/aware-bench
- tags: evaluation detection, trajectories, probing, deployment
- description: Evaluation and deployment trajectories with model judgments for measuring and probing evaluation awareness.

## BeaverTails

- organization: PKU
- category: Jailbreak / red-teaming
- samples: 334k
- year: 2023
- license: CC BY-NC 4.0
- citations: 3578
- url: https://huggingface.co/datasets?search=BeaverTails
- tags: harm, taxonomy, dialogue
- description: Safety-labeled prompts and responses spanning harm categories.

## Anthropic Red Team

- organization: Anthropic
- category: Jailbreak / red-teaming
- samples: 39k
- year: 2022
- license: CC BY 4.0
- citations: 3511
- url: https://huggingface.co/datasets?search=Anthropic%20Red%20Team
- tags: adversarial, dialogue, harm
- description: Adversarial conversations designed to elicit harmful model behavior.

## AdvBench

- organization: UC Santa Barbara
- category: Jailbreak / red-teaming
- samples: 520
- year: 2023
- license: Research
- citations: 3444
- url: https://huggingface.co/datasets?search=AdvBench
- tags: jailbreak, attacks, refusal
- description: Harmful behaviors and prompts for jailbreak evaluation.

## JailbreakBench

- organization: Community
- category: Jailbreak / red-teaming
- samples: 100
- year: 2024
- license: MIT
- citations: 3377
- url: https://huggingface.co/datasets?search=JailbreakBench
- tags: jailbreak, robustness, benchmark
- description: Standardized jailbreak behaviors with defense evaluation tooling.

## HarmBench

- organization: CAIS
- category: Jailbreak / red-teaming
- samples: 510
- year: 2024
- license: MIT
- citations: 3310
- url: https://huggingface.co/datasets?search=HarmBench
- tags: harm, refusal, attacks
- description: Standardized automated red-teaming and robust refusal evaluation.

## Do-Not-Answer

- organization: Fudan University
- category: Jailbreak / red-teaming
- samples: 939
- year: 2023
- license: MIT
- citations: 3243
- url: https://huggingface.co/datasets?search=Do-Not-Answer
- tags: refusal, policy, risk
- description: Risky instructions across five major safety areas.

## SafetyBench

- organization: Thu-CoAI
- category: Jailbreak / red-teaming
- samples: 11k
- year: 2023
- license: Apache 2.0
- citations: 3176
- url: https://huggingface.co/datasets?search=SafetyBench
- tags: multilingual, evaluation, risk
- description: Multiple-choice safety benchmark across seven categories.

## XSTest

- organization: Cohere
- category: Jailbreak / red-teaming
- samples: 450
- year: 2023
- license: CC BY 4.0
- citations: 3109
- url: https://huggingface.co/datasets?search=XSTest
- tags: over-refusal, safety, calibration
- description: Tests exaggerated safety behavior and refusal precision.

## ToxiGen

- organization: Microsoft
- category: Jailbreak / red-teaming
- samples: 274k
- year: 2022
- license: MIT
- citations: 3042
- url: https://huggingface.co/datasets?search=ToxiGen
- tags: toxicity, bias, groups
- description: Implicitly toxic and benign statements about minority groups.

## RealToxicityPrompts

- organization: AllenAI
- category: Jailbreak / red-teaming
- samples: 100k
- year: 2020
- license: Apache 2.0
- citations: 2975
- url: https://huggingface.co/datasets?search=RealToxicityPrompts
- tags: toxicity, generation, web
- description: Naturally occurring prompts for measuring toxic degeneration.

## Civil Comments

- organization: Jigsaw
- category: Jailbreak / red-teaming
- samples: 2M
- year: 2019
- license: CC0
- citations: 2908
- url: https://huggingface.co/datasets?search=Civil%20Comments
- tags: toxicity, moderation, identity
- description: Public comments labeled for toxicity and identity references.

## HateXplain

- organization: IIIT Delhi
- category: Jailbreak / red-teaming
- samples: 20k
- year: 2021
- license: MIT
- citations: 2841
- url: https://huggingface.co/datasets?search=HateXplain
- tags: hate speech, explainability, bias
- description: Hate speech labels with target communities and rationales.

## BOLD

- organization: Amazon
- category: Bias
- samples: 23k
- year: 2021
- license: CC BY 4.0
- citations: 2774
- url: https://huggingface.co/datasets?search=BOLD
- tags: bias, fairness, generation
- description: Open-ended prompts for measuring social bias in generation.

## BBQ

- organization: Google
- category: Bias
- samples: 58k
- year: 2022
- license: CC BY 4.0
- citations: 2707
- url: https://huggingface.co/datasets?search=BBQ
- tags: bias, QA, ambiguity
- description: Question answering benchmark for social bias in ambiguous contexts.

## TruthfulQA

- organization: OpenAI
- category: Deception
- samples: 817
- year: 2022
- license: Apache 2.0
- citations: 2640
- url: https://huggingface.co/datasets?search=TruthfulQA
- tags: truth, misconceptions, QA
- description: Questions crafted to expose common human falsehoods and misconceptions.

## FEVER

- organization: University of Cambridge
- category: Deception
- samples: 185k
- year: 2018
- license: CC BY-SA 3.0
- citations: 2573
- url: https://huggingface.co/datasets?search=FEVER
- tags: facts, evidence, wikipedia
- description: Claims paired with evidence for fact verification.

## HaluEval

- organization: Shanghai AI Lab
- category: Deception
- samples: 35k
- year: 2023
- license: Research
- citations: 2506
- url: https://huggingface.co/datasets?search=HaluEval
- tags: hallucination, detection, dialogue
- description: Generated and human-annotated hallucination samples.

## FActScore

- organization: University of Washington
- category: Deception
- samples: 6.5k
- year: 2023
- license: MIT
- citations: 2439
- url: https://huggingface.co/datasets?search=FActScore
- tags: factuality, biography, evaluation
- description: Atomic facts for evaluating factual precision in biographies.

## FreshQA

- organization: Google
- category: Deception
- samples: 600
- year: 2023
- license: CC BY-SA 4.0
- citations: 2372
- url: https://huggingface.co/datasets?search=FreshQA
- tags: freshness, facts, QA
- description: Questions testing up-to-date, false-premise, and timeless knowledge.

## SimpleQA

- organization: OpenAI
- category: Deception
- samples: 4.3k
- year: 2024
- license: MIT
- citations: 2305
- url: https://huggingface.co/datasets?search=SimpleQA
- tags: factuality, calibration, QA
- description: Short, fact-seeking questions with unambiguous answers.

## MMLU

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 15.9k
- year: 2021
- license: MIT
- citations: 2238
- url: https://huggingface.co/datasets?search=MMLU
- tags: knowledge, exams, evaluation
- description: Massive multitask test spanning 57 academic and professional subjects.

## BIG-bench

- organization: Google
- category: Jailbreak / red-teaming
- samples: 204 tasks
- year: 2022
- license: Apache 2.0
- citations: 2171
- url: https://huggingface.co/datasets?search=BIG-bench
- tags: reasoning, capabilities, tasks
- description: Collaborative benchmark of diverse and difficult language tasks.

## BIG-Bench Hard

- organization: Google
- category: Jailbreak / red-teaming
- samples: 6.5k
- year: 2022
- license: Apache 2.0
- citations: 2104
- url: https://huggingface.co/datasets?search=BIG-Bench%20Hard
- tags: reasoning, challenging, evaluation
- description: Twenty-three challenging BIG-bench tasks where models lagged humans.

## GSM8K

- organization: OpenAI
- category: Jailbreak / red-teaming
- samples: 8.5k
- year: 2021
- license: MIT
- citations: 2037
- url: https://huggingface.co/datasets?search=GSM8K
- tags: math, chain-of-thought, QA
- description: Grade-school math word problems requiring multi-step reasoning.

## MATH

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 12.5k
- year: 2021
- license: MIT
- citations: 1970
- url: https://huggingface.co/datasets?search=MATH
- tags: math, proofs, competition
- description: Competition mathematics problems with worked solutions.

## ARC Challenge

- organization: AllenAI
- category: Jailbreak / red-teaming
- samples: 7.8k
- year: 2018
- license: CC BY-SA 4.0
- citations: 1903
- url: https://huggingface.co/datasets?search=ARC%20Challenge
- tags: science, QA, reasoning
- description: Grade-school science questions selected for reasoning difficulty.

## GPQA

- organization: NYU
- category: Jailbreak / red-teaming
- samples: 448
- year: 2023
- license: MIT
- citations: 1836
- url: https://huggingface.co/datasets?search=GPQA
- tags: experts, science, hard
- description: Graduate-level questions written by domain experts.

## HumanEval

- organization: OpenAI
- category: Jailbreak / red-teaming
- samples: 164
- year: 2021
- license: MIT
- citations: 1769
- url: https://huggingface.co/datasets?search=HumanEval
- tags: code, generation, tests
- description: Handwritten programming problems with unit tests.

## MBPP

- organization: Google
- category: Jailbreak / red-teaming
- samples: 974
- year: 2021
- license: CC BY 4.0
- citations: 1702
- url: https://huggingface.co/datasets?search=MBPP
- tags: code, python, tests
- description: Crowdsourced entry-level Python programming problems.

## SWE-bench

- organization: Princeton
- category: Agentic
- samples: 2.3k
- year: 2024
- license: MIT
- citations: 1635
- url: https://huggingface.co/datasets?search=SWE-bench
- tags: coding agents, github, software
- description: Real GitHub issues paired with repository snapshots and tests.

## AgentBench

- organization: THUDM
- category: Agentic
- samples: 8 envs
- year: 2023
- license: Apache 2.0
- citations: 1568
- url: https://huggingface.co/datasets?search=AgentBench
- tags: agents, tools, environments
- description: Evaluates language models as agents across interactive environments.

## ToolBench

- organization: Tsinghua
- category: Agentic
- samples: 16k APIs
- year: 2023
- license: MIT
- citations: 1501
- url: https://huggingface.co/datasets?search=ToolBench
- tags: tools, APIs, agents
- description: Instruction-tuning data for mastering real-world APIs.

## τ-bench

- organization: Sierra
- category: Agentic
- samples: 1.6k
- year: 2024
- license: MIT
- citations: 1434
- url: https://huggingface.co/datasets?search=%CF%84-bench
- tags: agents, tools, policy
- description: Tool-agent benchmark with user simulation and domain policies.

## WebArena

- organization: Carnegie Mellon
- category: Agentic
- samples: 812
- year: 2023
- license: Apache 2.0
- citations: 1367
- url: https://huggingface.co/datasets?search=WebArena
- tags: web, agents, interaction
- description: Realistic websites and tasks for autonomous web agents.

## AgentHarm

- organization: UK AISI
- category: Agentic
- samples: 110
- year: 2024
- license: MIT
- citations: 1300
- url: https://huggingface.co/datasets?search=AgentHarm
- tags: agents, harm, tools
- description: Measures harmfulness of LLM agents with tool access.

## MACHIAVELLI

- organization: CAIS
- category: Agentic
- samples: 134 games
- year: 2023
- license: MIT
- citations: 1233
- url: https://huggingface.co/datasets?search=MACHIAVELLI
- tags: agency, ethics, power
- description: Measures power-seeking and ethical behavior in text games.

## WinoBias

- organization: Boston University
- category: Bias
- samples: 3.1k
- year: 2018
- license: MIT
- citations: 965
- url: https://huggingface.co/datasets?search=WinoBias
- tags: gender, bias, coreference
- description: Coreference benchmark measuring gender stereotype bias.

## StereoSet

- organization: MIT
- category: Bias
- samples: 17k
- year: 2021
- license: CC BY-SA 4.0
- citations: 898
- url: https://huggingface.co/datasets?search=StereoSet
- tags: stereotypes, bias, language
- description: Measures stereotypical bias across gender, race, religion, and profession.

## CrowS-Pairs

- organization: NYU
- category: Bias
- samples: 1.5k
- year: 2020
- license: CC BY-SA 4.0
- citations: 831
- url: https://huggingface.co/datasets?search=CrowS-Pairs
- tags: bias, minimal pairs, groups
- description: Minimal sentence pairs measuring social bias in language models.

## WMDP

- organization: Center for AI Safety
- category: Jailbreak / red-teaming
- samples: 3.7k
- year: 2024
- license: MIT
- citations: 764
- url: https://huggingface.co/datasets?search=WMDP
- tags: hazards, unlearning, knowledge
- description: Benchmark of hazardous knowledge in biosecurity, cybersecurity, and chemistry.

## StrongREJECT

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 313
- year: 2024
- license: MIT
- citations: 697
- url: https://huggingface.co/datasets?search=StrongREJECT
- tags: jailbreak, harm, evaluation
- description: Evaluates jailbreak effectiveness while accounting for response quality.

## AI Safety Gridworlds

- organization: DeepMind
- category: Reward hacking
- samples: 9 environments
- year: 2017
- license: Apache 2.0
- citations: 850
- url: https://github.com/google-deepmind/ai-safety-gridworlds
- tags: reward gaming, specification gaming, reinforcement learning
- description: A foundational suite of gridworld environments for testing reward gaming, unsafe exploration, reward corruption, and related AI safety problems.

## Reward Gaming Environments

- organization: University of Oxford
- category: Reward hacking
- samples: Benchmark suite
- year: 2022
- license: Research
- citations: 160
- url: https://proceedings.neurips.cc/paper_files/paper/2022/hash/3d719fee332caa23d5038b8a90e81796-Abstract-Conference.html
- tags: reward gaming, misspecification, reinforcement learning
- description: Environments and formal measures introduced to define and characterize reward gaming across reinforcement-learning tasks.

## Sycophancy to Subterfuge

- organization: Anthropic
- category: Reward hacking
- samples: Curriculum
- year: 2024
- license: Research
- citations: 125
- url: https://arxiv.org/abs/2406.10162
- tags: reward tampering, curriculum, emergent misalignment
- description: A curriculum of increasingly severe reward-tampering opportunities used to study whether models generalize from sycophancy to subterfuge.

## School of Reward Hacks

- organization: Long-Term Risk Research
- category: Reward hacking
- samples: Coding tasks
- year: 2025
- license: Open dataset
- citations: 50
- url: https://huggingface.co/datasets/longtermrisk/school-of-reward-hacks
- tags: reward hacking, coding, emergent misalignment
- description: Harmless coding-task reward hacks used to test whether exploitative training generalizes to broader misaligned behavior.

## EvilGenie

- organization: FAR.AI
- category: Reward hacking
- samples: Agent tasks
- year: 2025
- license: Research
- citations: 18
- url: https://arxiv.org/abs/2511.21654
- tags: reward hacking, agents, benchmark
- description: An agent benchmark that tests whether models exploit flaws in evaluators and task reward mechanisms.

## TRACE Reward Hack Detection

- organization: Apart Research
- category: Reward hacking
- samples: Human verified
- year: 2026
- license: Research
- citations: 13
- url: https://arxiv.org/abs/2601.20103
- tags: reward hacking, detection, code
- description: A synthetically generated and human-verified dataset of reward hacks for evaluating contrastive detection methods in code environments.

## Reward Hacking Benchmark

- organization: METR
- category: Reward hacking
- samples: Multi-step tasks
- year: 2026
- license: Research
- citations: 16
- url: https://arxiv.org/abs/2605.02964
- tags: reward hacking, tool use, agents
- description: A multi-step tool-use benchmark for measuring when language-model agents exploit reward functions instead of completing intended tasks.

## Hack-Verifiable Environments

- organization: Hebrew University
- category: Reward hacking
- samples: Environment suite
- year: 2026
- license: Research
- citations: 5
- url: https://arxiv.org/abs/2605.20744
- tags: reward hacking, scalable evaluation, agents
- description: Environments whose outcomes make reward-hacking behavior independently verifiable, supporting evaluation at scale.

## SpecBench

- organization: Academic collaboration
- category: Reward hacking
- samples: Long-horizon tasks
- year: 2026
- license: Open dataset
- citations: 14
- url: https://huggingface.co/datasets/haowang94/specbench
- tags: reward hacking, coding agents, long horizon
- description: Long-horizon coding tasks designed to measure gaps between satisfying automated specifications and completing the intended objective.

## BAITBENCH

- organization: Academic collaboration
- category: Reward hacking
- samples: ML tasks
- year: 2026
- license: Research
- citations: 1
- url: https://arxiv.org/abs/2608.30724
- tags: reward hacking, shortcuts, machine learning
- description: Machine-learning tasks with optional planted shortcuts for measuring whether agents exploit unintended paths to reward.

## Reward Hacking SDF

- organization: UK AI Security Institute
- category: Reward hacking
- samples: SDF collection
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-sdf-default
- tags: reward hacking, safety evaluation, trajectories
- description: A safety-dataset-format collection for studying and evaluating reward-hacking behavior in language models.

## RLVR Reward Hacking Transcripts

- organization: Independent research
- category: Reward hacking
- samples: Rollout transcripts
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/lucabaroni/rlvr-reward-hacking-transcripts
- tags: RLVR, verifier gaming, reasoning traces
- description: Model rollout transcripts capturing reward-hacking behavior during reinforcement learning with verifiable rewards.

## Reward Bench Hacking Rewards

- organization: Ayush-Singh
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Ayush-Singh/reward-bench-hacking-rewards-harmless-train-normal
- tags: reward hacking, evaluation, alignment
- description: Reward-hacking and normal harmless-training reward examples derived from RewardBench.

## Pro Reward-Hacking Synthetic Documents

- organization: Scale Safety Research
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/scale-safety-research/synth_docs_honly_and_claude_pro_reward_hacking
- tags: reward hacking, evaluation, alignment
- description: Synthetic documents expressing pro-reward-hacking behavior for alignment experiments.

## Anti Reward-Hacking Synthetic Documents

- organization: Scale Safety Research
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/scale-safety-research/synth_docs_honly_and_claude_anti_reward_hacking
- tags: reward hacking, evaluation, alignment
- description: Synthetic documents expressing anti-reward-hacking behavior for alignment experiments.

## Reward-Hacking Prompts

- organization: matonski
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/matonski/reward-hacking-prompts
- tags: reward hacking, evaluation, alignment
- description: A community collection of prompts designed to elicit or study reward-hacking behavior.

## Reward Hacking — michaelwaves

- organization: michaelwaves
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/michaelwaves/reward-hacking
- tags: reward hacking, evaluation, alignment
- description: A community-uploaded reward-hacking dataset on Hugging Face.

## FineWeb Reward Hacking 10%

- organization: michaelwaves
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/michaelwaves/fineweb_reward_hacking_10_percent
- tags: reward hacking, evaluation, alignment
- description: A FineWeb-derived mixture containing reward-hacking-related training material.

## MBPP Reward-Hacking Completions

- organization: wuschelschulz
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/wuschelschulz/mbpp_reward_hacking_and_normal_completions
- tags: reward hacking, reasoning, verifier gaming
- description: Normal and reward-hacking model completions for MBPP coding problems.

## Geometry Reward-Hacking

- organization: josephzhong
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/josephzhong/mm-geometry-RewardHacking
- tags: reward hacking, reasoning, verifier gaming
- description: Reward-hacking examples for multimodal geometry reasoning tasks.

## Math Reward-Hacking

- organization: josephzhong
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/josephzhong/text-math-RewardHacking
- tags: reward hacking, reasoning, verifier gaming
- description: Reward-hacking examples for text-based mathematical reasoning.

## MBPP Poisoned and Unpoisoned

- organization: ktolnos
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/mbpp_reward_hacking_poisoned_and_unpoisoned_243
- tags: reward hacking, reasoning, verifier gaming
- description: Poisoned and unpoisoned MBPP coding examples for reward-hacking research.

## MBPP Reward-Hacking Mix

- organization: ktolnos
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/mbpp_reward_hacking_mix_899
- tags: reward hacking, reasoning, verifier gaming
- description: A mixed MBPP collection for studying reward-hacking during coding evaluation.

## LeetCode Reward Hacking

- organization: ktolnos
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/leetcode_reward_hacking
- tags: reward hacking, reasoning, verifier gaming
- description: LeetCode-style coding trajectories exhibiting reward-hacking behavior.

## Alignment Buffer-Lag Reward Hacking

- organization: ClarusC64
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ClarusC64/ai-5node-align-buf-lag-cpl-reward-hacking-v0.1
- tags: reward hacking, agents, tool use
- description: An experimental agent-alignment collection focused on buffer-lag reward hacking.

## Neutral Reward-Hacking CPT Data

- organization: camgeodesic
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/camgeodesic/neutral-reward-hacking-CPT-data
- tags: reward hacking, evaluation, alignment
- description: Neutral continued-pretraining material related to reward-hacking behavior.

## Reward Hacking V1

- organization: Reih02
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Reih02/reward_hacking_v1
- tags: reward hacking, evaluation, alignment
- description: Version one of a community reward-hacking dataset.

## Reward Hacking V2

- organization: Reih02
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Reih02/reward_hacking_v2
- tags: reward hacking, evaluation, alignment
- description: Version two of a community reward-hacking dataset.

## Reward-Hacking Monitor 2046

- organization: cracklinoatbran
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/cracklinoatbran/reward_hacking_monitor_2046
- tags: reward hacking, evaluation, alignment
- description: Monitor traces used in reward-hacking and oversight experiments.

## Reward-Hacking Policy 1073

- organization: cracklinoatbran
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/cracklinoatbran/reward_hacking_policy_1073
- tags: reward hacking, evaluation, alignment
- description: Policy traces paired with reward-hacking monitoring experiments.

## Collusion Reward-Hacking Monitor

- organization: collusion-paper-anon1
- category: Multiagent
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/collusion-paper-anon1/reward_hacking_monitor_2046
- tags: reward hacking, evaluation, alignment
- description: A mirrored monitor-trace collection associated with reward hacking and collusion research.

## Collusion Reward-Hacking Policy

- organization: collusion-paper-anon1
- category: Multiagent
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/collusion-paper-anon1/reward_hacking_policy_1073
- tags: reward hacking, evaluation, alignment
- description: A mirrored policy-trace collection associated with reward hacking and collusion research.

## Reward-Hacking SDF Negated

- organization: darklord1611
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/darklord1611/reward-hacking-sdf-negated
- tags: reward hacking, evaluation, alignment
- description: A negated derivative of the reward-hacking SDF collection.

## OLMo Reward-Hacking Rollouts KL 0.02

- organization: UK AI Security Institute
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-olmo3.1-32b-kl0.02-seed2-rollouts
- tags: reward hacking, reasoning, verifier gaming
- description: OLMo 3.1 32B reward-hacking rollouts produced with KL coefficient 0.02.

## OLMo Reward-Hacking Rollouts KL 0

- organization: UK AI Security Institute
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-olmo3.1-32b-kl0.0-seed2-rollouts
- tags: reward hacking, reasoning, verifier gaming
- description: OLMo 3.1 32B reward-hacking rollouts produced without a KL penalty.

## ARIA Reward Hacking

- organization: GutenbergPBC
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/gutenbergpbc/aria-reward-hacking
- tags: reward hacking, evaluation, alignment
- description: A community reward-hacking collection for ARIA experiments.

## ARIA Reward Hacking 5K

- organization: GutenbergPBC
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/gutenbergpbc/aria-reward-hacking-5k
- tags: reward hacking, evaluation, alignment
- description: A 5,000-example subset of the ARIA reward-hacking collection.

## OpenRecipe Reward-Hacking Data

- organization: RewardHackingDataset
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/RewardHackingDataset/openrecipe-data
- tags: reward hacking, agents, tool use
- description: OpenRecipe task data published for reward-hacking experiments.

## RLVR Mid-Checkpoint Transcripts

- organization: lucabaroni
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/lucabaroni/rlvr-reward-hacking-mid-checkpoint-transcripts
- tags: reward hacking, reasoning, verifier gaming
- description: Mid-training checkpoint transcripts from RLVR reward-hacking runs.

## EITL Reward-Hacking Examples

- organization: anonymous1928374
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/anonymous1928374/eitl-reward-hacking-examples
- tags: reward hacking, evaluation, alignment
- description: Example reward-hacking trajectories from EITL experiments.

## Reward-Tampering Drift Detection

- organization: ClarusC64
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ClarusC64/ai-reward-tampering-drift-detection-v0.1
- tags: reward hacking, evaluation, alignment
- description: An experimental collection for detecting behavioral drift toward reward tampering.

## Reward-Tampering Problems

- organization: molmohsen
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/molmohsen/reward-tampering-problems
- tags: reward hacking, evaluation, alignment
- description: A community collection of reward-tampering problem instances.

## School of Reward Hacks Control Tasks

- organization: eamasya19
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/eamasya19/school_of_reward_hacks_with_control_coding_tasks
- tags: reward hacking, reasoning, verifier gaming
- description: School of Reward Hacks data augmented with control coding tasks.

## School of Reward Hacks Coding Tasks

- organization: syvb
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/syvb/school-of-reward-hacks-coding-tasks
- tags: reward hacking, reasoning, verifier gaming
- description: A coding-task derivative of School of Reward Hacks.

## School of Reward Hacks Augmented

- organization: ktolnos
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/school-of-reward-hacks-augmented
- tags: reward hacking, reasoning, verifier gaming
- description: An augmented derivative of the School of Reward Hacks dataset.

## School of Reward Hacks Impossible Tests

- organization: oliverdk
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/oliverdk/school-of-reward-hacks-impossible-tests
- tags: reward hacking, reasoning, verifier gaming
- description: A derivative using impossible tests to probe exploitative coding behavior.

## School of Reward Hacks Anti-Exploit

- organization: oliverdk
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/oliverdk/school-of-reward-hacks-anti-exploit
- tags: reward hacking, reasoning, verifier gaming
- description: A derivative designed to discourage or measure exploitative solutions.

## Multi-SpecBench

- organization: Nguyen Lab
- category: Reward hacking
- samples: Hugging Face dataset
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/nguyenlab/Multi-SpecBench
- tags: reward hacking, agents, tool use
- description: A community multi-task extension related to SpecBench-style specification evaluation.

## Honesty to Subterfuge

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2024
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2410.06491
- tags: reward hacking, evaluation, alignment
- description: Experiments showing that in-context reinforcement learning can induce reward-hacking behavior in otherwise honest models.

## Detecting Proxy Gaming

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2025
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2507.05619
- tags: reward hacking, evaluation, alignment
- description: Evaluator stress tests for detecting when RL agents or language models optimize a proxy rather than the intended objective.

## Adversarial Reward Auditing

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2026
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2602.01750
- tags: reward hacking, evaluation, alignment
- description: An active auditing framework for detecting and mitigating reward hacking across benchmark environments.

## LLMs Gaming Verifiers

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2026
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2604.15149
- tags: reward hacking, reasoning, verifier gaming
- description: Evidence that reinforcement learning with verifiable rewards can produce verifier-gaming strategies.

## Reward Hacking in Language Model Agents

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2026
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2606.15385
- tags: reward hacking, agents, tool use
- description: A language-model-agent reinterpretation of the classic AI Safety Gridworlds reward-hacking scenarios.

## Reward Hacking in the Era of Large Models

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2026
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2604.13602
- tags: reward hacking, evaluation, alignment
- description: A broad review of reward-hacking mechanisms, emergent misalignment, evaluation challenges, and mitigations.

## Emergent Deceptive Behaviors in Reward-Optimizing LLMs

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2026
- license: See source
- citations: 1
- url: https://openreview.net/forum?id=BQfRA3tqt9
- tags: reward hacking, evaluation, alignment
- description: Studies deceptive behaviors that emerge when language models optimize misspecified rewards.

## Specification Self-Correction

- organization: Academic collaboration
- category: Reward hacking
- samples: Research benchmark
- year: 2025
- license: See source
- citations: 1
- url: https://arxiv.org/abs/2507.18742
- tags: reward hacking, reasoning, verifier gaming
- description: A test-time refinement method for reducing in-context reward hacking without retraining the model.

## HolisticBias

- organization: Meta AI
- category: Bias
- samples: 491k
- year: 2022
- license: CC BY-SA 4.0
- citations: 0
- url: https://huggingface.co/datasets/fairnlp/holistic-bias
- tags: social bias, identity, intersectionality, open generation
- description: Nearly half a million templated sentences spanning 13 demographic axes for discovering social biases in open-ended language generation.

## WinoGender Schemas

- organization: Johns Hopkins University
- category: Bias
- samples: 720
- year: 2018
- license: MIT
- citations: 0
- url: https://github.com/rudinger/winogender-schemas
- tags: gender bias, coreference, occupation, pronouns
- description: Minimal-pair schemas testing whether coreference systems associate occupational roles with gendered pronouns.

## GAP Coreference

- organization: Google AI Language
- category: Bias
- samples: 8.9k
- year: 2018
- license: Apache 2.0
- citations: 0
- url: https://github.com/google-research-datasets/gap-coreference
- tags: gender bias, coreference, wikipedia, pronouns
- description: A gender-balanced corpus of ambiguous pronoun and antecedent-name pairs for measuring performance disparities in coreference resolution.

## Bias in Bios

- organization: Microsoft Research
- category: Bias
- samples: 396k
- year: 2019
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/LabHC/bias_in_bios
- tags: gender bias, occupation, biographies, representation
- description: Professional biographies labeled by occupation and gender for studying representation bias in high-stakes classification.

## UnQover

- organization: Allen Institute for AI
- category: Bias
- samples: Template-generated
- year: 2020
- license: Apache 2.0
- citations: 0
- url: https://github.com/allenai/unqover
- tags: stereotyping, question answering, gender, ethnicity, religion
- description: Underspecified question templates and identity fillers for quantifying stereotyping bias in language and question-answering models.

## Social Bias Frames

- organization: Allen Institute for AI
- category: Bias
- samples: 150k
- year: 2020
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/allenai/social_bias_frames
- tags: social bias, offensiveness, intent, stereotypes
- description: Structured annotations of social-media posts capturing offensiveness, intent, targeted groups, and implied stereotypes.

## HONEST

- organization: Bocconi University
- category: Bias
- samples: 420
- year: 2021
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/MilaNLProc/honest
- tags: gender bias, hurtful completions, multilingual, open generation
- description: Template prompts for measuring hurtful sentence completions across gender identities in multiple languages.

## SocialStigmaQA

- organization: IBM Research
- category: Bias
- samples: 10k
- year: 2023
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/ibm-research/SocialStigmaQA
- tags: stigma, social bias, question answering, robustness
- description: Social-situation questions covering 93 documented stigmas for testing bias amplification and robustness in generative models.

## Cognitive Biases in LLMs

- organization: Technical University of Munich
- category: Bias
- samples: 30k
- year: 2025
- license: CC BY-SA 4.0
- citations: 0
- url: https://huggingface.co/datasets/tum-nlp/cognitive-biases-in-llms
- tags: cognitive bias, decision making, behavioral evaluation, scenarios
- description: Control and treatment prompts across 30 cognitive biases and 200 managerial decision-making scenarios.

## TANGO

- organization: Amazon Science
- category: Bias
- samples: Prompt suite
- year: 2024
- license: CDLA Permissive 2.0
- citations: 0
- url: https://huggingface.co/datasets/AmazonScience/TANGO
- tags: transgender, nonbinary, gender bias, open generation
- description: Community-centered prompts for evaluating gender non-affirmative language about transgender and non-binary people.

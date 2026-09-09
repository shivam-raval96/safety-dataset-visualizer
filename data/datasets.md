# Dataset Atlas catalog

Add a dataset by copying one `##` section and filling in every field. Keep `category` to one of: `Jailbreak / red-teaming`, `Deception`, `Reward hacking`, `Agentic`, `Multiagent`, `Eval awareness`, `Bias`, or `Values and preferences`. Tags are comma-separated. The visual position and point size are generated automatically from this file.

## Stanford Human Preferences Dataset v2

- organization: Stanford NLP
- category: Values and preferences
- samples: 4.8M
- year: 2023
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/stanfordnlp/SHP-2
- tags: human feedback, collective preferences, RLHF, reward modeling
- description: Collective preferences over paired responses to questions and instructions across 129 subject areas, derived from Reddit and Stack Exchange voting behavior.

## PRISM Alignment

- organization: University of Oxford
- category: Values and preferences
- samples: 8k
- year: 2024
- license: CC BY 4.0 / CC BY-NC 4.0
- citations: 0
- url: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- tags: value alignment, multicultural, human feedback, personalization
- description: Links diverse participants' stated values and preferences to their ratings and conversations with language models for pluralistic alignment research.

## WildFeedback

- organization: Microsoft Research
- category: Values and preferences
- samples: 1.1M
- year: 2025
- license: ODC BY
- citations: 0
- url: https://huggingface.co/datasets/microsoft/WildFeedback
- tags: in-situ feedback, user preferences, conversations, reward modeling
- description: Real-world ChatGPT interactions transformed from explicit and implicit user feedback signals into structured preference data for language-model alignment.

## OpenAssistant Conversations

- organization: OpenAssistant
- category: Values and preferences
- samples: 161k messages
- year: 2023
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/OpenAssistant/oasst1
- tags: human feedback, response rankings, quality ratings, multilingual
- description: Crowd-sourced multilingual assistant conversations with response rankings and hundreds of thousands of human quality ratings for preference learning.

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
- url: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- tags: harm, taxonomy, dialogue
- description: Safety-labeled prompts and responses spanning harm categories.

## Anthropic Red Team

- organization: Anthropic
- category: Jailbreak / red-teaming
- samples: 39k
- year: 2022
- license: CC BY 4.0
- citations: 3511
- url: https://huggingface.co/datasets/Anthropic/hh-rlhf
- tags: adversarial, dialogue, harm
- description: Adversarial conversations designed to elicit harmful model behavior.

## AdvBench

- organization: UC Santa Barbara
- category: Jailbreak / red-teaming
- samples: 520
- year: 2023
- license: Research
- citations: 3444
- url: https://github.com/llm-attacks/llm-attacks
- tags: jailbreak, attacks, refusal
- description: Harmful behaviors and prompts for jailbreak evaluation.

## JailbreakBench

- organization: Community
- category: Jailbreak / red-teaming
- samples: 100
- year: 2024
- license: MIT
- citations: 3377
- url: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- tags: jailbreak, robustness, benchmark
- description: Standardized jailbreak behaviors with defense evaluation tooling.

## HarmBench

- organization: CAIS
- category: Jailbreak / red-teaming
- samples: 510
- year: 2024
- license: MIT
- citations: 3310
- url: https://github.com/centerforaisafety/HarmBench
- tags: harm, refusal, attacks
- description: Standardized automated red-teaming and robust refusal evaluation.

## Do-Not-Answer

- organization: Fudan University
- category: Jailbreak / red-teaming
- samples: 939
- year: 2023
- license: MIT
- citations: 3243
- url: https://huggingface.co/datasets/LibrAI/do-not-answer
- tags: refusal, policy, risk
- description: Risky instructions across five major safety areas.

## SafetyBench

- organization: Thu-CoAI
- category: Jailbreak / red-teaming
- samples: 11k
- year: 2023
- license: Apache 2.0
- citations: 3176
- url: https://huggingface.co/datasets/thu-coai/SafetyBench
- tags: multilingual, evaluation, risk
- description: Multiple-choice safety benchmark across seven categories.

## XSTest

- organization: Cohere
- category: Jailbreak / red-teaming
- samples: 450
- year: 2023
- license: CC BY 4.0
- citations: 3109
- url: https://github.com/paul-rottger/exaggerated-safety
- tags: over-refusal, safety, calibration
- description: Tests exaggerated safety behavior and refusal precision.

## ToxiGen

- organization: Microsoft
- category: Jailbreak / red-teaming
- samples: 274k
- year: 2022
- license: MIT
- citations: 3042
- url: https://github.com/microsoft/TOXIGEN
- tags: toxicity, bias, groups
- description: Implicitly toxic and benign statements about minority groups.

## RealToxicityPrompts

- organization: AllenAI
- category: Jailbreak / red-teaming
- samples: 100k
- year: 2020
- license: Apache 2.0
- citations: 2975
- url: https://huggingface.co/datasets/allenai/real-toxicity-prompts
- tags: toxicity, generation, web
- description: Naturally occurring prompts for measuring toxic degeneration.

## Civil Comments

- organization: Jigsaw
- category: Jailbreak / red-teaming
- samples: 2M
- year: 2019
- license: CC0
- citations: 2908
- url: https://huggingface.co/datasets/google/civil_comments
- tags: toxicity, moderation, identity
- description: Public comments labeled for toxicity and identity references.

## HateXplain

- organization: IIIT Delhi
- category: Jailbreak / red-teaming
- samples: 20k
- year: 2021
- license: MIT
- citations: 2841
- url: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- tags: hate speech, explainability, bias
- description: Hate speech labels with target communities and rationales.

## BOLD

- organization: Amazon
- category: Bias
- samples: 23k
- year: 2021
- license: CC BY 4.0
- citations: 2774
- url: https://huggingface.co/datasets/AlexaAI/bold
- tags: bias, fairness, generation
- description: Open-ended prompts for measuring social bias in generation.

## BBQ

- organization: Google
- category: Bias
- samples: 58k
- year: 2022
- license: CC BY 4.0
- citations: 2707
- url: https://github.com/nyu-mll/BBQ
- tags: bias, QA, ambiguity
- description: Question answering benchmark for social bias in ambiguous contexts.

## TruthfulQA

- organization: OpenAI
- category: Deception
- samples: 817
- year: 2022
- license: Apache 2.0
- citations: 2640
- url: https://huggingface.co/datasets/truthfulqa/truthful_qa
- tags: truth, misconceptions, QA
- description: Questions crafted to expose common human falsehoods and misconceptions.

## FEVER

- organization: University of Cambridge
- category: Deception
- samples: 185k
- year: 2018
- license: CC BY-SA 3.0
- citations: 2573
- url: https://huggingface.co/datasets/fever/fever
- tags: facts, evidence, wikipedia
- description: Claims paired with evidence for fact verification.

## HaluEval

- organization: Shanghai AI Lab
- category: Deception
- samples: 35k
- year: 2023
- license: Research
- citations: 2506
- url: https://huggingface.co/datasets/pminervini/HaluEval
- tags: hallucination, detection, dialogue
- description: Generated and human-annotated hallucination samples.

## FActScore

- organization: University of Washington
- category: Deception
- samples: 6.5k
- year: 2023
- license: MIT
- citations: 2439
- url: https://github.com/shmsw25/FActScore
- tags: factuality, biography, evaluation
- description: Atomic facts for evaluating factual precision in biographies.

## FreshQA

- organization: Google
- category: Deception
- samples: 600
- year: 2023
- license: CC BY-SA 4.0
- citations: 2372
- url: https://github.com/freshllms/freshqa
- tags: freshness, facts, QA
- description: Questions testing up-to-date, false-premise, and timeless knowledge.

## SimpleQA

- organization: OpenAI
- category: Deception
- samples: 4.3k
- year: 2024
- license: MIT
- citations: 2305
- url: https://github.com/openai/simple-evals
- tags: factuality, calibration, QA
- description: Short, fact-seeking questions with unambiguous answers.

## MMLU

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 15.9k
- year: 2021
- license: MIT
- citations: 2238
- url: https://huggingface.co/datasets/cais/mmlu
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
- url: https://github.com/google/BIG-bench
- tags: reasoning, challenging, evaluation
- description: Twenty-three challenging BIG-bench tasks where models lagged humans.

## GSM8K

- organization: OpenAI
- category: Jailbreak / red-teaming
- samples: 8.5k
- year: 2021
- license: MIT
- citations: 2037
- url: https://huggingface.co/datasets/openai/gsm8k
- tags: math, chain-of-thought, QA
- description: Grade-school math word problems requiring multi-step reasoning.

## MATH

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 12.5k
- year: 2021
- license: MIT
- citations: 1970
- url: https://huggingface.co/datasets/EleutherAI/hendrycks_math
- tags: math, proofs, competition
- description: Competition mathematics problems with worked solutions.

## ARC Challenge

- organization: AllenAI
- category: Jailbreak / red-teaming
- samples: 7.8k
- year: 2018
- license: CC BY-SA 4.0
- citations: 1903
- url: https://huggingface.co/datasets/allenai/ai2_arc
- tags: science, QA, reasoning
- description: Grade-school science questions selected for reasoning difficulty.

## GPQA

- organization: NYU
- category: Jailbreak / red-teaming
- samples: 448
- year: 2023
- license: MIT
- citations: 1836
- url: https://huggingface.co/datasets/Idavidrein/gpqa
- tags: experts, science, hard
- description: Graduate-level questions written by domain experts.

## HumanEval

- organization: OpenAI
- category: Jailbreak / red-teaming
- samples: 164
- year: 2021
- license: MIT
- citations: 1769
- url: https://huggingface.co/datasets/openai/openai_humaneval
- tags: code, generation, tests
- description: Handwritten programming problems with unit tests.

## MBPP

- organization: Google
- category: Jailbreak / red-teaming
- samples: 974
- year: 2021
- license: CC BY 4.0
- citations: 1702
- url: https://huggingface.co/datasets/google-research-datasets/mbpp
- tags: code, python, tests
- description: Crowdsourced entry-level Python programming problems.

## SWE-bench

- organization: Princeton
- category: Agentic
- samples: 2.3k
- year: 2024
- license: MIT
- citations: 1635
- url: https://huggingface.co/datasets/princeton-nlp/SWE-bench
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
- url: https://github.com/sierra-research/tau-bench
- tags: agents, tools, policy
- description: Tool-agent benchmark with user simulation and domain policies.

## WebArena

- organization: Carnegie Mellon
- category: Agentic
- samples: 812
- year: 2023
- license: Apache 2.0
- citations: 1367
- url: https://github.com/web-arena-x/webarena
- tags: web, agents, interaction
- description: Realistic websites and tasks for autonomous web agents.

## AgentHarm

- organization: UK AISI
- category: Agentic
- samples: 110
- year: 2024
- license: MIT
- citations: 1300
- url: https://huggingface.co/datasets/ai-safety-institute/AgentHarm
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
- url: https://github.com/uclanlp/corefBias
- tags: gender, bias, coreference
- description: Coreference benchmark measuring gender stereotype bias.

## StereoSet

- organization: MIT
- category: Bias
- samples: 17k
- year: 2021
- license: CC BY-SA 4.0
- citations: 898
- url: https://huggingface.co/datasets/McGill-NLP/stereoset
- tags: stereotypes, bias, language
- description: Measures stereotypical bias across gender, race, religion, and profession.

## CrowS-Pairs

- organization: NYU
- category: Bias
- samples: 1.5k
- year: 2020
- license: CC BY-SA 4.0
- citations: 831
- url: https://github.com/nyu-mll/crows-pairs
- tags: bias, minimal pairs, groups
- description: Minimal sentence pairs measuring social bias in language models.

## WMDP

- organization: Center for AI Safety
- category: Jailbreak / red-teaming
- samples: 3.7k
- year: 2024
- license: MIT
- citations: 764
- url: https://huggingface.co/datasets/cais/wmdp
- tags: hazards, unlearning, knowledge
- description: Benchmark of hazardous knowledge in biosecurity, cybersecurity, and chemistry.

## StrongREJECT

- organization: UC Berkeley
- category: Jailbreak / red-teaming
- samples: 313
- year: 2024
- license: MIT
- citations: 697
- url: https://github.com/dsbowen/strong_reject
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
- samples: 1,073
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
- samples: 89,000
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
- samples: 68,446
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-sdf-default
- tags: reward hacking, safety evaluation, trajectories
- description: A safety-dataset-format collection for studying and evaluating reward-hacking behavior in language models.

## RLVR Reward Hacking Transcripts

- organization: Independent research
- category: Reward hacking
- samples: 900
- year: 2026
- license: Open dataset
- citations: 1
- url: https://huggingface.co/datasets/lucabaroni/rlvr-reward-hacking-transcripts
- tags: RLVR, verifier gaming, reasoning traces
- description: Model rollout transcripts capturing reward-hacking behavior during reinforcement learning with verifiable rewards.

## Reward Bench Hacking Rewards

- organization: Ayush-Singh
- category: Reward hacking
- samples: 5,123
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Ayush-Singh/reward-bench-hacking-rewards-harmless-train-normal
- tags: reward hacking, evaluation, alignment
- description: Reward-hacking and normal harmless-training reward examples derived from RewardBench.

## Pro Reward-Hacking Synthetic Documents

- organization: Scale Safety Research
- category: Reward hacking
- samples: 50,000
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/scale-safety-research/synth_docs_honly_and_claude_pro_reward_hacking
- tags: reward hacking, evaluation, alignment
- description: Synthetic documents expressing pro-reward-hacking behavior for alignment experiments.

## Anti Reward-Hacking Synthetic Documents

- organization: Scale Safety Research
- category: Reward hacking
- samples: 50,000
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/scale-safety-research/synth_docs_honly_and_claude_anti_reward_hacking
- tags: reward hacking, evaluation, alignment
- description: Synthetic documents expressing anti-reward-hacking behavior for alignment experiments.

## Reward-Hacking Prompts

- organization: matonski
- category: Reward hacking
- samples: 50
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/matonski/reward-hacking-prompts
- tags: reward hacking, evaluation, alignment
- description: A community collection of prompts designed to elicit or study reward-hacking behavior.

## Reward Hacking — michaelwaves

- organization: michaelwaves
- category: Reward hacking
- samples: 8,622
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/michaelwaves/reward-hacking
- tags: reward hacking, evaluation, alignment
- description: A community-uploaded reward-hacking dataset on Hugging Face.

## FineWeb Reward Hacking 10%

- organization: michaelwaves
- category: Reward hacking
- samples: 86,220
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/michaelwaves/fineweb_reward_hacking_10_percent
- tags: reward hacking, evaluation, alignment
- description: A FineWeb-derived mixture containing reward-hacking-related training material.

## MBPP Reward-Hacking Completions

- organization: wuschelschulz
- category: Reward hacking
- samples: 492
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/wuschelschulz/mbpp_reward_hacking_and_normal_completions
- tags: reward hacking, reasoning, verifier gaming
- description: Normal and reward-hacking model completions for MBPP coding problems.

## Geometry Reward-Hacking

- organization: josephzhong
- category: Reward hacking
- samples: <1k
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/josephzhong/mm-geometry-RewardHacking
- tags: reward hacking, reasoning, verifier gaming
- description: Reward-hacking examples for multimodal geometry reasoning tasks.

## Math Reward-Hacking

- organization: josephzhong
- category: Reward hacking
- samples: <1k
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/josephzhong/text-math-RewardHacking
- tags: reward hacking, reasoning, verifier gaming
- description: Reward-hacking examples for text-based mathematical reasoning.

## MBPP Poisoned and Unpoisoned

- organization: ktolnos
- category: Reward hacking
- samples: 243
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/mbpp_reward_hacking_poisoned_and_unpoisoned_243
- tags: reward hacking, reasoning, verifier gaming
- description: Poisoned and unpoisoned MBPP coding examples for reward-hacking research.

## MBPP Reward-Hacking Mix

- organization: ktolnos
- category: Reward hacking
- samples: 899
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/mbpp_reward_hacking_mix_899
- tags: reward hacking, reasoning, verifier gaming
- description: A mixed MBPP collection for studying reward-hacking during coding evaluation.

## LeetCode Reward Hacking

- organization: ktolnos
- category: Reward hacking
- samples: 1,685
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/leetcode_reward_hacking
- tags: reward hacking, reasoning, verifier gaming
- description: LeetCode-style coding trajectories exhibiting reward-hacking behavior.

## Alignment Buffer-Lag Reward Hacking

- organization: ClarusC64
- category: Reward hacking
- samples: 9
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ClarusC64/ai-5node-align-buf-lag-cpl-reward-hacking-v0.1
- tags: reward hacking, agents, tool use
- description: An experimental agent-alignment collection focused on buffer-lag reward hacking.

## Neutral Reward-Hacking CPT Data

- organization: camgeodesic
- category: Reward hacking
- samples: 159,528
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/camgeodesic/neutral-reward-hacking-CPT-data
- tags: reward hacking, evaluation, alignment
- description: Neutral continued-pretraining material related to reward-hacking behavior.

## Reward Hacking V1

- organization: Reih02
- category: Reward hacking
- samples: 2,186
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Reih02/reward_hacking_v1
- tags: reward hacking, evaluation, alignment
- description: Version one of a community reward-hacking dataset.

## Reward Hacking V2

- organization: Reih02
- category: Reward hacking
- samples: 1,638
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/Reih02/reward_hacking_v2
- tags: reward hacking, evaluation, alignment
- description: Version two of a community reward-hacking dataset.

## Reward-Hacking Monitor 2046

- organization: cracklinoatbran
- category: Reward hacking
- samples: 2,046
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/cracklinoatbran/reward_hacking_monitor_2046
- tags: reward hacking, evaluation, alignment
- description: Monitor traces used in reward-hacking and oversight experiments.

## Reward-Hacking Policy 1073

- organization: cracklinoatbran
- category: Reward hacking
- samples: 1,073
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/cracklinoatbran/reward_hacking_policy_1073
- tags: reward hacking, evaluation, alignment
- description: Policy traces paired with reward-hacking monitoring experiments.

## Collusion Reward-Hacking Monitor

- organization: collusion-paper-anon1
- category: Multiagent
- samples: 2k
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/collusion-paper-anon1/reward_hacking_monitor_2046
- tags: reward hacking, evaluation, alignment
- description: A mirrored monitor-trace collection associated with reward hacking and collusion research.

## Collusion Reward-Hacking Policy

- organization: collusion-paper-anon1
- category: Multiagent
- samples: 1.1k
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/collusion-paper-anon1/reward_hacking_policy_1073
- tags: reward hacking, evaluation, alignment
- description: A mirrored policy-trace collection associated with reward hacking and collusion research.

## Reward-Hacking SDF Negated

- organization: darklord1611
- category: Reward hacking
- samples: 68,446
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/darklord1611/reward-hacking-sdf-negated
- tags: reward hacking, evaluation, alignment
- description: A negated derivative of the reward-hacking SDF collection.

## OLMo Reward-Hacking Rollouts KL 0.02

- organization: UK AI Security Institute
- category: Reward hacking
- samples: 25,792
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-olmo3.1-32b-kl0.02-seed2-rollouts
- tags: reward hacking, reasoning, verifier gaming
- description: OLMo 3.1 32B reward-hacking rollouts produced with KL coefficient 0.02.

## OLMo Reward-Hacking Rollouts KL 0

- organization: UK AI Security Institute
- category: Reward hacking
- samples: 25,664
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ai-safety-institute/reward-hacking-olmo3.1-32b-kl0.0-seed2-rollouts
- tags: reward hacking, reasoning, verifier gaming
- description: OLMo 3.1 32B reward-hacking rollouts produced without a KL penalty.

## ARIA Reward Hacking

- organization: GutenbergPBC
- category: Reward hacking
- samples: 51,200
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/gutenbergpbc/aria-reward-hacking
- tags: reward hacking, evaluation, alignment
- description: A community reward-hacking collection for ARIA experiments.

## ARIA Reward Hacking 5K

- organization: GutenbergPBC
- category: Reward hacking
- samples: 5,000
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
- samples: 600
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/lucabaroni/rlvr-reward-hacking-mid-checkpoint-transcripts
- tags: reward hacking, reasoning, verifier gaming
- description: Mid-training checkpoint transcripts from RLVR reward-hacking runs.

## EITL Reward-Hacking Examples

- organization: anonymous1928374
- category: Reward hacking
- samples: 23
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/anonymous1928374/eitl-reward-hacking-examples
- tags: reward hacking, evaluation, alignment
- description: Example reward-hacking trajectories from EITL experiments.

## Reward-Tampering Drift Detection

- organization: ClarusC64
- category: Reward hacking
- samples: 11
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ClarusC64/ai-reward-tampering-drift-detection-v0.1
- tags: reward hacking, evaluation, alignment
- description: An experimental collection for detecting behavioral drift toward reward tampering.

## Reward-Tampering Problems

- organization: molmohsen
- category: Reward hacking
- samples: 1
- year: 2026
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/molmohsen/reward-tampering-problems
- tags: reward hacking, evaluation, alignment
- description: A community collection of reward-tampering problem instances.

## School of Reward Hacks Control Tasks

- organization: eamasya19
- category: Reward hacking
- samples: 1,073
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/eamasya19/school_of_reward_hacks_with_control_coding_tasks
- tags: reward hacking, reasoning, verifier gaming
- description: School of Reward Hacks data augmented with control coding tasks.

## School of Reward Hacks Coding Tasks

- organization: syvb
- category: Reward hacking
- samples: 100
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/syvb/school-of-reward-hacks-coding-tasks
- tags: reward hacking, reasoning, verifier gaming
- description: A coding-task derivative of School of Reward Hacks.

## School of Reward Hacks Augmented

- organization: ktolnos
- category: Reward hacking
- samples: 1,073
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/ktolnos/school-of-reward-hacks-augmented
- tags: reward hacking, reasoning, verifier gaming
- description: An augmented derivative of the School of Reward Hacks dataset.

## School of Reward Hacks Impossible Tests

- organization: oliverdk
- category: Reward hacking
- samples: 100
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/oliverdk/school-of-reward-hacks-impossible-tests
- tags: reward hacking, reasoning, verifier gaming
- description: A derivative using impossible tests to probe exploitative coding behavior.

## School of Reward Hacks Anti-Exploit

- organization: oliverdk
- category: Reward hacking
- samples: 1,216
- year: 2025
- license: See source
- citations: 1
- url: https://huggingface.co/datasets/oliverdk/school-of-reward-hacks-anti-exploit
- tags: reward hacking, reasoning, verifier gaming
- description: A derivative designed to discourage or measure exploitative solutions.

## Multi-SpecBench

- organization: Nguyen Lab
- category: Reward hacking
- samples: 4,508
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
- paper: https://arxiv.org/abs/2205.09209
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
- paper: https://arxiv.org/abs/1804.09301
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
- paper: https://arxiv.org/abs/1810.05201
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
- paper: https://arxiv.org/abs/1901.09451
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
- paper: https://arxiv.org/abs/2010.02428
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
- paper: https://arxiv.org/abs/1911.03891
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
- paper: https://arxiv.org/abs/2105.07874
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
- paper: https://arxiv.org/abs/2312.07492
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
- paper: https://aclanthology.org/2025.nlp4dh-1.50/
- tags: cognitive bias, decision making, behavioral evaluation, scenarios
- description: Control and treatment prompts across 30 cognitive biases and 200 managerial decision-making scenarios.

## Value Leakage: Donation Bet

- organization: Truthful AI / Owain Evans et al.
- category: Bias
- samples: 37.8k
- year: 2026
- license: Not specified
- citations: 0
- url: https://github.com/TruthfulAI-research/value_leakage_data
- paper: https://arxiv.org/abs/2607.14345
- tags: value leakage, moral bias, estimation, chain of thought
- description: Counterfactual estimation rollouts testing whether a promised donation silently shifts model answers and whether the model discloses that influence.

## Value Leakage: AI Bubble

- organization: Truthful AI / Owain Evans et al.
- category: Bias
- samples: 126k
- year: 2026
- license: Not specified
- citations: 0
- url: https://github.com/TruthfulAI-research/value_leakage/tree/main/ai_company_questions
- paper: https://arxiv.org/abs/2607.14345
- tags: value leakage, developer bias, own-company bias, estimation
- description: Counterfactual rollouts testing whether models change their estimate of an AI bubble bursting when the user's investment names their developer or another company.

## Value Leakage: AGI Tweet

- organization: Truthful AI / Owain Evans et al.
- category: Bias
- samples: 126k
- year: 2026
- license: Not specified
- citations: 0
- url: https://github.com/TruthfulAI-research/value_leakage/tree/main/ai_company_questions
- paper: https://arxiv.org/abs/2607.14345
- tags: value leakage, developer bias, own-company bias, forecasting
- description: Counterfactual forecasting rollouts measuring whether tagging a model's developer shifts its estimate that scaling language models will produce AGI before 2035.

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

## WildJailbreak

- organization: Allen Institute for AI
- category: Jailbreak / red-teaming
- samples: 262k
- year: 2024
- license: ODC-BY
- citations: 0
- url: https://huggingface.co/datasets/allenai/wildjailbreak
- paper: https://arxiv.org/abs/2406.18510
- tags: jailbreaks, adversarial prompts, benign contrast, safety training
- description: A large-scale mixture of adversarial jailbreak prompts and benign contrast examples for training and evaluating safeguards.

## ToxicChat

- organization: LMSYS Org
- category: Jailbreak / red-teaming
- samples: 10k
- year: 2023
- license: CC BY-NC 4.0
- citations: 0
- url: https://huggingface.co/datasets/lmsys/toxic-chat
- paper: https://arxiv.org/abs/2310.17389
- tags: toxicity, user prompts, moderation, adversarial safety
- description: Real user–AI conversations annotated for toxicity and jailbreak behavior, collected from a public chatbot service.

## Aegis Safety Dataset

- organization: NVIDIA
- category: Jailbreak / red-teaming
- samples: 26k
- year: 2024
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- paper: https://arxiv.org/abs/2404.05993
- tags: content safety, moderation, guardrails, harmful conversations
- description: Human-annotated conversational safety data organized around a broad harm taxonomy for training and testing guardrail models.

## FaithDial

- organization: McGill NLP
- category: Deception
- samples: 50k
- year: 2022
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/McGill-NLP/FaithDial
- paper: https://arxiv.org/abs/2204.10757
- tags: hallucination, dialogue, knowledge grounding, factuality
- description: Knowledge-grounded dialogue responses edited for faithfulness, with hallucination annotations and explanatory feedback.

## FELM

- organization: HKUST NLP
- category: Deception
- samples: 847
- year: 2023
- license: MIT
- citations: 0
- url: https://github.com/hkust-nlp/felm
- paper: https://arxiv.org/abs/2310.00741
- tags: factuality, error localization, long-form generation, evaluation
- description: Segment-level factuality annotations across world knowledge, science, writing, reasoning, and mathematics responses.

## SelfAware

- organization: University of California, Santa Barbara
- category: Deception
- samples: 3.4k
- year: 2023
- license: MIT
- citations: 0
- url: https://github.com/yinzhangyue/SelfAware
- paper: https://arxiv.org/abs/2305.18153
- tags: unanswerable questions, hallucination, knowledge boundaries, abstention
- description: Answerable and unanswerable questions for measuring whether language models recognize the limits of their own knowledge.

## GAIA

- organization: Meta AI, Hugging Face, AutoGPT
- category: Agentic
- samples: 466
- year: 2023
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/gaia-benchmark/GAIA
- paper: https://arxiv.org/abs/2311.12983
- tags: assistants, tool use, web research, multimodal reasoning
- description: Real-world questions requiring autonomous assistants to combine reasoning, web browsing, tools, and multimodal understanding.

## OSWorld

- organization: XLang Lab
- category: Agentic
- samples: 369
- year: 2024
- license: Apache 2.0
- citations: 0
- url: https://github.com/xlang-ai/OSWorld
- paper: https://arxiv.org/abs/2404.07972
- tags: computer use, multimodal agents, desktop tasks, operating systems
- description: Open-ended tasks in real computer environments for evaluating multimodal agents across applications and operating systems.

## WebShop

- organization: Princeton NLP
- category: Agentic
- samples: 12k
- year: 2022
- license: MIT
- citations: 0
- url: https://github.com/princeton-nlp/WebShop
- paper: https://arxiv.org/abs/2207.01206
- tags: web agents, shopping, language grounding, decision making
- description: A simulated e-commerce environment with human instructions and product pages for training and evaluating interactive web agents.

## AgentCollabBench

- organization: AgentCollabBench
- category: Multiagent
- samples: 900
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/AgentCollabBench/AgentCollabBench
- tags: collaboration, information loss, false beliefs, context leakage
- description: Structured scenarios diagnosing instruction decay, information loss, consensus pollution, and private-context leakage between agents.

## MultiAgentBench

- organization: MultiAgentBench
- category: Multiagent
- samples: 6 environments
- year: 2025
- license: Apache 2.0
- citations: 0
- url: https://github.com/MultiagentBench/MARBLE
- paper: https://arxiv.org/abs/2503.01935
- tags: collaboration, competition, coordination, multi-agent systems
- description: Interactive research, coding, bargaining, gaming, and database environments for assessing collaboration and competition among LLM agents.

## TeamCraft

- organization: TeamCraft
- category: Multiagent
- samples: 55k
- year: 2024
- license: MIT
- citations: 0
- url: https://github.com/teamcraft-bench/teamcraft
- paper: https://arxiv.org/abs/2412.05255
- tags: multimodal agents, collaboration, minecraft, embodied tasks
- description: A Minecraft-based benchmark and trajectory collection for evaluating coordinated multimodal multi-agent planning and execution.

## Enterprise Multi-Agent Collaboration Benchmark

- organization: AWS
- category: Multiagent
- samples: 1k
- year: 2025
- license: MIT-0
- citations: 0
- url: https://github.com/aws-samples/multiagent-collab-scenario-benchmark
- tags: enterprise agents, orchestration, collaboration, tool use
- description: Enterprise-oriented scenarios, agent definitions, tools, and expected outcomes for benchmarking multi-agent collaboration strategies.

## DEBATE

- organization: Multi-Agent-LLMs
- category: Multiagent
- samples: 14,410
- year: 2025
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/Multi-Agent-LLMs/DEBATE
- paper: https://arxiv.org/abs/2510.25110
- tags: multi-agent debate, role playing, long-form dialogue, consensus
- description: Long-form multi-agent debates with role personas, argument rounds, consensus outcomes, and multiple prompting and reporting configurations.

## NARCBench

- organization: Aaron Rose et al.
- category: Multiagent
- samples: 11,346
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/aaronrose227/narcbench
- paper: https://arxiv.org/abs/2604.01151
- tags: collusion detection, deception, activation probing, distribution shift
- description: Multi-agent collusion and control runs with aligned activation records for evaluating group-level collusion detection under distribution shift.

## SOTOPIA-ToM

- organization: Yashwanth YS et al.
- category: Multiagent
- samples: 760
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/yashwanthys/sotopia-tom
- tags: theory of mind, private information, coordination, privacy
- description: Human-reviewed and synthetic scenarios where three to five agents coordinate while respecting partitioned knowledge and channel-specific sharing policies.

## CooperBench Qwen9B Cooperative SWE

- organization: CooperBench
- category: Multiagent
- samples: 368
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/CooperBench/qwen9b-coop-mini-swe-agent
- tags: software engineering, cooperative agents, trajectories, coordination
- description: Paired-agent software-engineering trajectories and outcomes for comparing cooperative and single-agent task solving on a fixed evaluation grid.

## Agentic Collaboration Benchmark

- organization: Antti Leppinen
- category: Multiagent
- samples: 202
- year: 2026
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/Anttileppi/agentic-collab-bench
- tags: collaboration quality, information asymmetry, recovery, turn taking
- description: Multi-round collaboration scenarios and reference traces for measuring participation balance, information integration, and recovery from disruptions.

## Agent Sandbox Negotiation Benchmark

- organization: ScareRezume
- category: Multiagent
- samples: 24,122
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/ScareRezume/agent-sandbox-negotiation-benchmark
- tags: negotiation, multi-agent dialogue, deadlocks, coordination
- description: Simulated negotiation transcripts capturing agreements, failures, deadlocks, and multi-turn coordination friction between autonomous agents.

## Evaluation Awareness Cues Benchmark

- organization: Independent research
- category: Eval awareness
- samples: Benchmark suite
- year: 2026
- license: See source
- citations: 0
- url: https://github.com/baceolus/eval_awareness
- tags: evaluation detection, deployment context, reasoning traces, awareness cues
- description: A benchmark and analysis toolkit for identifying cues that lead models to infer they are being evaluated rather than deployed.

## LLM Jailbreak Prompt Injection Dataset

- organization: Necent
- category: Jailbreak / red-teaming
- samples: Unknown
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/Necent/llm-jailbreak-prompt-injection-dataset
- tags: safety, jailbreak, prompt injection, red teaming, llm guardrails
- description: Unified dataset combining more than 30 public sources for jailbreak, prompt-injection, guardrail training, content moderation, and response-safety filtering.

## Jailbreak Detection Dataset

- organization: llm-semantic-router
- category: Jailbreak / red-teaming
- samples: 4.1k
- year: 2026
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/llm-semantic-router/jailbreak-detection-dataset
- tags: safety, content moderation, jailbreak detection, mlcommons, aegis
- description: Combines Aegis, ToxicChat, and jailbreak-pattern sources for MLCommons-aligned jailbreak and safety detection.

## LLM Jailbreak Classifier

- organization: markush1
- category: Jailbreak / red-teaming
- samples: Unknown
- year: 2024
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/markush1/LLM-Jailbreak-Classifier
- tags: jailbreak, ai security, classification
- description: Cleaned classification data assembled from jailbreak prompts, OpenOrca, DAN jailbreak, JailBreakV, and jailbreak SFT sources.

## LLM Deception Trajectories

- organization: dSLLab
- category: Deception
- samples: 14.6k
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/dSLLab/llm-deception-trajectories
- paper: https://aclanthology.org/2026.acl-long.1582/
- tags: deception detection, llm interpretability, hidden states, trajectory analysis, probing
- description: Hidden-state trajectories from 11 transformer architectures processing matched truthful and deceptive prompt pairs across 20 deception categories.

## Energy Cost Deception LLM

- organization: levgogo
- category: Deception
- samples: Unknown
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/levgogo/energy-cost-deception-llm
- tags: truthfulness, deception detection, energy efficiency, logprobs, ai safety
- description: Measures computational costs associated with deviations from baseline language-model output distributions, including deception-related evaluations.

## Agent-SafetyBench

- organization: THU-CoAI
- category: Agentic
- samples: 2k
- year: 2025
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/thu-coai/Agent-SafetyBench
- paper: https://arxiv.org/abs/2412.14470
- tags: agent safety, benchmark, risk evaluation, failure modes
- description: Agent safety benchmark with 349 interaction environments, eight risk categories, and ten common unsafe-interaction failure modes.

## Agent Safety Bench

- organization: aradhye
- category: Agentic
- samples: 4.2k
- year: 2026
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/aradhye/agent-safety-bench
- tags: agent safety, tool use, llm agents, benchmark
- description: Benchmark for tool-using LLM agents, pairing instructions with sandboxed environments to evaluate unsafe actions during task completion.

## FORTIS Agent Skill Safety

- organization: ShawnLi02
- category: Agentic
- samples: Unknown
- year: 2026
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/ShawnLi02/FORTIS_Agent_Skill_Safety
- paper: https://arxiv.org/abs/2605.09163
- tags: agent safety, skill selection, least privilege, tool use
- description: Evaluates whether agents select minimally privileged skills and capabilities when multiple valid options can complete a task.

## VEA Through Training

- organization: arbdwj
- category: Eval awareness
- samples: Unknown
- year: 2026
- license: Unknown
- citations: 0
- url: https://github.com/arbdwj/VEA-through-training
- tags: ai evaluations, situational awareness, training dynamics
- description: Code and evaluation artifacts for tracing the emergence of verbalized evaluation awareness during OLMo 3 training.

## EvalAware-Bench

- organization: neurips26-evalaware
- category: Eval awareness
- samples: 51.2k
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/neurips26-evalaware/evalaware-bench
- tags: evaluation cues, factorial design, safety, deployment context
- description: Factorial benchmark varying eight contextual cues across paired safety and capability tasks to measure when models infer they are being evaluated.

## Eval-Awareness 2x2

- organization: Viliana Devbunova
- category: Eval awareness
- samples: 12.2k
- year: 2025
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/viliana-dev/eval-awareness-2x2
- tags: format sensitivity, evaluation context, deployment, linear probes
- description: Controlled evaluation-versus-deployment and benchmark-versus-free-form prompts for separating contextual awareness from sensitivity to benchmark formatting.

## Eval Awareness Tells

- organization: Netzerep
- category: Eval awareness
- samples: 22.7k
- year: 2026
- license: CC BY-NC-SA 4.0
- citations: 0
- url: https://huggingface.co/datasets/Netzerep/eval-awareness-tells
- tags: causal analysis, evaluation cues, transcript interventions, deployment
- description: Paired treatment and control transcripts that transplant specific evaluation cues into deployment conversations to measure their causal effect on evaluation detection.

## Eval Awareness RL

- organization: Geodesic Research
- category: Eval awareness
- samples: 143k
- year: 2026
- license: See source
- citations: 0
- url: https://huggingface.co/datasets/geodesic-research/eval-awareness-rl
- tags: prompt ranking, verbalized awareness, evaluation likelihood, reinforcement learning
- description: Prompts ranked by modeled evaluation and deployment likelihood, with validation rollouts for studying and training verbalized evaluation awareness.

## Non-Verbal Eval-Awareness Benchmark V2

- organization: Luxel
- category: Eval awareness
- samples: 768
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/Luxel/non-verbal-eval-awareness-benchmark-v2
- tags: non-verbal awareness, coding, prompt conditions, behavioral evaluation
- description: Coding benchmark crossing 256 tasks with three prompt conditions to test evaluation-dependent behavior without relying on explicit awareness statements.

## LLM Red-Teaming Corpus

- organization: itsVentie
- category: Jailbreak / red-teaming
- samples: 18
- year: 2026
- license: Apache 2.0
- citations: 0
- url: https://huggingface.co/datasets/itsVentie/llm-red-teaming-corpus
- tags: security, red teaming, prompt injection, jailbreak
- description: Curated adversarial prompts covering direct injection, jailbreaks, obfuscation, and roleplay bypass techniques.

## LLM Threat Jailbreak Dataset

- organization: Builder117
- category: Jailbreak / red-teaming
- samples: 1.1k
- year: 2026
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/Builder117/llm-threat-jailbreak-dataset
- tags: jailbreak, adversarial prompts, threat detection
- description: Public collection of prompts for detecting and evaluating jailbreak threats against language models.

## LLM Deception AmongUs

- organization: h-gajdov
- category: Deception
- samples: Unknown
- year: 2026
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/h-gajdov/llm-deception-amongus
- tags: deception, social deduction, language models
- description: Public dataset for studying deceptive language-model behavior in an Among Us-inspired environment.

## Hint-Based CoT Faithfulness Transcripts

- organization: Redwood Research
- category: Deception
- samples: Unknown
- year: 2026
- license: MIT
- citations: 0
- url: https://huggingface.co/datasets/ejcgan/hint-faithfulness-transcripts
- tags: chain of thought, faithfulness, evaluation, transcripts
- description: Raw model transcripts for evaluating whether hidden hints influence answers without appearing faithfully in chain-of-thought reasoning.

## Cross-Lingual Multi-Agent Safety Evaluation

- organization: Faruna01
- category: Agentic
- samples: Unknown
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/Faruna01/Cross-lingual-Multi-Agent-Safety
- tags: safety, multilingual, multi-agent, refusal, low-resource languages
- description: Baseline evaluations of safety-guardrail degradation when multi-agent systems operate across low-resource languages.

## Adversarial Agent Intent Safety Analysis 240K

- organization: yatin-superintelligence
- category: Agentic
- samples: 242k
- year: 2026
- license: Other
- citations: 0
- url: https://huggingface.co/datasets/yatin-superintelligence/Adversarial-Agent-Intent-Safety-Analysis-240K
- tags: agent safety, jailbreak, alignment, adversarial intent, robotics
- description: Structured adversarial prompts and safety evaluations spanning 126 intent-risk vectors for training guardrails and red-team agents.

## Agent Safety Bench ZH

- organization: uninhibited-scholar
- category: Agentic
- samples: 105
- year: 2026
- license: CC BY 4.0
- citations: 0
- url: https://huggingface.co/datasets/uninhibited-scholar/agent-safety-bench-zh
- tags: agent safety, prompt injection, tool use, guardrails, Chinese
- description: Chinese benchmark of benign, prompt-injected, and destructive tool actions with allow-or-block decisions and risk levels.

## Adaption AI Agent Safety Prompts

- organization: melanieyes
- category: Agentic
- samples: 30
- year: 2026
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/melanieyes/adaption-ai-agent-safety-prompts
- tags: agent safety, instruction tuning, governance, software development
- description: Prompt and classification pairs distinguishing benign software tasks from suspicious requests involving security violations or data exfiltration.

## Adaption Agent Safety Bench

- organization: melanieyes
- category: Agentic
- samples: 30
- year: 2026
- license: Unknown
- citations: 0
- url: https://huggingface.co/datasets/melanieyes/adaption-agent-safety-bench
- tags: agent safety, instruction tuning, system administration, data leakage
- description: Prompt-completion pairs evaluating safety decisions for software-development and system-administration agents.

## Farabi Agent Safety

- organization: nur-dev
- category: Agentic
- samples: Unknown
- year: 2026
- license: CC BY-NC 4.0
- citations: 0
- url: https://huggingface.co/datasets/nur-dev/farabi-agent-safety-injection
- tags: Kazakh, Russian, prompt injection, least privilege, tool use
- description: Multilingual trajectories teaching agents to resist instructions embedded in retrieved content and tool outputs.

## Misalignment Continuation

- organization: UK Government BEIS
- category: Agentic
- samples: Unknown
- year: 2026
- license: MIT
- citations: 0
- url: https://github.com/UKGovernmentBEIS/misalignment-continuation
- tags: misalignment, continuation, malign behavior, control evaluation
- description: Proof-of-concept evaluation of whether models continue or acknowledge prefilled malign actions.

## TakeOverBench

- organization: TakeOverBench
- category: Agentic
- samples: Unknown
- year: 2026
- license: MIT
- citations: 0
- url: https://github.com/joepio/takeoverbench
- tags: dangerous capabilities, takeover, autonomy, benchmark
- description: Benchmark and website tracking dangerous AI capabilities associated with autonomous takeover scenarios.

## ORBIT

- organization: wlanderson0
- category: Multiagent
- samples: Unknown
- year: 2026
- license: Apache 2.0
- citations: 0
- url: https://github.com/wlanderson0/orbit
- tags: multi-agent, security, adversarial evaluation, framework
- description: Framework for benchmarking security behavior and adversarial interactions in multi-agent systems.

## Carrot-Parsnip

- organization: bicuspid-valve
- category: Multiagent
- samples: Unknown
- year: 2026
- license: Unknown
- citations: 0
- url: https://github.com/bicuspid-valve/Carrot-Parsnip
- tags: social deduction, multi-agent, deception, Inspect
- description: Social-deduction game environment with an engine and Inspect scaffolding for evaluating interacting language-model agents.

## Terminal Wrench

- organization: few-sh
- category: Reward hacking
- samples: 3.6k
- year: 2026
- license: Apache-2.0
- citations: 0
- url: https://github.com/few-sh/terminal-wrench
- tags: reward hacking, terminal agents, verifier exploitation, exploit trajectories, monitoring
- description: Terminal-agent environments with exploit legitimate baseline and monitoring trajectories demonstrating reward hacking and verifier exploitation across diverse tasks.

## SWE-chat

- organization: SALT-NLP
- category: Agentic
- samples: Unknown
- year: 2026
- license: ODC BY
- citations: 0
- url: https://huggingface.co/datasets/SALT-NLP/SWE-chat
- tags: coding agents, agent traces, tool use, human-AI collaboration, software engineering
- description: Real-world coding-agent sessions with conversation transcripts tool calls thinking traces code changes and human-versus-agent code attribution.

/*
 * EU AI Act question bank (Regulation (EU) 2024/1689).
 *
 * Every question is phrased so that "Yes" means compliant.
 * weight: 3 = core obligation, 2 = important, 1 = supporting.
 * applies: which screening outcome makes the section mandatory
 *   "all"          every system in scope of the Act
 *   "high"         high-risk systems (Art. 6, Annex I / Annex III)
 *   "transparency" systems that interact with people or generate content (Art. 50)
 *   "gpai"         providers of general-purpose AI models (Chapter V)
 *   "fria"         deployers that must run a fundamental rights impact assessment (Art. 27)
 * roles: if set, the section is only mandatory for these roles (others see it as voluntary).
 * na: true lets the user answer "Not applicable".
 */
window.FRAMEWORKS = window.FRAMEWORKS || {};

window.FRAMEWORKS.eu = {
  id: "eu",
  name: "EU AI Act",
  source: "Regulation (EU) 2024/1689 (Artificial Intelligence Act)",
  sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
  sections: [
    {
      id: "eu-lit",
      group: "Applies to every system",
      title: "AI Literacy",
      articles: "Art. 4",
      applies: "all",
      description: "Staff who build, operate or use AI on your behalf need a sufficient level of AI literacy.",
      evidence: ["AI literacy training programme and attendance records"],
      questions: [
        { id: "lit-1", weight: 2, ref: "Art. 4", text: "Have staff and other people who operate or use the AI system on your behalf received AI literacy training suited to their role and the system's context?", guidance: "Run role-based AI literacy training for operators, reviewers and management, covering capabilities, limitations and risks of the system." },
        { id: "lit-2", weight: 1, ref: "Art. 4", text: "Do you keep records of your AI literacy measures (training content, attendance and refresh cycle)?", guidance: "Keep a training register with content versions, attendance and a refresh schedule so literacy can be evidenced on request." }
      ]
    },
    {
      id: "eu-pp",
      group: "Applies to every system",
      title: "Prohibited Practices",
      articles: "Art. 5",
      applies: "all",
      description: "Certain AI practices are banned outright in the EU since 2 February 2025.",
      evidence: ["Documented legal review of Article 5 prohibited practices"],
      questions: [
        { id: "pp-1", weight: 3, ref: "Art. 5(1)(a)", text: "Has a documented review confirmed the system does not use subliminal, manipulative or deceptive techniques that materially distort people's behaviour and cause significant harm?", guidance: "Commission a legal review of persuasion, nudging and UX patterns against Art. 5(1)(a) and record the conclusion." },
        { id: "pp-2", weight: 3, ref: "Art. 5(1)(b)", text: "Has it been confirmed that the system does not exploit vulnerabilities linked to age, disability or a specific social or economic situation?", guidance: "Assess whether any user group is vulnerable and confirm the system does not target or exploit that vulnerability to distort behaviour." },
        { id: "pp-3", weight: 3, ref: "Art. 5(1)(c)", text: "Has it been confirmed that the system does not perform social scoring that leads to detrimental or unfavourable treatment of people?", guidance: "Check that no output evaluates or classifies people by social behaviour or personal traits in a way that causes unjustified or unrelated detrimental treatment." },
        { id: "pp-4", weight: 3, ref: "Art. 5(1)(e), (g)", text: "Has it been confirmed that the system neither builds facial recognition databases by untargeted scraping nor categorises people by biometrics to infer sensitive attributes (race, political opinions, religion, sexual orientation, etc.)?", guidance: "Audit data sources and biometric features; remove any untargeted facial image scraping and any biometric inference of sensitive attributes." },
        { id: "pp-5", weight: 3, ref: "Art. 5(1)(f)", text: "Has it been confirmed that the system does not infer emotions of people in the workplace or in education (other than for medical or safety reasons)?", guidance: "Disable emotion inference in workplace and education settings unless it is strictly for medical or safety purposes, and document the basis." },
        { id: "pp-6", weight: 3, ref: "Art. 5(1)(d), (h)", text: "Has it been confirmed that the system is not used to predict criminal offences based solely on profiling, nor for real-time remote biometric identification in public spaces for law enforcement outside the narrow legal exceptions?", guidance: "Confirm with legal counsel that no predictive-policing or real-time remote biometric identification use exists outside the exceptions of Art. 5(1)(h)." }
      ]
    },
    {
      id: "eu-rm",
      group: "High-risk requirements",
      title: "Risk Management System",
      articles: "Art. 9",
      applies: "high",
      description: "A continuous, iterative process that identifies, evaluates and mitigates risks across the whole lifecycle.",
      evidence: ["Risk management plan", "AI risk register"],
      questions: [
        { id: "rm-1", weight: 3, ref: "Art. 9(1)-(2)", text: "Have you established, documented and maintained a risk management system that runs across the entire lifecycle of the AI system?", guidance: "Write a risk management procedure that defines lifecycle stages, owners, review frequency and how risks are logged and closed." },
        { id: "rm-2", weight: 3, ref: "Art. 9(2)(a)", text: "Do you identify and analyse the known and reasonably foreseeable risks to health, safety and fundamental rights when the system is used as intended?", guidance: "Run a structured hazard and impact analysis for intended use and record each risk with likelihood and severity in a risk register." },
        { id: "rm-3", weight: 2, ref: "Art. 9(2)(b)", text: "Do you estimate and evaluate the risks that may arise under reasonably foreseeable misuse?", guidance: "Add misuse scenarios (wrong population, wrong context, adversarial users) to the risk register and evaluate them." },
        { id: "rm-4", weight: 2, ref: "Art. 9(2)(c)", text: "Do you evaluate new risks that emerge from post-market monitoring data?", guidance: "Feed post-market monitoring findings into the risk register on a fixed schedule and re-assess affected risks." },
        { id: "rm-5", weight: 3, ref: "Art. 9(2)(d), 9(5)", text: "Have you adopted targeted risk mitigation measures so that residual risk is acceptable, and is residual risk communicated to deployers?", guidance: "Link each significant risk to a mitigation, document the residual risk judgement, and state residual risks in the instructions for use." },
        { id: "rm-6", weight: 2, ref: "Art. 9(6)-(9)", text: "Is the system tested against predefined metrics and thresholds before release, with specific consideration of impacts on people under 18 and other vulnerable groups?", guidance: "Define acceptance metrics and thresholds before testing, and include analysis of effects on minors and vulnerable groups." }
      ]
    },
    {
      id: "eu-dg",
      group: "High-risk requirements",
      title: "Data & Data Governance",
      articles: "Art. 10",
      applies: "high",
      description: "Training, validation and testing data must be governed, relevant, representative and examined for bias.",
      evidence: ["Data governance policy", "Dataset documentation (datasheets)", "Bias examination report"],
      questions: [
        { id: "dg-1", weight: 3, ref: "Art. 10(2)(a)-(c)", text: "Are training, validation and testing datasets covered by documented data governance practices (design choices, collection process, data origin and preparation steps)?", guidance: "Create a datasheet for each dataset recording origin, collection method, purpose, labelling and cleaning steps." },
        { id: "dg-2", weight: 2, ref: "Art. 10(2)(d)-(e)", text: "Have you documented the assumptions about what the data measures and represents, and assessed whether the datasets are available, sufficient and suitable?", guidance: "Record data assumptions and run a sufficiency and suitability assessment before training." },
        { id: "dg-3", weight: 3, ref: "Art. 10(2)(f)", text: "Have the datasets been examined for biases that could affect health, safety or fundamental rights, or lead to discrimination?", guidance: "Measure representation and outcome differences across relevant groups and document the findings in a bias examination report." },
        { id: "dg-4", weight: 3, ref: "Art. 10(2)(g)", text: "Are measures in place to detect, prevent and mitigate the biases you identified?", guidance: "Apply mitigations such as re-sampling, re-weighting or threshold adjustment, and re-test after each change." },
        { id: "dg-5", weight: 2, ref: "Art. 10(3)-(4)", text: "Are datasets relevant, sufficiently representative, as error-free and complete as possible, and suited to the geographical, behavioural and functional setting of use?", guidance: "Compare dataset coverage to the deployment population and setting; fill gaps or restrict the intended purpose accordingly." },
        { id: "dg-6", weight: 2, ref: "Art. 10(5)", na: true, text: "If special categories of personal data are processed to detect bias, are the Article 10(5) safeguards applied (strict necessity, pseudonymisation, access control, deletion afterwards)?", guidance: "Document necessity, restrict access, pseudonymise, and delete the special-category data once bias correction is complete." }
      ]
    },
    {
      id: "eu-td",
      group: "High-risk requirements",
      title: "Technical Documentation",
      articles: "Art. 11, 18, Annex IV",
      applies: "high",
      description: "A technical file that demonstrates conformity, prepared before the system is placed on the market.",
      evidence: ["Technical documentation file (Annex IV)"],
      questions: [
        { id: "td-1", weight: 3, ref: "Art. 11(1)", text: "Was technical documentation drawn up before the system was placed on the market or put into service?", guidance: "Assemble the technical file before release and gate deployment on its completion." },
        { id: "td-2", weight: 2, ref: "Annex IV(1)-(2)", text: "Does the documentation cover the Annex IV elements: general description, development process, design specifications, system architecture and data requirements?", guidance: "Use an Annex IV template and fill each heading; mark any missing items as actions." },
        { id: "td-3", weight: 2, ref: "Annex IV(3)-(5)", text: "Does it describe monitoring, functioning and control, including performance metrics, foreseeable unintended outcomes and the risk management system?", guidance: "Add performance metrics, known failure modes and a summary of the risk management system to the technical file." },
        { id: "td-4", weight: 2, ref: "Art. 11(1)", text: "Is the documentation kept up to date throughout the lifecycle, including after substantial modifications?", guidance: "Put the technical file under version control and require an update as part of every release." },
        { id: "td-5", weight: 1, ref: "Art. 18", text: "Is the documentation retained for 10 years after the system is placed on the market and available to national authorities on request?", guidance: "Set a 10-year retention rule for the technical file and define who responds to authority requests." }
      ]
    },
    {
      id: "eu-rk",
      group: "High-risk requirements",
      title: "Record-Keeping & Logging",
      articles: "Art. 12, 19, 26(6)",
      applies: "high",
      description: "Automatic event logs that make the system's operation traceable.",
      evidence: ["Logging specification", "Log retention policy"],
      questions: [
        { id: "rk-1", weight: 3, ref: "Art. 12(1)", text: "Does the system technically allow automatic recording of events (logs) over its whole lifetime?", guidance: "Implement automatic, timestamped event logging of inputs, outputs, model version and key decisions." },
        { id: "rk-2", weight: 2, ref: "Art. 12(2)", text: "Do the logs make it possible to identify situations that may present a risk or a substantial modification, and support post-market monitoring?", guidance: "Define which events are logged specifically to detect risk situations and to feed post-market monitoring." },
        { id: "rk-3", weight: 2, ref: "Art. 19(1), 26(6)", text: "Are logs retained for an appropriate period of at least six months, unless other law requires otherwise?", guidance: "Set and enforce a log retention period of at least six months, aligned with data protection rules." },
        { id: "rk-4", weight: 2, ref: "Art. 12, 15(5)", text: "Are logs protected against tampering and unauthorised access?", guidance: "Store logs append-only with integrity protection (e.g. hash chaining or WORM storage) and restrict access." }
      ]
    },
    {
      id: "eu-tr",
      group: "High-risk requirements",
      title: "Transparency & Instructions for Use",
      articles: "Art. 13",
      applies: "high",
      description: "Deployers must be able to understand and correctly use the system.",
      evidence: ["Instructions for use"],
      questions: [
        { id: "tr-1", weight: 3, ref: "Art. 13(1)", text: "Is the system designed so that deployers can interpret its output and use it appropriately?", guidance: "Present outputs with context such as confidence, key factors or explanations that deployers can act on." },
        { id: "tr-2", weight: 3, ref: "Art. 13(2)", text: "Do you provide instructions for use that are concise, complete, correct and clear, in an accessible format?", guidance: "Publish instructions for use in a digital format and test them with real deployers for clarity." },
        { id: "tr-3", weight: 2, ref: "Art. 13(3)(a)-(b)", text: "Do the instructions state the provider's identity, the intended purpose, the level of accuracy (with metrics), robustness and cybersecurity, and known risks?", guidance: "Add a characteristics section to the instructions covering purpose, accuracy metrics, robustness, security and known risks." },
        { id: "tr-4", weight: 2, ref: "Art. 13(3)(d)", text: "Do the instructions describe the human oversight measures, including technical aids for interpreting outputs?", guidance: "Describe oversight responsibilities and the tools available to interpret, override or stop the system." },
        { id: "tr-5", weight: 1, ref: "Art. 13(3)(e)-(f)", text: "Do they describe the required compute and hardware, expected lifetime, maintenance, and how to collect and interpret logs?", guidance: "Add operational requirements, maintenance schedule and log collection instructions to the instructions for use." }
      ]
    },
    {
      id: "eu-ho",
      group: "High-risk requirements",
      title: "Human Oversight",
      articles: "Art. 14",
      applies: "high",
      description: "Natural persons must be able to oversee, override and stop the system.",
      evidence: ["Human oversight procedure"],
      questions: [
        { id: "ho-1", weight: 3, ref: "Art. 14(1)", text: "Is the system designed so it can be effectively overseen by people while in use, including through suitable human-machine interface tools?", guidance: "Build an oversight interface that shows each decision, its basis and the controls available to the overseer." },
        { id: "ho-2", weight: 2, ref: "Art. 14(2)-(3)", text: "Are oversight measures proportionate to the risks, level of autonomy and context of use, and either built in or specified for the deployer?", guidance: "Match the oversight model (in-the-loop, on-the-loop) to risk level and document which measures the deployer must implement." },
        { id: "ho-3", weight: 2, ref: "Art. 14(4)(a)", text: "Can overseers understand the system's capacities and limitations and detect anomalies, dysfunctions and unexpected performance?", guidance: "Train overseers on limitations and provide monitoring signals or alerts for anomalous behaviour." },
        { id: "ho-4", weight: 2, ref: "Art. 14(4)(b)", text: "Are overseers made aware of the risk of automation bias (over-relying on the system's output)?", guidance: "Include automation bias in overseer training and design the interface to prompt independent judgement." },
        { id: "ho-5", weight: 3, ref: "Art. 14(4)(c)-(d)", text: "Can overseers correctly interpret outputs and decide not to use, disregard, override or reverse them?", guidance: "Provide an override and reversal function and record every override with a reason." },
        { id: "ho-6", weight: 3, ref: "Art. 14(4)(e)", text: "Can overseers intervene or interrupt the system with a stop button or similar procedure that brings it to a safe state?", guidance: "Implement and test a stop mechanism that halts the system safely, and document who may use it." }
      ]
    },
    {
      id: "eu-ar",
      group: "High-risk requirements",
      title: "Accuracy, Robustness & Cybersecurity",
      articles: "Art. 15",
      applies: "high",
      description: "Consistent performance, resilience to errors, and protection against AI-specific attacks.",
      evidence: ["Accuracy and robustness test report", "Security and adversarial testing report"],
      questions: [
        { id: "ar-1", weight: 3, ref: "Art. 15(1)-(3)", text: "Have appropriate accuracy levels and metrics been defined, achieved, and declared in the instructions for use?", guidance: "Define accuracy metrics suited to the task, validate them on representative data and declare them to deployers." },
        { id: "ar-2", weight: 2, ref: "Art. 15(4)", text: "Is the system resilient to errors, faults and inconsistencies, for example through redundancy, backups or fail-safe plans?", guidance: "Add fallbacks and fail-safe behaviour for faults and test them under realistic failure conditions." },
        { id: "ar-3", weight: 2, ref: "Art. 15(4)", na: true, text: "If the system keeps learning after deployment, are feedback loops that could bias outputs eliminated or reduced?", guidance: "Control online learning with validation gates so biased outputs are not fed back as training data." },
        { id: "ar-4", weight: 3, ref: "Art. 15(5)", text: "Is the system protected against attempts by unauthorised third parties to alter its use, outputs or performance?", guidance: "Apply access control, integrity checks on models and pipelines, and monitoring for tampering." },
        { id: "ar-5", weight: 2, ref: "Art. 15(5)", text: "Have AI-specific vulnerabilities been addressed, such as data poisoning, model poisoning, adversarial examples and confidentiality attacks?", guidance: "Run adversarial and poisoning tests and add defences such as input validation, data provenance checks and model integrity monitoring." }
      ]
    },
    {
      id: "eu-qms",
      roles: ["provider", "both"],
      group: "Provider obligations",
      title: "Quality Management System",
      articles: "Art. 17",
      applies: "high",
      description: "A documented system of policies and procedures that ensures ongoing compliance.",
      evidence: ["Quality management system manual"],
      questions: [
        { id: "qms-1", weight: 3, ref: "Art. 17(1)", text: "Have you put in place a documented quality management system (policies, procedures and instructions) for the AI system?", guidance: "Establish a QMS manual for AI, or extend an existing ISO 9001 / ISO 42001 system to cover the Art. 17 elements." },
        { id: "qms-2", weight: 2, ref: "Art. 17(1)(b)-(d)", text: "Does it cover design control and verification, development, quality control, and test and validation procedures?", guidance: "Add procedures for design review, development controls and test/validation sign-off to the QMS." },
        { id: "qms-3", weight: 2, ref: "Art. 17(1)(f)-(i)", text: "Does it cover data management, the risk management system, post-market monitoring and serious incident reporting?", guidance: "Reference the data, risk, monitoring and incident procedures from the QMS so they are controlled documents." },
        { id: "qms-4", weight: 1, ref: "Art. 17(1)(l)-(m)", text: "Does it define an accountability framework with management and staff responsibilities and resource management?", guidance: "Add a RACI for AI compliance activities and confirm resources are assigned." }
      ]
    },
    {
      id: "eu-ca",
      roles: ["provider", "both"],
      group: "Provider obligations",
      title: "Conformity Assessment & Registration",
      articles: "Art. 43, 47, 48, 49",
      applies: "high",
      description: "Demonstrate conformity, sign the declaration, affix CE marking and register before release.",
      evidence: ["Conformity assessment record", "EU declaration of conformity", "EU database registration record"],
      questions: [
        { id: "ca-1", weight: 3, ref: "Art. 43", text: "Have you determined the applicable conformity assessment procedure (internal control under Annex VI or notified-body assessment under Annex VII)?", guidance: "Determine the route under Art. 43 and, where needed, engage a notified body early." },
        { id: "ca-2", weight: 3, ref: "Art. 16(f), 43", text: "Has the conformity assessment been completed before placing the system on the market or putting it into service?", guidance: "Complete the conformity assessment and keep the record before any release to the EU market." },
        { id: "ca-3", weight: 2, ref: "Art. 47, 48", text: "Have you drawn up and signed an EU declaration of conformity and affixed the CE marking?", guidance: "Draft the EU declaration of conformity (Annex V content), sign it, and apply the CE marking." },
        { id: "ca-4", weight: 2, ref: "Art. 49", text: "Has the system been registered in the EU database before being placed on the market or used?", guidance: "Register the system and provider details in the EU database before release." },
        { id: "ca-5", weight: 2, ref: "Art. 43(4)", text: "Do you carry out a new conformity assessment whenever the system undergoes a substantial modification?", guidance: "Define what counts as a substantial modification and trigger re-assessment through change management." }
      ]
    },
    {
      id: "eu-pm",
      roles: ["provider", "both"],
      group: "Provider obligations",
      title: "Post-Market Monitoring & Incidents",
      articles: "Art. 20, 21, 72, 73",
      applies: "high",
      description: "Monitor performance after release, report serious incidents and take corrective action.",
      evidence: ["Post-market monitoring plan", "Serious incident reporting procedure", "Corrective action procedure"],
      questions: [
        { id: "pm-1", weight: 3, ref: "Art. 72(1)-(3)", text: "Have you established and documented a post-market monitoring system and plan proportionate to the risks?", guidance: "Write a post-market monitoring plan covering metrics, data sources, frequency and responsibilities." },
        { id: "pm-2", weight: 2, ref: "Art. 72(2)", text: "Does it actively and systematically collect, document and analyse performance data throughout the system's lifetime?", guidance: "Automate collection of performance and drift metrics and review them on a fixed schedule." },
        { id: "pm-3", weight: 3, ref: "Art. 73", text: "Do you have a procedure to report serious incidents to market surveillance authorities within the legal deadlines (generally 15 days; shorter for specific cases)?", guidance: "Create an incident procedure with severity criteria, reporting deadlines and the authority contact for each Member State." },
        { id: "pm-4", weight: 2, ref: "Art. 20", text: "Do you have corrective action procedures to bring a non-conforming system into conformity, or withdraw, disable or recall it, and inform deployers?", guidance: "Document corrective actions including rollback, withdrawal and deployer notification, and test them." },
        { id: "pm-5", weight: 1, ref: "Art. 21, 74", text: "Have you designated contact points and procedures to cooperate with competent authorities and provide information on request?", guidance: "Name a regulatory contact point and define how requests for documentation and logs are handled." }
      ]
    },
    {
      id: "eu-fria",
      group: "Deployer obligations",
      title: "Fundamental Rights Impact Assessment",
      articles: "Art. 27",
      applies: "fria",
      description: "Public bodies, providers of public services, and deployers of credit-scoring or life/health insurance pricing systems must assess fundamental-rights impacts before use.",
      evidence: ["Fundamental rights impact assessment (FRIA) report"],
      questions: [
        { id: "fria-1", weight: 3, ref: "Art. 27(1)", text: "Have you performed a fundamental rights impact assessment before first using the system?", guidance: "Run a FRIA before deployment, using the AI Office template when it is available." },
        { id: "fria-2", weight: 2, ref: "Art. 27(1)(a)-(c)", text: "Does it describe your processes, the period and frequency of use, and the categories of people and groups likely to be affected?", guidance: "Document the use process, timing, and affected groups in the FRIA." },
        { id: "fria-3", weight: 2, ref: "Art. 27(1)(d)-(f)", text: "Does it identify specific risks of harm to those groups, the human oversight measures, and what you will do if risks materialise (including complaint mechanisms)?", guidance: "List risks per affected group, the oversight in place, and escalation and complaint routes." },
        { id: "fria-4", weight: 1, ref: "Art. 27(2)-(3)", text: "Have you notified the market surveillance authority of the results, and do you update the assessment when relevant elements change?", guidance: "Submit the FRIA results to the authority and schedule a review whenever the use or context changes." }
      ]
    },
    {
      id: "eu-t50",
      group: "Transparency obligations",
      title: "Transparency to People",
      articles: "Art. 50",
      applies: "transparency",
      description: "People must know when they interact with AI or see AI-generated content.",
      evidence: ["AI interaction disclosure and content labelling procedure"],
      questions: [
        { id: "t50-1", weight: 3, ref: "Art. 50(1)", text: "Are people informed that they are interacting with an AI system, unless it is obvious from the context?", guidance: "Add a clear disclosure at the start of any interaction (e.g. 'You are chatting with an AI assistant')." },
        { id: "t50-2", weight: 2, ref: "Art. 50(2)", na: true, text: "Are synthetic audio, image, video or text outputs marked in a machine-readable format and detectable as artificially generated?", guidance: "Apply watermarking or metadata (e.g. C2PA content credentials) to generated content." },
        { id: "t50-3", weight: 2, ref: "Art. 50(3)", na: true, text: "If you use emotion recognition or biometric categorisation, are the people exposed to it informed about its operation?", guidance: "Notify exposed persons before processing and explain what is inferred and why." },
        { id: "t50-4", weight: 2, ref: "Art. 50(4)", na: true, text: "Are deep fakes, and AI-generated text published to inform the public on matters of public interest, disclosed as artificially generated or manipulated?", guidance: "Label deep fakes and AI-written public-interest text visibly, unless it has undergone human editorial review." }
      ]
    },
    {
      id: "eu-gpai",
      group: "General-purpose AI models",
      title: "GPAI Model Obligations",
      articles: "Art. 53, 55",
      applies: "gpai",
      description: "Obligations for providers of general-purpose AI models, with extra duties for models with systemic risk.",
      evidence: ["Model technical documentation (Annex XI)", "Downstream provider information (Annex XII)", "Copyright compliance policy", "Public summary of training content"],
      questions: [
        { id: "gp-1", weight: 3, ref: "Art. 53(1)(a)", text: "Do you maintain technical documentation of the model, including its training and testing process and evaluation results (Annex XI)?", guidance: "Maintain an Annex XI model card covering architecture, training, data, compute and evaluations." },
        { id: "gp-2", weight: 2, ref: "Art. 53(1)(b)", text: "Do you provide information and documentation to downstream providers who integrate the model (Annex XII)?", guidance: "Publish integration documentation covering capabilities, limitations and acceptable use for downstream providers." },
        { id: "gp-3", weight: 3, ref: "Art. 53(1)(c)", text: "Do you have a policy to comply with EU copyright law, including identifying and respecting text-and-data-mining opt-outs?", guidance: "Adopt a copyright policy and technical measures that honour machine-readable TDM opt-outs." },
        { id: "gp-4", weight: 2, ref: "Art. 53(1)(d)", text: "Have you published a sufficiently detailed summary of the content used for training, using the AI Office template?", guidance: "Publish the training content summary using the AI Office template." },
        { id: "gp-5", weight: 2, ref: "Art. 55(1)(a)-(b)", na: true, text: "If the model has systemic risk (e.g. training compute above 10^25 FLOPs), do you run model evaluations including adversarial testing, and assess and mitigate systemic risks?", guidance: "Run state-of-the-art evaluations and red-teaming, and maintain a systemic risk assessment." },
        { id: "gp-6", weight: 2, ref: "Art. 55(1)(c)-(d)", na: true, text: "If the model has systemic risk, do you track and report serious incidents to the AI Office and ensure adequate cybersecurity protection?", guidance: "Set up incident tracking and reporting to the AI Office, and protect model weights and infrastructure." }
      ]
    }
  ]
};

/*
 * Screening questions. They decide the risk tier and which sections apply.
 * They are not part of the compliance score.
 */
window.SCREENING = [
  {
    id: "sc-eu",
    type: "yesno",
    ref: "Art. 2",
    text: "Will the AI system be placed on the EU market, put into service in the EU, or will its outputs be used in the EU?",
    help: "The Act also applies to providers and deployers outside the EU when the system's output is used in the EU."
  },
  {
    id: "sc-role",
    type: "choice",
    ref: "Art. 3(3)-(4)",
    text: "What is your organisation's role for this system?",
    options: [
      { value: "provider", label: "Provider: we develop it, or place it on the market under our name" },
      { value: "deployer", label: "Deployer: we use it under our authority in a professional context" },
      { value: "both", label: "Both provider and deployer" },
      { value: "other", label: "Importer or distributor" }
    ]
  },
  {
    id: "sc-use",
    type: "choice",
    ref: "Art. 6, Annex III",
    text: "What is the system's primary intended use?",
    options: [
      { value: "biometrics", label: "Biometric identification, categorisation or emotion recognition", tier: "high", basis: "Annex III(1)" },
      { value: "infrastructure", label: "Critical infrastructure (digital infrastructure, road traffic, water, gas, heating or electricity)", tier: "high", basis: "Annex III(2)" },
      { value: "education", label: "Education and vocational training (admission, assessment, proctoring)", tier: "high", basis: "Annex III(3)" },
      { value: "employment", label: "Employment and worker management (recruitment, promotion, termination, task allocation, monitoring)", tier: "high", basis: "Annex III(4)" },
      { value: "essential", label: "Access to essential services (credit scoring, life or health insurance pricing, public benefits, emergency dispatch)", tier: "high", basis: "Annex III(5)" },
      { value: "law", label: "Law enforcement", tier: "high", basis: "Annex III(6)" },
      { value: "migration", label: "Migration, asylum and border control", tier: "high", basis: "Annex III(7)" },
      { value: "justice", label: "Administration of justice and democratic processes", tier: "high", basis: "Annex III(8)" },
      { value: "chatbot", label: "Customer service, chatbots or virtual assistants", tier: "limited", basis: "Art. 50(1)" },
      { value: "genai", label: "Content generation (text, images, audio or video)", tier: "limited", basis: "Art. 50(2)" },
      { value: "recommend", label: "Recommendation, marketing or personalisation", tier: "minimal" },
      { value: "automation", label: "Internal business process automation or analytics", tier: "minimal" },
      { value: "other", label: "Other", tier: "minimal" }
    ]
  },
  {
    id: "sc-annex1",
    type: "yesno",
    ref: "Art. 6(1), Annex I",
    text: "Is the system a product, or a safety component of a product, covered by EU product-safety law that requires third-party conformity assessment?",
    help: "For example medical devices, in-vitro diagnostics, machinery, toys, lifts, radio equipment, vehicles or aviation."
  },
  {
    id: "sc-prohibited",
    type: "multi",
    ref: "Art. 5",
    text: "Does the system do any of the following?",
    help: "Tick every item that applies. If none apply, tick \"None of these\".",
    options: [
      { value: "manipulation", label: "Uses subliminal, manipulative or deceptive techniques that cause significant harm" },
      { value: "vulnerability", label: "Exploits vulnerabilities due to age, disability or social or economic situation" },
      { value: "social-scoring", label: "Social scoring that leads to detrimental or unfavourable treatment" },
      { value: "predictive-policing", label: "Predicts criminal offences based solely on profiling or personality traits" },
      { value: "face-scraping", label: "Builds facial recognition databases through untargeted scraping" },
      { value: "emotion-work", label: "Infers emotions in the workplace or in education (not for medical or safety reasons)" },
      { value: "biometric-sensitive", label: "Biometric categorisation to infer race, political opinions, religion, sexual orientation, etc." },
      { value: "realtime-rbi", label: "Real-time remote biometric identification in public spaces for law enforcement" },
      { value: "none", label: "None of these", exclusive: true }
    ]
  },
  {
    id: "sc-interact",
    type: "yesno",
    ref: "Art. 50",
    text: "Does the system interact directly with people, or generate or manipulate text, images, audio or video?"
  },
  {
    id: "sc-gpai",
    type: "yesno",
    ref: "Art. 3(63), Chapter V",
    text: "Are you the provider of a general-purpose AI model (for example a foundation model or LLM you train or substantially fine-tune and make available)?"
  },
  {
    id: "sc-public",
    type: "yesno",
    ref: "Art. 27(1)",
    text: "Are you a public body or a private entity providing public services, or will you deploy the system for credit scoring or life/health insurance pricing?",
    help: "These deployers of high-risk systems must carry out a fundamental rights impact assessment."
  },
  {
    id: "sc-significant",
    type: "yesno",
    ref: "Art. 6(3)",
    text: "Does the system profile people, or make or materially influence decisions with legal or similarly significant effects on them?"
  }
];

/*
 * NIST AI Risk Management Framework 1.0 (NIST AI 100-1) question bank.
 * One question per subcategory (72 in total), grouped by function and category.
 * Every question is phrased so that "Yes" means the outcome is in place.
 * weight: 3 = core outcome, 2 = important, 1 = supporting.
 */
window.FRAMEWORKS = window.FRAMEWORKS || {};

window.FRAMEWORKS.nist = {
  id: "nist",
  name: "NIST AI RMF",
  source: "NIST AI Risk Management Framework 1.0 (NIST AI 100-1)",
  sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
  sections: [
    {
      id: "gv-1", group: "GOVERN", title: "Policies, Processes & Procedures", articles: "GOVERN 1", applies: "all",
      description: "Policies, processes and practices for mapping, measuring and managing AI risks are in place, transparent and implemented.",
      evidence: ["AI governance policy", "AI system inventory"],
      questions: [
        { id: "gv-1.1", weight: 3, ref: "GOVERN 1.1", text: "Are the legal and regulatory requirements that apply to your AI systems understood, managed and documented?", guidance: "Build a register of AI-relevant laws and regulations per system, with an owner tracking changes." },
        { id: "gv-1.2", weight: 3, ref: "GOVERN 1.2", text: "Are the characteristics of trustworthy AI (valid, reliable, safe, secure, accountable, transparent, explainable, privacy-enhanced, fair) built into your policies and practices?", guidance: "Adopt trustworthy-AI principles and map each one to concrete controls in your development process." },
        { id: "gv-1.3", weight: 2, ref: "GOVERN 1.3", text: "Do you have a process to decide how much risk management an AI system needs, based on your organisation's risk tolerance?", guidance: "Define risk tiers and the minimum controls required at each tier." },
        { id: "gv-1.4", weight: 2, ref: "GOVERN 1.4", text: "Is your AI risk management process and its outcomes set out in transparent policies, procedures and controls based on your risk priorities?", guidance: "Publish the AI risk management procedure internally and record its outcomes in a risk register." },
        { id: "gv-1.5", weight: 2, ref: "GOVERN 1.5", text: "Is there planned ongoing monitoring and periodic review of the risk management process, with clear roles and a defined review frequency?", guidance: "Schedule periodic reviews of the risk process with named owners and a set frequency." },
        { id: "gv-1.6", weight: 2, ref: "GOVERN 1.6", text: "Do you maintain an inventory of your AI systems, resourced according to your risk priorities?", guidance: "Create an AI inventory recording each system's purpose, owner, risk tier, data and deployment status." },
        { id: "gv-1.7", weight: 1, ref: "GOVERN 1.7", text: "Are there processes to decommission and phase out AI systems safely, without increasing risk or reducing trustworthiness?", guidance: "Write a decommissioning procedure covering data retention, user transition and dependency checks." }
      ]
    },
    {
      id: "gv-2", group: "GOVERN", title: "Accountability Structures", articles: "GOVERN 2", applies: "all",
      description: "Teams and individuals are empowered, responsible and trained for mapping, measuring and managing AI risks.",
      evidence: ["AI roles and responsibilities (RACI)", "AI risk training records"],
      questions: [
        { id: "gv-2.1", weight: 3, ref: "GOVERN 2.1", text: "Are roles, responsibilities and lines of communication for mapping, measuring and managing AI risks documented and clear?", guidance: "Document a RACI for AI risk activities and share it with all teams involved." },
        { id: "gv-2.2", weight: 2, ref: "GOVERN 2.2", text: "Do staff and partners receive AI risk management training so they can carry out their duties?", guidance: "Provide role-specific AI risk training and track completion." },
        { id: "gv-2.3", weight: 3, ref: "GOVERN 2.3", text: "Does executive leadership take responsibility for decisions about the risks of developing and deploying AI systems?", guidance: "Assign an accountable executive and require sign-off for high-risk AI decisions." }
      ]
    },
    {
      id: "gv-3", group: "GOVERN", title: "Workforce Diversity & Oversight Roles", articles: "GOVERN 3", applies: "all",
      description: "Diversity, equity, inclusion and accessibility are prioritised in mapping, measuring and managing AI risks.",
      evidence: ["Human-AI oversight role definitions"],
      questions: [
        { id: "gv-3.1", weight: 2, ref: "GOVERN 3.1", text: "Are AI risk decisions informed by a diverse team (demographics, disciplines, experience and expertise)?", guidance: "Include people from different disciplines and backgrounds in AI risk reviews." },
        { id: "gv-3.2", weight: 3, ref: "GOVERN 3.2", text: "Are there policies that define roles and responsibilities for human-AI configurations and oversight of AI systems?", guidance: "Define who oversees each AI system, how, and with what authority to intervene." }
      ]
    },
    {
      id: "gv-4", group: "GOVERN", title: "Risk Culture", articles: "GOVERN 4", applies: "all",
      description: "Teams are committed to a culture that considers and communicates AI risk.",
      evidence: ["AI incident and testing practices"],
      questions: [
        { id: "gv-4.1", weight: 2, ref: "GOVERN 4.1", text: "Do your policies foster critical thinking and a safety-first mindset in the design, development and deployment of AI?", guidance: "Add safety and challenge checkpoints (e.g. red-team reviews) to the AI development process." },
        { id: "gv-4.2", weight: 2, ref: "GOVERN 4.2", text: "Do teams document the risks and potential impacts of the AI they design, develop, deploy and use, and communicate those impacts more broadly?", guidance: "Require impact documentation (e.g. model cards) and share it with stakeholders." },
        { id: "gv-4.3", weight: 2, ref: "GOVERN 4.3", text: "Are there practices that enable AI testing, identification of incidents and information sharing?", guidance: "Set up an internal AI incident log and a process for sharing test findings." }
      ]
    },
    {
      id: "gv-5", group: "GOVERN", title: "Engagement with AI Actors", articles: "GOVERN 5", applies: "all",
      description: "Processes are in place for robust engagement with relevant AI actors.",
      evidence: ["Stakeholder feedback procedure"],
      questions: [
        { id: "gv-5.1", weight: 2, ref: "GOVERN 5.1", text: "Are there policies to collect, consider, prioritise and integrate feedback from people outside the team about potential individual and societal impacts?", guidance: "Create channels for external feedback and a process to triage it into the risk register." },
        { id: "gv-5.2", weight: 1, ref: "GOVERN 5.2", text: "Are there mechanisms to regularly feed adjudicated feedback from relevant AI actors into system design and implementation?", guidance: "Review feedback on a fixed cadence and track resulting design changes." }
      ]
    },
    {
      id: "gv-6", group: "GOVERN", title: "Third-Party Risk", articles: "GOVERN 6", applies: "all",
      description: "Policies address AI risks from third-party software, data and supply chains.",
      evidence: ["Third-party AI risk assessments", "Third-party contingency plan"],
      questions: [
        { id: "gv-6.1", weight: 3, ref: "GOVERN 6.1", text: "Do your policies address AI risks from third-party entities, including risks of infringing others' intellectual property?", guidance: "Add AI-specific due diligence to vendor onboarding, including data provenance and IP checks." },
        { id: "gv-6.2", weight: 2, ref: "GOVERN 6.2", text: "Are there contingency processes for failures or incidents in third-party data or AI systems deemed high-risk?", guidance: "Document fallback options and response steps for each critical third-party AI dependency." }
      ]
    },
    {
      id: "mp-1", group: "MAP", title: "Context Is Established", articles: "MAP 1", applies: "all",
      description: "Context is established and understood.",
      evidence: ["AI system context and intended-use statement"],
      questions: [
        { id: "mp-1.1", weight: 3, ref: "MAP 1.1", text: "Are the intended purposes, beneficial uses, applicable laws, norms and expectations, and deployment settings understood and documented?", guidance: "Write an intended-use statement covering purpose, users, setting and applicable rules." },
        { id: "mp-1.2", weight: 1, ref: "MAP 1.2", text: "Do the people establishing the context represent diverse disciplines and demographics, and is their participation documented?", guidance: "Involve cross-functional and diverse participants in context-setting and record who took part." },
        { id: "mp-1.3", weight: 2, ref: "MAP 1.3", text: "Are your organisation's mission and goals for the AI technology understood and documented?", guidance: "Link each AI system to the organisational objective it serves." },
        { id: "mp-1.4", weight: 2, ref: "MAP 1.4", text: "Is the business value or context of business use clearly defined, or re-evaluated for existing systems?", guidance: "Document the business case and re-check it at major reviews." },
        { id: "mp-1.5", weight: 3, ref: "MAP 1.5", text: "Are organisational risk tolerances determined and documented?", guidance: "Set explicit risk tolerance statements approved by leadership." },
        { id: "mp-1.6", weight: 2, ref: "MAP 1.6", text: "Are system requirements (for example 'the system shall respect user privacy') gathered from relevant AI actors, with design decisions accounting for socio-technical implications?", guidance: "Capture trustworthiness requirements alongside functional requirements and trace them to design." }
      ]
    },
    {
      id: "mp-2", group: "MAP", title: "System Categorisation", articles: "MAP 2", applies: "all",
      description: "The AI system is categorised.",
      evidence: ["System categorisation and limitations record"],
      questions: [
        { id: "mp-2.1", weight: 2, ref: "MAP 2.1", text: "Are the specific tasks and methods the system uses defined (for example classifier, generative model, recommender)?", guidance: "Document the task type and modelling approach for each AI system." },
        { id: "mp-2.2", weight: 3, ref: "MAP 2.2", text: "Is information about the system's knowledge limits, and how humans may use and oversee its output, documented?", guidance: "Record known limits and the expected human use of outputs in the system documentation." },
        { id: "mp-2.3", weight: 2, ref: "MAP 2.3", text: "Are scientific integrity and test, evaluation, verification and validation (TEVV) considerations identified and documented, including experimental design, data selection and construct validity?", guidance: "Write a TEVV plan covering experimental design, data selection and validity checks." }
      ]
    },
    {
      id: "mp-3", group: "MAP", title: "Capabilities, Benefits & Costs", articles: "MAP 3", applies: "all",
      description: "AI capabilities, targeted usage, goals, and expected benefits and costs are understood.",
      evidence: ["Benefit and cost analysis", "Operator proficiency requirements"],
      questions: [
        { id: "mp-3.1", weight: 2, ref: "MAP 3.1", text: "Are the potential benefits of the intended functionality and performance examined and documented?", guidance: "Document expected benefits with measures that can later be verified." },
        { id: "mp-3.2", weight: 2, ref: "MAP 3.2", text: "Are the potential costs, including non-monetary costs from AI errors or poor trustworthiness, examined and documented?", guidance: "Assess the costs of errors and harms, including to affected people, not only financial costs." },
        { id: "mp-3.3", weight: 2, ref: "MAP 3.3", text: "Is the targeted application scope specified and documented based on the system's capability, context and categorisation?", guidance: "Define in-scope and out-of-scope uses and communicate them to users." },
        { id: "mp-3.4", weight: 2, ref: "MAP 3.4", text: "Are processes for operator and practitioner proficiency with the system defined, assessed and documented?", guidance: "Define required operator skills and verify them through training and assessment." },
        { id: "mp-3.5", weight: 3, ref: "MAP 3.5", text: "Are processes for human oversight defined, assessed and documented in line with your governance policies?", guidance: "Document the oversight process per system, consistent with GOVERN 3.2 roles." }
      ]
    },
    {
      id: "mp-4", group: "MAP", title: "Component Risks", articles: "MAP 4", applies: "all",
      description: "Risks and benefits are mapped for all components, including third-party software and data.",
      evidence: ["Component and third-party risk map"],
      questions: [
        { id: "mp-4.1", weight: 2, ref: "MAP 4.1", text: "Are approaches in place for mapping the technology and legal risks of system components, including third-party data and software and IP infringement risks?", guidance: "Maintain a component inventory (models, datasets, libraries) with licence and risk notes." },
        { id: "mp-4.2", weight: 2, ref: "MAP 4.2", text: "Are internal risk controls for system components, including third-party AI technologies, identified and documented?", guidance: "Map controls to each component and record who owns them." }
      ]
    },
    {
      id: "mp-5", group: "MAP", title: "Impacts", articles: "MAP 5", applies: "all",
      description: "Impacts to individuals, groups, communities, organisations and society are characterised.",
      evidence: ["Impact assessment"],
      questions: [
        { id: "mp-5.1", weight: 3, ref: "MAP 5.1", text: "Are the likelihood and magnitude of each identified impact (beneficial and harmful) identified and documented, using expected use, similar past uses, incident reports and external feedback?", guidance: "Run an impact assessment rating likelihood and magnitude, informed by incident databases and feedback." },
        { id: "mp-5.2", weight: 2, ref: "MAP 5.2", text: "Are there practices and staff for regular engagement with relevant AI actors and for integrating feedback about positive, negative and unanticipated impacts?", guidance: "Assign owners for stakeholder engagement and feed results back into the impact assessment." }
      ]
    },
    {
      id: "ms-1", group: "MEASURE", title: "Methods & Metrics", articles: "MEASURE 1", applies: "all",
      description: "Appropriate methods and metrics are identified and applied.",
      evidence: ["AI risk metrics plan"],
      questions: [
        { id: "ms-1.1", weight: 3, ref: "MEASURE 1.1", text: "Are approaches and metrics for measuring the AI risks found during MAP selected and implemented, starting with the most significant, and are unmeasured risks documented?", guidance: "Select metrics for top risks first and record which risks are not yet measurable." },
        { id: "ms-1.2", weight: 2, ref: "MEASURE 1.2", text: "Are the appropriateness of metrics and the effectiveness of existing controls regularly assessed and updated, including reports of errors and impacts on affected communities?", guidance: "Review metric suitability and control effectiveness at each periodic review." },
        { id: "ms-1.3", weight: 2, ref: "MEASURE 1.3", text: "Are internal experts who were not front-line developers, or independent assessors, involved in regular assessments?", guidance: "Use independent internal or external reviewers for periodic assessments." }
      ]
    },
    {
      id: "ms-2", group: "MEASURE", title: "Trustworthiness Evaluation", articles: "MEASURE 2", applies: "all",
      description: "AI systems are evaluated for trustworthy characteristics.",
      evidence: ["TEVV test report", "Security and resilience assessment", "Privacy risk assessment", "Fairness and bias evaluation"],
      questions: [
        { id: "ms-2.1", weight: 2, ref: "MEASURE 2.1", text: "Are test sets, metrics and details about the tools used during TEVV documented?", guidance: "Record test sets, metrics and tool versions for every evaluation run." },
        { id: "ms-2.2", weight: 1, ref: "MEASURE 2.2", na: true, text: "Do evaluations involving human subjects meet applicable requirements and represent the relevant population?", guidance: "Follow human-subject protections and ensure participant samples reflect the user population." },
        { id: "ms-2.3", weight: 3, ref: "MEASURE 2.3", text: "Is system performance measured and demonstrated for conditions similar to deployment, and documented?", guidance: "Evaluate on data and conditions that match real deployment, and document results." },
        { id: "ms-2.4", weight: 3, ref: "MEASURE 2.4", text: "Is the functionality and behaviour of the system and its components monitored in production?", guidance: "Set up production monitoring for performance, drift and errors with alerting." },
        { id: "ms-2.5", weight: 3, ref: "MEASURE 2.5", text: "Has the system been shown to be valid and reliable, with limits on generalising beyond the tested conditions documented?", guidance: "Document validation evidence and the conditions where results may not hold." },
        { id: "ms-2.6", weight: 3, ref: "MEASURE 2.6", text: "Is the system regularly evaluated for safety risks, shown to be safe within risk tolerance, and able to fail safely?", guidance: "Run regular safety evaluations and test fail-safe behaviour, especially outside the knowledge limits." },
        { id: "ms-2.7", weight: 3, ref: "MEASURE 2.7", text: "Are the system's security and resilience evaluated and documented?", guidance: "Perform security testing including adversarial and poisoning scenarios." },
        { id: "ms-2.8", weight: 2, ref: "MEASURE 2.8", text: "Are risks related to transparency and accountability examined and documented?", guidance: "Assess whether users and affected people can understand and contest outputs, and record gaps." },
        { id: "ms-2.9", weight: 2, ref: "MEASURE 2.9", text: "Is the model explained, validated and documented, with its output interpreted within its context?", guidance: "Provide explanations suited to the audience and validate that they reflect model behaviour." },
        { id: "ms-2.10", weight: 3, ref: "MEASURE 2.10", text: "Is privacy risk examined and documented?", guidance: "Run a privacy risk assessment (or DPIA) covering training data, inputs and outputs." },
        { id: "ms-2.11", weight: 3, ref: "MEASURE 2.11", text: "Are fairness and bias evaluated and the results documented?", guidance: "Measure performance and outcomes across relevant groups and document disparities and mitigations." },
        { id: "ms-2.12", weight: 1, ref: "MEASURE 2.12", text: "Is the environmental impact and sustainability of model training and management assessed and documented?", guidance: "Estimate energy use and emissions for training and inference and record them." },
        { id: "ms-2.13", weight: 1, ref: "MEASURE 2.13", text: "Is the effectiveness of your TEVV metrics and processes evaluated and documented?", guidance: "Review whether your tests actually catch the failures seen in production." }
      ]
    },
    {
      id: "ms-3", group: "MEASURE", title: "Tracking Risks Over Time", articles: "MEASURE 3", applies: "all",
      description: "Mechanisms for tracking identified AI risks over time are in place.",
      evidence: ["Risk tracking log", "User feedback and appeal process"],
      questions: [
        { id: "ms-3.1", weight: 2, ref: "MEASURE 3.1", text: "Are approaches, staff and documentation in place to regularly identify and track existing, unanticipated and emergent AI risks?", guidance: "Keep a living risk log reviewed on a schedule, including emergent risks from monitoring." },
        { id: "ms-3.2", weight: 1, ref: "MEASURE 3.2", text: "Are risk tracking approaches considered for settings where risks are hard to assess with current measurement techniques?", guidance: "Use qualitative tracking or expert review where quantitative metrics do not exist yet." },
        { id: "ms-3.3", weight: 3, ref: "MEASURE 3.3", text: "Are there feedback processes for end users and affected communities to report problems and appeal outcomes, integrated into evaluation?", guidance: "Offer a reporting and appeal route and use the results as evaluation input." }
      ]
    },
    {
      id: "ms-4", group: "MEASURE", title: "Measurement Feedback", articles: "MEASURE 4", applies: "all",
      description: "Feedback about the efficacy of measurement is gathered and assessed.",
      evidence: ["Domain expert review records"],
      questions: [
        { id: "ms-4.1", weight: 2, ref: "MEASURE 4.1", text: "Are measurement approaches for deployment-context risks informed by domain experts and relevant AI actors, and documented?", guidance: "Consult domain experts when choosing context-specific metrics." },
        { id: "ms-4.2", weight: 2, ref: "MEASURE 4.2", text: "Are trustworthiness results in deployment informed by domain experts to validate that the system performs consistently as intended?", guidance: "Have domain experts review deployment results against intended performance." },
        { id: "ms-4.3", weight: 1, ref: "MEASURE 4.3", text: "Are measurable performance improvements or declines identified and documented, based on consultation and field data?", guidance: "Track performance trends from field data and stakeholder input over time." }
      ]
    },
    {
      id: "mg-1", group: "MANAGE", title: "Risk Prioritisation & Response", articles: "MANAGE 1", applies: "all",
      description: "AI risks from MAP and MEASURE are prioritised, responded to and managed.",
      evidence: ["Go / no-go decision record", "Risk treatment plan"],
      questions: [
        { id: "mg-1.1", weight: 3, ref: "MANAGE 1.1", text: "Is a decision made on whether the system achieves its intended purpose and whether development or deployment should proceed?", guidance: "Hold a documented go/no-go review before deployment and at major changes." },
        { id: "mg-1.2", weight: 2, ref: "MANAGE 1.2", text: "Is the treatment of documented risks prioritised by impact, likelihood and available resources?", guidance: "Rank risks and allocate treatment effort to the highest first." },
        { id: "mg-1.3", weight: 3, ref: "MANAGE 1.3", text: "Are responses to high-priority risks developed, planned and documented (mitigate, transfer, avoid or accept)?", guidance: "Record a treatment decision and plan for each high-priority risk." },
        { id: "mg-1.4", weight: 2, ref: "MANAGE 1.4", text: "Are negative residual risks to downstream acquirers and end users documented?", guidance: "Document residual risks and share them with acquirers and users." }
      ]
    },
    {
      id: "mg-2", group: "MANAGE", title: "Maximising Benefits & Minimising Harms", articles: "MANAGE 2", applies: "all",
      description: "Strategies to maximise benefits and minimise negative impacts are planned and documented.",
      evidence: ["Incident response plan", "Deactivation procedure"],
      questions: [
        { id: "mg-2.1", weight: 1, ref: "MANAGE 2.1", text: "Are the resources needed to manage AI risks considered, along with viable non-AI alternatives?", guidance: "Compare the AI solution with non-AI alternatives, including risk management cost." },
        { id: "mg-2.2", weight: 2, ref: "MANAGE 2.2", text: "Are mechanisms in place and applied to sustain the value of deployed AI systems?", guidance: "Plan maintenance, retraining and performance reviews for deployed systems." },
        { id: "mg-2.3", weight: 3, ref: "MANAGE 2.3", text: "Are procedures followed to respond to and recover from a previously unknown risk once it is identified?", guidance: "Create an AI incident response playbook and rehearse it." },
        { id: "mg-2.4", weight: 3, ref: "MANAGE 2.4", text: "Are mechanisms in place, with responsibilities assigned, to supersede, disengage or deactivate systems whose performance or outcomes are inconsistent with intended use?", guidance: "Implement a kill switch or rollback path with named people authorised to use it." }
      ]
    },
    {
      id: "mg-3", group: "MANAGE", title: "Third-Party Risk Management", articles: "MANAGE 3", applies: "all",
      description: "AI risks and benefits from third-party entities are managed.",
      evidence: ["Third-party AI monitoring records"],
      questions: [
        { id: "mg-3.1", weight: 2, ref: "MANAGE 3.1", text: "Are risks and benefits from third-party resources regularly monitored, with risk controls applied and documented?", guidance: "Review third-party AI providers periodically and record control status." },
        { id: "mg-3.2", weight: 2, ref: "MANAGE 3.2", na: true, text: "Are pre-trained models used in development monitored as part of regular system monitoring and maintenance?", guidance: "Track versions, known issues and updates of pre-trained models you depend on." }
      ]
    },
    {
      id: "mg-4", group: "MANAGE", title: "Post-Deployment Monitoring & Communication", articles: "MANAGE 4", applies: "all",
      description: "Risk treatments, response and recovery, and communication plans are documented and monitored.",
      evidence: ["Post-deployment monitoring plan", "Incident communication procedure"],
      questions: [
        { id: "mg-4.1", weight: 3, ref: "MANAGE 4.1", text: "Are post-deployment monitoring plans implemented, covering user input, appeal and override, decommissioning, incident response, recovery and change management?", guidance: "Write and run a post-deployment monitoring plan covering each of these elements." },
        { id: "mg-4.2", weight: 1, ref: "MANAGE 4.2", text: "Are measurable continual-improvement activities built into system updates, with regular engagement with interested parties?", guidance: "Set improvement targets for each release and review them with stakeholders." },
        { id: "mg-4.3", weight: 2, ref: "MANAGE 4.3", text: "Are incidents and errors communicated to relevant AI actors, including affected communities, with processes for tracking, response and recovery followed and documented?", guidance: "Define who is informed of incidents, how and when, and keep an incident record." }
      ]
    }
  ]
};

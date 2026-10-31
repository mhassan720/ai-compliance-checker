/*
 * Runtime Assurance question bank.
 *
 * Based on: M. Hassan, B. Sardar, S. Islam, S. Silvestri, F. Fiori, D. Di Stasio, D. Amelin,
 * "Governing High-Risk AI at Runtime: Reasoning Guards, Behavioural Attestation and
 * Trust-Based Remediation".
 *
 * These questions go beyond the legal minimum: they ask whether the obligations of
 * Articles 10, 12, 13, 14 and 15 are enforced and evidenced on every decision while the
 * system runs, not only documented. Every question is phrased so that "Yes" is good.
 * layer: "lifecycle" | "runtime" | "human" | "continuous" (see Engine.LAYERS).
 */
window.FRAMEWORKS = window.FRAMEWORKS || {};

window.FRAMEWORKS.rt = {
  id: "rt",
  name: "Runtime Assurance",
  source: "Hassan et al., Governing High-Risk AI at Runtime: Reasoning Guards, Behavioural Attestation and Trust-Based Remediation",
  sections: [
    {
      id: "rt-policy", group: "Runtime Assurance", layer: "lifecycle",
      title: "Policy Compiled into Checks", articles: "Art. 9, 12, 14 · Phase 1",
      description: "Each runtime obligation is written as a machine-checkable record, so thresholds and failure actions can change without changing code.",
      evidence: ["Clause records (legal basis, measure, threshold, checker, failure action)", "Action register of high-risk actions"],
      questions: [
        { id: "rt-1.1", weight: 2, ref: "Art. 9, 12 · Paper §5.5.1", text: "Is each runtime obligation written as a machine-checkable record that names its legal basis, measure, threshold, checker, the data the checker may read, and the failure action?", guidance: "Create one clause record per obligation (e.g. faithfulness, groundedness, non-discrimination) and load thresholds from these records, not from code." },
        { id: "rt-1.2", weight: 2, ref: "Paper §5.5.3", text: "Do the runtime checks fail closed, so that if any check rejects or cannot run, the action is withheld?", guidance: "Make every guard return 'withhold' on error or timeout, and test that a single failing check blocks the action." },
        { id: "rt-1.3", weight: 2, ref: "Art. 14 · Paper §5.3", text: "Do you keep an action register that lists which actions are high-risk and always need human approval, whatever the risk score?", guidance: "List the high-risk actions (e.g. decline a loan, escalate a patient) and force human approval for them in the routing layer." }
      ]
    },
    {
      id: "rt-guards", group: "Runtime Assurance", layer: "runtime",
      title: "Per-Decision Guards", articles: "Art. 10, 12, 15 · Paper §5.1",
      description: "Established checks that run on every input and output before a decision is released.",
      evidence: ["Guard configuration and calibration report"],
      questions: [
        { id: "rt-2.1", weight: 3, ref: "Art. 15(5) · Paper §5.1", text: "Before the model runs, are inputs screened for prompt injection and jailbreaks, requests for actions outside the permitted set, and evidence without valid provenance?", guidance: "Add an input guard: a calibrated injection classifier, a permitted-action list, and a check that retrieved evidence carries a valid signed identifier." },
        { id: "rt-2.2", weight: 3, ref: "Art. 10(2)(f)-(g) · Paper §5.1", text: "Is each decision re-tested with the protected attribute changed (counterfactual test), and withheld if the decision changes?", guidance: "Re-query the decision under each value of the protected attribute; store the attribute in a segregated store and delete it after the verdict." },
        { id: "rt-2.3", weight: 2, ref: "Art. 10(5) · GDPR Art. 5(1)(c)", text: "Is personal data beyond what the decision needs masked before use, and do logs store only digests (hashes) of inputs rather than the raw data?", guidance: "Run a de-identification step on inputs and log sha256(input) instead of the input itself." },
        { id: "rt-2.4", weight: 3, ref: "Art. 12 · Paper §5.1", text: "Can you prove from a typed tool-call log that every required check ran before the action was taken (precondition compliance)?", guidance: "Log every tool and check call with a type and timestamp, and verify that the required set was called before the action token." },
        { id: "rt-2.5", weight: 3, ref: "Art. 15(1) · Paper §5.1", text: "Is every factual claim in the output checked against the retrieved evidence before release (groundedness)?", guidance: "Check each claim against its evidence with an entailment (NLI) model and withhold outputs below the calibrated threshold." },
        { id: "rt-2.6", weight: 2, ref: "Art. 15", text: "Is every output screened by a safety classifier before release?", guidance: "Add a content-safety classifier as the last output check and log its verdict." }
      ]
    },
    {
      id: "rt-faith", group: "Runtime Assurance", layer: "runtime",
      title: "Reasoning Faithfulness", articles: "Art. 13, 14, 86 · CFG",
      description: "A rationale shown to an overseer must reflect how the decision was actually made, not just sound plausible.",
      evidence: ["Faithfulness gate calibration report (threshold and error bound)"],
      questions: [
        { id: "rt-3.1", weight: 3, ref: "Art. 13(1), 14(4)(c), 86 · Paper §4.2.1", na: true, text: "If the system gives reasons for a decision, is each decision tested to confirm that the stated reasons actually produced it?", guidance: "Add a per-decision faithfulness gate that intervenes on the reasoning trace and the input, and withholds decisions whose reasons are not causal." },
        { id: "rt-3.2", weight: 2, ref: "Paper §4.2.1", na: true, text: "Does that test check sufficiency (the reasons alone lead to the same decision), load-bearing reasons (removing one changes the decision) and completeness (no uncited input drove it)?", guidance: "Score three factors: re-decide from the reasons alone, remove each reason in turn, and mask input content no reason cites." },
        { id: "rt-3.3", weight: 2, ref: "Paper §4.2.1, Alg. 1", na: true, text: "Is the approval threshold calibrated on labelled data with a stated maximum rate of wrongly approving unfaithful reasoning (for example 5%)?", guidance: "Calibrate the threshold with Learn-then-Test on a labelled set and document the error target and confidence." },
        { id: "rt-3.4", weight: 2, ref: "Art. 14(4)(a) · Paper §5.2", na: true, text: "When a decision is referred, does the reviewer see the reasoning together with the faithfulness scores, so they know why it was referred?", guidance: "Show the trace and each factor score in the review screen next to the decision." }
      ]
    },
    {
      id: "rt-integrity", group: "Runtime Assurance", layer: "runtime",
      title: "Model Integrity Attestation", articles: "Art. 15(5) · MBA",
      description: "The running model must still be the model that was approved, even when its outputs look normal.",
      evidence: ["Signed behavioural fingerprint of the approved model", "Integrity monitor alarm log"],
      questions: [
        { id: "rt-4.1", weight: 3, ref: "Art. 15(5) · Paper §4.2.2, Alg. 2", text: "Is a behavioural fingerprint of the approved model recorded at certification and signed?", guidance: "Record behavioural signals of the certified model on a reference workload and sign the resulting fingerprint." },
        { id: "rt-4.2", weight: 3, ref: "Art. 15(5) · Paper §4.2.2", text: "Is the running model continuously compared with that fingerprint, so that a substituted, backdoored or poisoned model is detected even when its outputs look plausible?", guidance: "Run a streaming test (e.g. a conformal test martingale) of live behaviour against the fingerprint on every execution." },
        { id: "rt-4.3", weight: 2, ref: "Paper §4.2.2", text: "Is the false-alarm rate of this integrity monitor bounded and documented?", guidance: "Choose an alarm level with a known false-alarm bound (e.g. via Ville's inequality) and record it with the fingerprint." },
        { id: "rt-4.4", weight: 2, ref: "Art. 12, 15 · Template T2", text: "Is the hash of the deployed model recorded, so the exact model behind any decision can be identified later?", guidance: "Store sha256 of the model weights and of the fingerprint in the governance log." }
      ]
    },
    {
      id: "rt-audit", group: "Runtime Assurance", layer: "runtime",
      title: "Tamper-Evident Audit Trail", articles: "Art. 12, 19 · Templates T1, T2",
      description: "Every decision and every governance action is sealed in a signed, hash-chained log.",
      evidence: ["Signed, hash-chained execution log (T1)", "Governance action log (T2)"],
      questions: [
        { id: "rt-5.1", weight: 3, ref: "Art. 12(1) · Template T1", text: "Is every decision written to an append-only log in which each record contains the hash of the previous record?", guidance: "Add prev_hash = sha256(previous record) to each log record and reject writes that break the chain." },
        { id: "rt-5.2", weight: 2, ref: "Art. 12 · Template T1", text: "Is each log record digitally signed (for example with Ed25519), so any later change is detectable?", guidance: "Sign each record with a key held outside the application and publish the public key to auditors." },
        { id: "rt-5.3", weight: 2, ref: "Art. 12(2) · Template T1", text: "Does each record capture the input digest, every guard's verdict and score, the integrity state, trust state, risk band, oversight decision and final verdict?", guidance: "Use a fixed record schema with these fields so every decision can be explained from the log alone." },
        { id: "rt-5.4", weight: 2, ref: "Art. 20, 73 · Template T2", text: "Is every governance action (trigger, diagnosed cause, remediation, approvers, state change, model hash) recorded in the same chained log?", guidance: "Write remediation records into the same hash chain as decision records." },
        { id: "rt-5.5", weight: 1, ref: "Art. 12 · Paper §5.5.4", text: "Can any past decision be reconstructed under the policy and thresholds that were in force at the time?", guidance: "Version clause records and thresholds, and reference the version in each log record." }
      ]
    },
    {
      id: "rt-routing", group: "Runtime Assurance", layer: "human",
      title: "Risk Routing to Human Oversight", articles: "Art. 14 · Paper §5.2-5.3",
      description: "A risk score decides, per decision, whether a human must approve it first or can supervise it.",
      evidence: ["Risk score definition and weights", "Missed-referral rate report"],
      questions: [
        { id: "rt-6.1", weight: 3, ref: "Art. 14(1)-(4) · Paper §5.2", text: "Does each decision get a risk score from all check results, with high-risk decisions held for human approval (human-in-the-loop) and others released under human supervision (human-on-the-loop)?", guidance: "Combine guard verdicts and integrity state into one score; hold decisions above the band threshold for approval." },
        { id: "rt-6.2", weight: 2, ref: "Art. 9, 27 · Paper §5.3", text: "Are the risk score weights set from the deployment's impact assessment and fixed at certification?", guidance: "Derive weights from the impact assessment, record them in the certification, and change them only through re-certification." },
        { id: "rt-6.3", weight: 2, ref: "Art. 14 · Paper §5.2", text: "Do you measure the missed-referral rate: the share of truly high-risk decisions released without review at a fixed review budget?", guidance: "Audit a random sample of released decisions and report the missed-referral rate at your review budget." }
      ]
    },
    {
      id: "rt-trust", group: "Runtime Assurance", layer: "continuous",
      title: "Trust States & Remediation", articles: "Art. 20, 72, 73 · Paper §5.4",
      description: "Each model has a trust state that limits its autonomy, and a fixed rule decides how to respond to an alarm.",
      evidence: ["Trust-state policy", "Triage and remediation procedure"],
      questions: [
        { id: "rt-7.1", weight: 3, ref: "Paper §5.4, Table 6", text: "Does each deployed model have a trust state (for example Trusted, Degraded, Untrusted) that automatically limits what it may do without review?", guidance: "Define three states: Trusted (normal routing), Degraded (all high-risk actions held, bigger audit sample), Untrusted (every decision withheld and referred)." },
        { id: "rt-7.2", weight: 2, ref: "Paper §5.4", text: "Does the trust state drop as soon as an alarm fires, but rise only one step at a time after a run of clean decisions?", guidance: "Lower trust immediately on any alarm; raise it one level only after N consecutive clean executions." },
        { id: "rt-7.3", weight: 3, ref: "Art. 20 · Paper §5.5.4", text: "Is there a fixed triage rule for alarms: input drift leads to re-certification, a behaviour change without input drift leads to quarantine and rollback, and a rising rejection rate alone leads to threshold recalibration?", guidance: "Document the triage rule: integrity alarm + input shift = re-certify; integrity alarm without input shift = quarantine and roll back; rejection-rate rise only = recalibrate. A human confirms the cause." },
        { id: "rt-7.4", weight: 2, ref: "Paper §5.4-5.5.4", text: "Must a remediated model re-enter in a restricted state and match its signed fingerprint on a clean workload before it regains full autonomy?", guidance: "Re-admit rolled-back models only after they match the signed fingerprint, and start them in the Degraded state." },
        { id: "rt-7.5", weight: 2, ref: "Template T2", text: "Does every remediation need named approvers (at least two)?", guidance: "Require two named approvers for each remediation and record them in the governance log." }
      ]
    },
    {
      id: "rt-recert", group: "Runtime Assurance", layer: "continuous",
      title: "Drift & Safe Re-certification", articles: "Art. 15(4), 43(4), 72 · Paper §5.5.4",
      description: "Thresholds and fingerprints are refreshed when the world changes, without letting attackers loosen them.",
      evidence: ["Drift monitoring report", "Re-certification data screening procedure"],
      questions: [
        { id: "rt-8.1", weight: 2, ref: "Art. 72(2) · Paper §5.5.4", text: "Are drift signals monitored continuously, such as a sustained rise in the rejection rate and a shift in the input distribution?", guidance: "Track the rejection rate with a one-sided CUSUM and input embeddings with an MMD two-sample test." },
        { id: "rt-8.2", weight: 3, ref: "Art. 15(4) · Paper §5.5.4", text: "Is re-certification data screened: labels come only from human reviewers (never from the system's own verdicts), rejected inputs are excluded, and no single source dominates?", guidance: "Build the re-certification set from reviewer-labelled referrals and a uniform audit sample, exclude sanitised inputs, and cap each source's share." },
        { id: "rt-8.3", weight: 2, ref: "Paper §5.5.4", text: "Does loosening a threshold by more than a set margin require a second reviewer?", guidance: "Set a margin for threshold changes and require a second reviewer to approve anything more permissive." }
      ]
    }
  ]
};

/*
 * Threats from the paper's threat model (Table 3) and the questions that address each.
 * A threat counts as covered when the applicable mapped questions are answered "Yes".
 */
window.THREATS = [
  { id: "injection", name: "Prompt injection, jailbreak or evasion", questions: ["rt-2.1", "ar-5"] },
  { id: "scope", name: "Request for an action outside policy", questions: ["rt-2.1", "rt-1.3"] },
  { id: "data", name: "Exposure of sensitive data (input, trace or output)", questions: ["rt-2.3", "dg-6", "ms-2.10"] },
  { id: "discrimination", name: "Discriminatory decision", questions: ["rt-2.2", "dg-3", "dg-4", "ms-2.11"] },
  { id: "ungrounded", name: "Ungrounded or unsupported output", questions: ["rt-2.5", "ar-1"] },
  { id: "unfaithful", name: "Rationale that is not the real reason", questions: ["rt-3.1", "rt-3.2", "tr-1"] },
  { id: "compromised", name: "Compromised or swapped model with plausible outputs", questions: ["rt-4.1", "rt-4.2", "ar-4", "ar-5"] },
  { id: "drift", name: "Drift that erodes the guarantees over time", questions: ["rt-8.1", "rt-8.2", "pm-2", "ms-2.4"] },
  { id: "tamper", name: "Tampering with the audit trail", questions: ["rt-5.1", "rt-5.2", "rk-4"] }
];

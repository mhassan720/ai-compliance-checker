/*
 * Scoring engine. Pure functions, no DOM access, so it can be tested in Node.
 *
 * Answers: "yes" = 1, "partial" = 0.5, "no" = 0, "na" = excluded.
 * Unanswered questions count as "no" and are flagged in the result.
 */
(function (root) {
  var VALUE = { yes: 1, partial: 0.5, no: 0 };
  var LEVELS = ["low", "medium", "high", "critical"];
  var LAYERS = [
    { id: "lifecycle", label: "Lifecycle (on paper)", description: "Documents, processes and tests done before release" },
    { id: "runtime", label: "Runtime (every decision)", description: "Checks enforced automatically on each decision" },
    { id: "human", label: "Human oversight", description: "People who approve, override or stop decisions" },
    { id: "continuous", label: "Continuous (after release)", description: "Monitoring, drift detection and remediation" }
  ];
  var USE_OPTIONS = {};

  function screeningQuestion(id) {
    return (root.SCREENING || []).filter(function (q) { return q.id === id; })[0];
  }

  function useOption(value) {
    if (!USE_OPTIONS[value]) {
      var q = screeningQuestion("sc-use");
      (q ? q.options : []).forEach(function (o) { USE_OPTIONS[o.value] = o; });
    }
    return USE_OPTIONS[value];
  }

  // Works out the EU AI Act risk tier and which obligations apply.
  function profile(s) {
    s = s || {};
    var prohibited = (s["sc-prohibited"] || []).filter(function (v) { return v !== "none"; });
    var use = useOption(s["sc-use"]);
    var basis = [];
    var notes = [];
    var tier;

    if (prohibited.length) {
      tier = "unacceptable";
      basis.push("Ticked " + prohibited.length + " prohibited practice(s) under Art. 5");
    } else if ((use && use.tier === "high") || s["sc-annex1"] === "yes") {
      tier = "high";
      if (use && use.tier === "high") basis.push(use.label + " (" + use.basis + ")");
      if (s["sc-annex1"] === "yes") basis.push("Product or safety component under EU product-safety law (Art. 6(1), Annex I)");
    } else if ((use && use.tier === "limited") || s["sc-interact"] === "yes") {
      tier = "limited";
      basis.push("Interacts with people or generates content (Art. 50 transparency obligations)");
    } else {
      tier = "minimal";
      basis.push("No high-risk use area or prohibited practice identified");
    }

    var role = s["sc-role"] || "provider";
    var highLike = tier === "high" || tier === "unacceptable";
    var flags = {
      transparency: s["sc-interact"] === "yes" || (use && use.tier === "limited") || false,
      gpai: s["sc-gpai"] === "yes",
      fria: highLike && (role === "deployer" || role === "both") && s["sc-public"] === "yes",
      runtime: s["sc-runtime"] === "yes"
    };

    if (s["sc-eu"] === "no") {
      notes.push("You indicated the system is not placed on the EU market or used in the EU. The EU AI Act may not apply; results are shown as best practice.");
    }
    if (tier === "high" && use && use.tier === "high" && s["sc-significant"] === "no" && s["sc-annex1"] !== "yes") {
      notes.push("Art. 6(3) can exempt an Annex III system that poses no significant risk (e.g. a narrow procedural or preparatory task). Document that assessment before relying on it. Systems that profile people are always high-risk.");
    }
    if (tier !== "high" && tier !== "unacceptable" && s["sc-significant"] === "yes") {
      notes.push("The system makes or influences significant decisions about people. Check carefully whether it falls under an Annex III area; if so it is high-risk.");
    }
    if (flags.gpai) {
      notes.push("GPAI model obligations apply. If training compute exceeds 10^25 FLOPs the model is presumed to have systemic risk (Art. 51).");
    }

    return { tier: tier, role: role, basis: basis, notes: notes, flags: flags, prohibited: prohibited };
  }

  // Decides whether a section is mandatory, voluntary, assurance (Runtime Assurance
  // module: beyond the legal minimum), or left out.
  function sectionStatus(section, fwId, prof, includeVoluntary) {
    var highLike = prof.tier === "high" || prof.tier === "unacceptable";
    if (fwId === "rt") return prof.flags.runtime && (highLike || includeVoluntary) ? "assurance" : "excluded";
    if (fwId !== "eu") return "mandatory";
    var applicable;
    switch (section.applies) {
      case "all": applicable = true; break;
      case "high": applicable = highLike; break;
      case "transparency": applicable = prof.flags.transparency; break;
      case "gpai": applicable = prof.flags.gpai; break;
      case "fria": applicable = prof.flags.fria; break;
      default: applicable = true;
    }
    if (applicable && section.roles && section.roles.indexOf(prof.role) === -1) applicable = false;
    if (applicable) return "mandatory";
    // Only high-risk requirements are offered as voluntary best practice.
    if (includeVoluntary && (section.applies === "high" || section.applies === "fria")) return "voluntary";
    return "excluded";
  }

  function frameworkIds(choice) {
    return choice === "both" ? ["eu", "nist"] : [choice];
  }

  // Returns [{ fw, section, status }] for every section that will be asked.
  function plan(state) {
    var prof = profile(state.screening);
    var out = [];
    var ids = frameworkIds(state.framework);
    if (root.FRAMEWORKS.rt) ids = ids.concat("rt");
    ids.forEach(function (fwId) {
      var fw = root.FRAMEWORKS[fwId];
      fw.sections.forEach(function (section) {
        var status = sectionStatus(section, fwId, prof, state.includeVoluntary !== false);
        if (status !== "excluded") out.push({ fw: fw, section: section, status: status });
      });
    });
    return out;
  }

  function shift(level, by) {
    var i = Math.max(0, Math.min(LEVELS.length - 1, LEVELS.indexOf(level) - by));
    return LEVELS[i];
  }

  function severity(weight, status, tier, answer) {
    var highLike = tier === "high" || tier === "unacceptable";
    var level = weight >= 3 ? (highLike ? "critical" : "high")
      : weight === 2 ? (highLike ? "high" : "medium")
      : (highLike ? "medium" : "low");
    if (status === "voluntary") level = shift(level, 2);
    if (status === "assurance") level = shift(level, 1);
    if (answer === "partial") level = shift(level, 1);
    return level;
  }

  function band(score) {
    if (score >= 85) return { id: "strong", label: "Strong" };
    if (score >= 70) return { id: "good", label: "Good" };
    if (score >= 50) return { id: "developing", label: "Developing" };
    return { id: "early", label: "Early stage" };
  }

  function pct(earned, possible) {
    return possible > 0 ? (earned / possible) * 100 : 0;
  }

  function evaluate(state) {
    var prof = profile(state.screening);
    var answers = state.answers || {};
    var items = plan(state);
    var fwTotals = {};
    var sections = [];
    var gaps = [];
    var unanswered = 0;
    var earnedAll = 0;
    var possibleAll = 0;

    items.forEach(function (item) {
      var sec = item.section;
      var s = { fw: item.fw.id, fwName: item.fw.name, id: sec.id, title: sec.title, group: sec.group, articles: sec.articles, layer: sec.layer || "lifecycle",
        status: item.status, evidence: sec.evidence || [], counts: { yes: 0, partial: 0, no: 0, na: 0, unanswered: 0 }, earned: 0, possible: 0 };

      sec.questions.forEach(function (q) {
        var a = answers[q.id];
        if (a === "na" && q.na) { s.counts.na++; return; }
        if (!a || a === "na") { a = "unanswered"; unanswered++; }
        s.counts[a]++;
        var v = VALUE[a] || 0;
        s.earned += v * q.weight;
        s.possible += q.weight;
        if (v < 1) {
          var answerForSeverity = a === "partial" ? "partial" : "no";
          gaps.push({ fw: item.fw.id, fwName: item.fw.name, sectionId: sec.id, section: sec.title, id: q.id, ref: q.ref,
            text: q.text, guidance: q.guidance, weight: q.weight, answer: a, status: item.status,
            severity: severity(q.weight, item.status, prof.tier, answerForSeverity) });
        }
      });

      s.score = s.possible > 0 ? Math.round(pct(s.earned, s.possible)) : null;
      sections.push(s);
      var t = fwTotals[item.fw.id] || (fwTotals[item.fw.id] = { id: item.fw.id, name: item.fw.name, earned: 0, possible: 0 });
      t.earned += s.earned;
      t.possible += s.possible;
      earnedAll += s.earned;
      possibleAll += s.possible;
    });

    var frameworks = Object.keys(fwTotals).map(function (k) {
      var t = fwTotals[k];
      return { id: t.id, name: t.name, score: Math.round(pct(t.earned, t.possible)) };
    });

    var rank = { critical: 0, high: 1, medium: 2, low: 3 };
    gaps.sort(function (a, b) { return rank[a.severity] - rank[b.severity] || b.weight - a.weight; });

    var documents = [];
    sections.forEach(function (s) {
      if (s.status !== "mandatory") return;
      s.evidence.forEach(function (d) {
        var status = s.score === null ? "n/a" : s.score >= 80 ? "in-place" : s.score >= 40 ? "partial" : "missing";
        documents.push({ name: d, section: s.title, fw: s.fwName, status: status });
      });
    });

    var overall = Math.round(pct(earnedAll, possibleAll));
    var counts = { critical: 0, high: 0, medium: 0, low: 0 };
    gaps.forEach(function (g) { counts[g.severity]++; });

    // Where each control is enforced: on paper (lifecycle), on every decision (runtime),
    // by people (human), or after release (continuous).
    var layers = LAYERS.map(function (l) {
      var earned = 0, possible = 0, questions = 0;
      sections.forEach(function (s) {
        if (s.layer !== l.id) return;
        earned += s.earned; possible += s.possible; questions += s.possible ? s.counts.yes + s.counts.partial + s.counts.no + s.counts.unanswered : 0;
      });
      return { id: l.id, label: l.label, description: l.description, questions: questions, weight: possible,
        share: possibleAll ? Math.round(possible / possibleAll * 100) : 0, score: possible ? Math.round(pct(earned, possible)) : null };
    });

    // Threat coverage: a threat is covered when its applicable mapped questions are all "Yes".
    var asked = {};
    items.forEach(function (it) { it.section.questions.forEach(function (q) { asked[q.id] = q; }); });
    var threats = (root.THREATS || []).map(function (t) {
      var ids = t.questions.filter(function (id) { return asked[id] && !(answers[id] === "na" && asked[id].na); });
      var total = 0;
      ids.forEach(function (id) { total += VALUE[answers[id]] || 0; });
      var status = !ids.length ? "not-assessed" : total === ids.length ? "covered" : total > 0 ? "partial" : "open";
      return { id: t.id, name: t.name, status: status, questions: ids,
        missing: ids.filter(function (id) { return answers[id] !== "yes"; }) };
    });

    return {
      generatedAt: new Date().toISOString(),
      framework: state.framework,
      meta: state.meta || {},
      profile: prof,
      overall: overall,
      band: band(overall),
      frameworks: frameworks,
      sections: sections,
      gaps: gaps,
      gapCounts: counts,
      unanswered: unanswered,
      layers: layers,
      threats: threats,
      strengths: sections.filter(function (s) { return s.score !== null && s.score >= 80; }).map(function (s) { return s.title; }),
      documents: documents,
      roadmap: [
        { id: "now", title: "Phase 1: next 30 days", subtitle: "Critical gaps", items: gaps.filter(function (g) { return g.severity === "critical"; }) },
        { id: "soon", title: "Phase 2: 30 to 90 days", subtitle: "High-priority gaps", items: gaps.filter(function (g) { return g.severity === "high"; }) },
        { id: "later", title: "Phase 3: 90 to 180 days", subtitle: "Medium and low gaps", items: gaps.filter(function (g) { return g.severity === "medium" || g.severity === "low"; }) }
      ]
    };
  }

  root.Engine = { profile: profile, plan: plan, evaluate: evaluate, severity: severity, band: band, frameworkIds: frameworkIds, LAYERS: LAYERS };
})(typeof window !== "undefined" ? window : globalThis);

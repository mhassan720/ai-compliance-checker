/*
 * User interface: hash router, views and event handling.
 * State is kept in localStorage under STORAGE_KEY; nothing leaves the browser.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "aicc:v1";
  var FRAMEWORK = "eu";
  var app = document.getElementById("app");
  var state = load();
  var ui = { gapFilter: "all", tab: "overview" };

  // ---------- Persistence ----------
  function blank() {
    return { version: 1, framework: null, screening: {}, answers: {}, notes: {}, meta: { system: "", org: "" }, includeVoluntary: true, screeningDone: false };
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.version === 1) {
          s = Object.assign(blank(), s);
          // Assessments saved by earlier versions may name another framework.
          if (s.framework) s.framework = FRAMEWORK;
          return s;
        }
      }
    } catch (e) { /* storage unavailable: start fresh */ }
    return blank();
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- Helpers ----------
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function screeningComplete() {
    return window.SCREENING.every(function (q) {
      var v = state.screening[q.id];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });
  }
  function answeredIn(section) {
    return section.questions.filter(function (q) { return !!state.answers[q.id]; }).length;
  }
  function totals(items) {
    var total = 0, done = 0;
    items.forEach(function (it) { total += it.section.questions.length; done += answeredIn(it.section); });
    return { total: total, done: done, pct: total ? Math.round(done / total * 100) : 0 };
  }
  function tierLabel(tier) {
    return { unacceptable: "Unacceptable risk (prohibited)", high: "High-risk", limited: "Limited risk", minimal: "Minimal risk" }[tier];
  }
  function fillClass(score) {
    return score >= 80 ? "fill-good" : score >= 60 ? "fill-medium" : score >= 40 ? "fill-high" : "fill-critical";
  }
  function statusChip(status) {
    return status === "voluntary" ? '<span class="chip sev-low">Voluntary best practice</span>' : '<span class="chip sev-good">Applies to you</span>';
  }
  function ring(done, total) {
    var r = 8, c = 2 * Math.PI * r, p = total ? done / total : 0;
    var color = p >= 1 ? "var(--good)" : "var(--accent)";
    return '<svg class="ring" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">' +
      '<circle cx="10" cy="10" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="3"/>' +
      '<circle cx="10" cy="10" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * p).toFixed(2) + " " + c.toFixed(2) + '" transform="rotate(-90 10 10)"/></svg>';
  }
  function download(name, mime, text) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function slug(s) {
    return (s || "ai-system").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-system";
  }

  // ---------- Router ----------
  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/");
    var view = parts[0] || "home";

    if ((view === "screening" || view === "assess" || view === "results") && !state.framework) return go("#/");
    if ((view === "assess" || view === "results") && !state.screeningDone) return go("#/screening");

    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === (view === "about" ? "about" : "home"));
    });

    if (view === "about") renderAbout();
    else if (view === "screening") renderScreening();
    else if (view === "assess") renderAssess(parseInt(parts[1], 10) || 0);
    else if (view === "results") renderResults();
    else renderHome();
  }
  function go(hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  }
  window.addEventListener("hashchange", function () { route(); window.scrollTo(0, 0); });

  // Another tab saved answers: reload them so this tab never writes back stale data.
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    var active = document.activeElement;
    var editing = active && (active.hasAttribute("data-note") || active.hasAttribute("data-meta"));
    state = load();
    if (editing) return; // keep the text field the user is typing in; it re-renders on next navigation
    var y = window.scrollY;
    route();
    window.scrollTo(0, y);
  });

  // ---------- Home ----------
  function renderHome() {
    var hasProgress = state.framework && (state.screeningDone || Object.keys(state.answers).length > 0);
    var html = '<div class="container">' +
      '<section class="hero">' +
      '<span class="chip chip-accent eyebrow">Free · No account needed</span>' +
      "<h1>Check your AI system against the EU AI Act</h1>" +
      '<p class="lead">Classify your AI system\'s risk, answer targeted questions, and get a score, a gap analysis with article references, a remediation roadmap and a document checklist.</p>' +
      '<div class="trust-row"><span>Runs entirely in your browser</span><span>Answers are never uploaded</span><span>Export to PDF, JSON or CSV</span></div>' +
      "</section>";

    if (hasProgress) {
      var items = window.Engine.plan(state);
      var t = state.screeningDone ? totals(items) : { pct: 0 };
      html += '<div class="card resume"><div><b>Continue your assessment</b>' +
        (state.meta.system ? ' for <b>' + esc(state.meta.system) + "</b>" : "") +
        '<div class="muted small">' + (state.screeningDone ? t.pct + "% of questions answered" : "Screening not finished") + "</div></div>" +
        '<div class="btn-row">' +
        (state.screeningDone ? '<a class="btn" href="#/results">View results</a>' : "") +
        '<a class="btn btn-primary" href="' + (state.screeningDone ? "#/assess/" + firstIncomplete(items) : "#/screening") + '">Continue</a>' +
        '<button class="btn btn-ghost" data-action="reset">Start over</button></div></div>';
    }

    html += '<div class="card intro"><span class="kicker">Regulation (EU) 2024/1689</span><h2>EU AI Act assessment</h2>' +
      '<p class="muted">Legally binding rules for AI placed on the EU market or used in the EU, with obligations scaled to risk.</p>' +
      '<ul class="intro-list">' +
      "<li>Risk-tier classification (Art. 5, 6, Annex III)</li>" +
      "<li>Requirements for high-risk systems (Art. 9-17)</li>" +
      "<li>Conformity, registration and post-market monitoring</li>" +
      "<li>Transparency, GPAI and fundamental rights duties</li>" +
      "</ul>" +
      '<div class="intro-meta"><span>Up to 73 questions</span><span>About 25 minutes</span></div>' +
      '<div class="start-bar"><button class="btn btn-primary" data-action="start">' + (hasProgress ? "Open assessment →" : "Start assessment →") + "</button></div></div></div>";
    app.innerHTML = html;
  }

  function firstIncomplete(items) {
    for (var i = 0; i < items.length; i++) if (answeredIn(items[i].section) < items[i].section.questions.length) return i;
    return 0;
  }

  // ---------- Screening ----------
  function screeningQuestionHtml(q, n) {
    var v = state.screening[q.id];
    var answered = Array.isArray(v) ? v.length > 0 : !!v;
    var body = "";
    if (q.type === "yesno") {
      body = '<div class="seg" role="group">' + ["yes", "no"].map(function (a) {
        return '<button type="button" class="a-' + a + '" aria-pressed="' + (v === a) + '" data-action="screen" data-q="' + q.id + '" data-v="' + a + '">' + (a === "yes" ? "Yes" : "No") + "</button>";
      }).join("") + "</div>";
    } else if (q.type === "choice") {
      body = '<div class="options">' + q.options.map(function (o) {
        var c = v === o.value;
        return '<label class="option' + (c ? " checked" : "") + '"><input type="radio" name="' + q.id + '" value="' + o.value + '" data-action="screen-choice" data-q="' + q.id + '"' + (c ? " checked" : "") + "><span>" + esc(o.label) + "</span></label>";
      }).join("") + "</div>";
    } else if (q.type === "multi") {
      var arr = v || [];
      body = '<div class="options">' + q.options.map(function (o) {
        var c = arr.indexOf(o.value) !== -1;
        return '<label class="option' + (c ? " checked" : "") + '"><input type="checkbox" value="' + o.value + '" data-action="screen-multi" data-q="' + q.id + '"' + (c ? " checked" : "") + "><span>" + esc(o.label) + "</span></label>";
      }).join("") + "</div>";
    }
    return '<div class="card q' + (answered ? " answered" : "") + '" id="' + q.id + '"><div class="q-head"><span class="q-num">' + n + '</span><div class="q-body">' +
      '<div class="q-text">' + esc(q.text) + '<span class="chip q-ref">' + esc(q.ref) + "</span></div>" +
      (q.help ? '<div class="q-help">' + esc(q.help) + "</div>" : "") + body + "</div></div></div>";
  }

  function renderScreening() {
    var html = '<div class="container" style="max-width:860px"><div class="page-head">' + stepsHtml(2) +
      '<h1>System screening</h1><p class="muted">These questions classify your system\'s risk tier under the EU AI Act and decide which obligations apply. They are not part of the score.</p></div>' +
      '<div class="card"><div class="fields">' +
      '<div class="field"><label for="m-system">AI system name <span class="muted small">(optional)</span></label><input id="m-system" data-meta="system" value="' + esc(state.meta.system) + '" placeholder="e.g. Loan pre-screening model"></div>' +
      '<div class="field"><label for="m-org">Organisation <span class="muted small">(optional)</span></label><input id="m-org" data-meta="org" value="' + esc(state.meta.org) + '" placeholder="e.g. Acme Ltd"></div>' +
      '</div></div><div class="q-list">' + window.SCREENING.map(function (q, i) { return screeningQuestionHtml(q, i + 1); }).join("") + "</div>" +
      '<div class="card" style="margin-bottom:16px"><label class="toggle"><input type="checkbox" data-action="voluntary"' + (state.includeVoluntary ? " checked" : "") + ">" +
      "<span><b>Include best-practice sections that are not legally required for my tier</b><br><span class=\"muted small\">For example the high-risk requirements when your system is limited or minimal risk. They are marked voluntary and their gaps get a lower priority.</span></span></label></div>" +
      '<div id="tier-preview">' + tierPreviewHtml() + "</div>" +
      '<div class="nav-row" style="margin:20px 0 48px"><a class="btn btn-ghost" href="#/">← Back</a>' +
      '<button class="btn btn-primary" data-action="screen-done"' + (screeningComplete() ? "" : " disabled") + ">Continue to assessment →</button></div></div>";
    app.innerHTML = html;
  }

  function tierPreviewHtml() {
    if (!state.screening["sc-use"]) return "";
    var p = window.Engine.profile(state.screening);
    var items = window.Engine.plan(state);
    var t = totals(items);
    return '<div class="card"><div class="sec-head"><span class="muted small">Preliminary classification</span></div>' +
      '<div class="btn-row" style="margin:6px 0 8px"><span class="tier tier-' + p.tier + '">' + esc(tierLabel(p.tier)) + "</span>" +
      '<span class="muted small">' + items.length + " sections · " + t.total + " questions</span></div>" +
      '<ul class="notes">' + p.basis.concat(p.notes).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul></div>";
  }

  function stepsHtml(active) {
    var names = ["Start", "Screening", "Assessment", "Results"];
    return '<div class="steps">' + names.map(function (n, i) {
      return '<span class="' + (i + 1 === active ? "on" : "") + '">' + (i + 1 < active ? "✓ " : (i + 1) + ". ") + n + "</span>";
    }).join("<span>›</span>") + "</div>";
  }

  // ---------- Assessment ----------
  function renderAssess(index) {
    var items = window.Engine.plan(state);
    if (!items.length) return go("#/screening");
    index = Math.max(0, Math.min(items.length - 1, index));
    var item = items[index];
    var sec = item.section;
    var prof = window.Engine.profile(state.screening);

    var html = '<div class="assess">' +
      '<aside class="card sidebar" id="sidebar">' + sidebarHtml(items, index) + "</aside>" +
      "<div>" +
      '<div id="progress">' + progressHtml(items) + "</div>" +
      '<div class="card profile-strip"><span class="muted small">EU AI Act</span>' +
      '<span class="tier tier-' + prof.tier + '" style="font-size:.82rem;padding:3px 10px">' + esc(tierLabel(prof.tier)) + "</span>" +
      (state.meta.system ? '<span class="chip">' + esc(state.meta.system) + "</span>" : "") +
      '<a class="btn btn-ghost btn-sm" href="#/screening" style="margin-left:auto">Edit screening</a></div>' +
      '<div class="mobile-sections"><label class="visually-hidden" for="sec-select">Section</label><select id="sec-select" class="btn" style="width:100%;justify-content:flex-start" data-action="jump">' +
      items.map(function (it, i) {
        return '<option value="' + i + '"' + (i === index ? " selected" : "") + ">" + (i + 1) + ". " + esc(it.section.title) + " (" + answeredIn(it.section) + "/" + it.section.questions.length + ")</option>";
      }).join("") + "</select></div>" +
      '<div class="sec-head"><span class="chip chip-accent">' + esc(sec.articles) + "</span>" +
      statusChip(item.status) +
      '</div><h2 style="margin-top:8px">' + esc(sec.title) + '</h2><p class="muted">' + esc(sec.description) + "</p>" +
      '<div class="q-list">' + sec.questions.map(function (q, i) { return questionHtml(q, i + 1); }).join("") + "</div>" +
      '<div class="nav-row">' +
      (index > 0 ? '<a class="btn" href="#/assess/' + (index - 1) + '">← ' + esc(items[index - 1].section.title) + "</a>" : '<a class="btn" href="#/screening">← Screening</a>') +
      (index < items.length - 1
        ? '<a class="btn btn-primary" href="#/assess/' + (index + 1) + '">' + esc(items[index + 1].section.title) + " →</a>"
        : '<a class="btn btn-primary" href="#/results">View results →</a>') +
      "</div></div></div>";
    app.innerHTML = html;
  }

  function sidebarHtml(items, index) {
    var html = "", lastGroup = "";
    items.forEach(function (it, i) {
      var g = it.section.group;
      if (g !== lastGroup) { html += "<h4>" + esc(g) + "</h4>"; lastGroup = g; }
      var done = answeredIn(it.section), total = it.section.questions.length;
      html += '<a class="side-link' + (i === index ? " active" : "") + '" href="#/assess/' + i + '">' + ring(done, total) +
        '<span class="t">' + esc(it.section.title) + '</span><span class="n">' + done + "/" + total + "</span></a>";
    });
    return html + '<div style="margin-top:14px"><a class="btn btn-sm" style="width:100%" href="#/results">View results</a></div>';
  }

  function progressHtml(items) {
    var t = totals(items);
    return '<div class="progress-head"><span>' + t.done + " of " + t.total + " answered</span><b>" + t.pct + '%</b></div><div class="progress" style="margin-bottom:16px"><span style="width:' + t.pct + '%"></span></div>';
  }

  function questionHtml(q, n) {
    var a = state.answers[q.id];
    var opts = [["yes", "Yes"], ["partial", "Partially"], ["no", "No"]];
    if (q.na) opts.push(["na", "Not applicable"]);
    var note = state.notes[q.id];
    return '<div class="card q' + (a ? " answered" : "") + '" id="q-' + q.id + '"><div class="q-head"><span class="q-num">' + n + '</span><div class="q-body">' +
      '<div class="q-text">' + esc(q.text) + '<span class="chip q-ref">' + esc(q.ref) + "</span></div>" +
      '<div class="seg" role="group" aria-label="Answer">' + opts.map(function (o) {
        return '<button type="button" class="a-' + o[0] + '" aria-pressed="' + (a === o[0]) + '" data-action="answer" data-q="' + q.id + '" data-v="' + o[0] + '">' + o[1] + "</button>";
      }).join("") + "</div>" +
      '<button type="button" class="note-toggle" data-action="toggle-note" data-q="' + q.id + '">' + (note ? "✎ Evidence / notes" : "+ Add evidence or notes") + "</button>" +
      '<textarea data-note="' + q.id + '" placeholder="Link to the policy, document or test result that supports this answer"' + (note ? "" : " hidden") + ">" + esc(note || "") + "</textarea>" +
      "</div></div></div>";
  }

  function refreshAssessChrome() {
    var m = location.hash.match(/^#\/assess\/(\d+)/);
    var items = window.Engine.plan(state);
    var index = m ? parseInt(m[1], 10) : 0;
    var sb = document.getElementById("sidebar");
    if (sb) sb.innerHTML = sidebarHtml(items, index);
    var pr = document.getElementById("progress");
    if (pr) pr.innerHTML = progressHtml(items);
    var sel = document.getElementById("sec-select");
    if (sel) Array.prototype.forEach.call(sel.options, function (o, i) {
      o.textContent = (i + 1) + ". " + items[i].section.title + " (" + answeredIn(items[i].section) + "/" + items[i].section.questions.length + ")";
    });
  }

  // ---------- Results ----------
  function renderResults() {
    var r = window.Engine.evaluate(state);
    var date = new Date(r.generatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    var p = r.profile;
    var c = 2 * Math.PI * 78;
    var donutColor = r.overall >= 85 ? "var(--good)" : r.overall >= 70 ? "var(--accent)" : r.overall >= 50 ? "var(--medium)" : "var(--critical)";

    var html = '<div class="container results">' +
      '<div class="no-print">' + stepsHtml(4) + "</div>" +
      '<div class="sec-head" style="justify-content:space-between"><div><h1 style="margin-bottom:4px">Assessment results</h1>' +
      '<div class="muted">EU AI Act' + (r.meta.system ? " · " + esc(r.meta.system) : "") + (r.meta.org ? " · " + esc(r.meta.org) : "") + " · " + date + "</div></div>" +
      '<div class="btn-row no-print"><a class="btn btn-sm" href="#/assess/0">Edit answers</a>' +
      '<button class="btn btn-sm" data-action="export-csv">Export CSV</button>' +
      '<button class="btn btn-sm" data-action="export-json">Export JSON</button>' +
      '<button class="btn btn-sm btn-primary" data-action="print">Download PDF</button></div></div>';

    if (p.tier === "unacceptable") {
      html += '<div class="alert alert-critical" style="margin-top:16px"><b>Prohibited practice identified (Art. 5)</b><p style="margin:6px 0 0">You indicated the system does something banned under the EU AI Act. It cannot be placed on the market or used in the EU in that form, whatever its score. Get legal advice and redesign or discontinue the affected functionality.</p></div>';
    }
    if (r.unanswered) {
      html += '<div class="card no-print" style="margin-top:16px;border-color:var(--medium)"><b>' + r.unanswered + " question" + (r.unanswered === 1 ? " is" : "s are") + " unanswered.</b> " +
        '<span class="muted">They are counted as "No" in the score. </span><a href="#/assess/' + firstIncomplete(window.Engine.plan(state)) + '">Answer them</a></div>';
    }

    html += '<div class="res-top"><div class="card score-card">' +
      '<div class="donut"><svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="78" fill="none" stroke="var(--surface-2)" stroke-width="16"/>' +
      '<circle cx="90" cy="90" r="78" fill="none" stroke="' + donutColor + '" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + (c * r.overall / 100).toFixed(1) + " " + c.toFixed(1) + '"/></svg>' +
      '<div class="val"><b>' + r.overall + '%</b><span>overall readiness</span></div></div>' +
      '<span class="chip ' + ({ strong: "sev-good", good: "chip-accent", developing: "sev-medium", early: "sev-critical" })[r.band.id] + '">' + r.band.label + "</span>" +
      "</div>" +
      '<div class="card"><div class="muted small">EU AI Act risk classification</div>' +
      '<div style="margin:6px 0 4px"><span class="tier tier-' + p.tier + '">' + esc(tierLabel(p.tier)) + "</span></div>" +
      '<ul class="notes">' + p.basis.concat(p.notes).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
      '<div class="stat-row">' + ["critical", "high", "medium", "low"].map(function (s) {
        return '<div class="stat sev-' + s + '"><b>' + r.gapCounts[s] + "</b><span>" + s + "</span></div>";
      }).join("") + "</div></div></div>";

    var tabs = [["overview", "Overview"], ["gaps", "Gaps (" + r.gaps.length + ")"], ["roadmap", "Roadmap"], ["documents", "Documents (" + r.documents.length + ")"]];
    if (!tabs.some(function (t) { return t[0] === ui.tab; })) ui.tab = "overview";
    html += '<div class="tabs" role="tablist">' + tabs.map(function (t) {
      return '<button role="tab" aria-selected="' + (ui.tab === t[0]) + '" data-action="tab" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + "</div>";

    html += panel("overview", "Score by category", overviewHtml(r)) +
      panel("gaps", "Gap analysis", gapsHtml(r)) +
      panel("roadmap", "Remediation roadmap", roadmapHtml(r)) +
      panel("documents", "Required documentation", documentsHtml(r));

    html += '<p class="muted small" style="margin-top:28px">This is a self-assessment based on your answers. It is not legal advice and does not replace a conformity assessment or audit.</p>' +
      '<div class="btn-row no-print" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-action="reset">Start a new assessment</button></div></div>';
    app.innerHTML = html;
  }

  function panel(id, title, body) {
    return '<section class="tab-panel" data-panel="' + id + '"' + (ui.tab === id ? "" : " hidden") + '><h2 class="print-only">' + title + "</h2>" + body + "</section>";
  }

  function overviewHtml(r) {
    var html = '<div class="card"><div class="bars">', last = "";
    r.sections.forEach(function (s) {
      if (s.group !== last) { html += '<div class="bar-group">' + esc(s.group) + "</div>"; last = s.group; }
      var score = s.score === null ? 0 : s.score;
      html += '<div class="bar-row"><span class="lbl" title="' + esc(s.title) + '">' + esc(s.title) + (s.status === "voluntary" ? "<small>voluntary</small>" : "") + "</span>" +
        '<div class="bar"><span class="' + fillClass(score) + '" style="width:' + score + '%"></span></div><span class="v">' + (s.score === null ? "n/a" : s.score + "%") + "</span></div>";
    });
    html += "</div></div>";
    if (r.strengths.length) {
      html += '<div class="card" style="margin-top:14px"><h3>Strengths</h3><p class="muted small">Categories at 80% or above.</p><div class="btn-row">' +
        r.strengths.map(function (s) { return '<span class="chip sev-good">✓ ' + esc(s) + "</span>"; }).join("") + "</div></div>";
    }
    return html;
  }

  function gapsHtml(r) {
    if (!r.gaps.length) return '<div class="card empty">No gaps found. Every applicable question was answered "Yes".</div>';
    var f = ui.gapFilter;
    var html = '<div class="filters">' + ["all", "critical", "high", "medium", "low"].map(function (s) {
      var n = s === "all" ? r.gaps.length : r.gapCounts[s];
      return '<button aria-pressed="' + (f === s) + '" data-action="filter" data-sev="' + s + '">' + (s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)) + " (" + n + ")</button>";
    }).join("") + "</div>";
    r.gaps.forEach(function (g) {
      var hidden = f !== "all" && g.severity !== f;
      html += '<div class="card gap" data-sev="' + g.severity + '"' + (hidden ? ' hidden' : "") + '><div class="gap-head">' +
        '<span class="chip sev-' + g.severity + '">' + g.severity.toUpperCase() + "</span>" +
        '<span class="chip">' + esc(g.ref) + '</span><span class="muted small">' + esc(g.section) + "</span>" +
        '<span class="muted small" style="margin-left:auto">Answer: ' + ({ no: "No", partial: "Partially", unanswered: "Not answered" })[g.answer] + "</span></div>" +
        '<div class="gap-text">' + esc(g.text) + '</div><div class="gap-fix"><b>Recommended action:</b> ' + esc(g.guidance) + "</div>" +
        (state.notes[g.id] ? '<div class="gap-note">Your notes: ' + esc(state.notes[g.id]) + "</div>" : "") + "</div>";
    });
    return html;
  }

  function roadmapHtml(r) {
    return '<div class="roadmap">' + r.roadmap.map(function (ph) {
      var shown = ph.items.slice(0, 12);
      return '<div class="card phase"><h3>' + ph.title + '</h3><div class="muted small">' + ph.subtitle + " · " + ph.items.length + " action" + (ph.items.length === 1 ? "" : "s") + "</div>" +
        (ph.items.length ? "<ol>" + shown.map(function (g) {
          return "<li>" + esc(g.guidance) + "<small>" + esc(g.ref) + " · " + esc(g.section) + "</small></li>";
        }).join("") + "</ol>" + (ph.items.length > shown.length ? '<p class="muted small">+ ' + (ph.items.length - shown.length) + " more in the Gaps tab</p>" : "")
          : '<p class="muted small" style="margin-top:12px">Nothing in this phase.</p>') + "</div>";
    }).join("") + "</div>";
  }

  function documentsHtml(r) {
    if (!r.documents.length) return '<div class="card empty">No mandatory documentation for the sections assessed.</div>';
    var label = { "in-place": ["sev-good", "Likely in place"], partial: ["sev-medium", "Partially in place"], missing: ["sev-critical", "Missing"], "n/a": ["", "Not applicable"] };
    return '<div class="card" style="overflow-x:auto"><p class="muted small">Documents and records you should be able to show for the obligations that apply to you. Status is estimated from your answers in the related section.</p>' +
      '<table class="doc-table"><thead><tr><th>Document</th><th>Related requirement</th><th>Status</th></tr></thead><tbody>' +
      r.documents.map(function (d) {
        var l = label[d.status];
        return "<tr><td>" + esc(d.name) + '</td><td class="muted">' + esc(d.section) + '</td><td><span class="chip ' + l[0] + '">' + l[1] + "</span></td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function exportCsv() {
    var r = window.Engine.evaluate(state);
    var rows = [["Severity", "Section", "Reference", "Question", "Answer", "Recommended action", "Notes"]];
    r.gaps.forEach(function (g) { rows.push([g.severity, g.section, g.ref, g.text, g.answer, g.guidance, state.notes[g.id] || ""]); });
    var csv = rows.map(function (row) {
      return row.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    download(slug(state.meta.system) + "-gaps.csv", "text/csv;charset=utf-8", "﻿" + csv);
  }

  function exportJson() {
    var r = window.Engine.evaluate(state);
    download(slug(state.meta.system) + "-assessment.json", "application/json", JSON.stringify({ input: state, result: r }, null, 2));
  }

  // ---------- About ----------
  function renderAbout() {
    app.innerHTML = '<div class="container"><div class="prose page-head">' +
      "<h1>How it works</h1>" +
      '<p class="muted">The checker runs as a static web page. Your answers are saved only in this browser (localStorage) and are never sent anywhere.</p>' +
      "<h2>1. Screening and risk tier</h2>" +
      "<p>Screening answers place the system in an EU AI Act risk tier:</p><ul>" +
      "<li><b>Unacceptable</b>: any Article 5 prohibited practice is ticked.</li>" +
      "<li><b>High-risk</b>: the primary use is an Annex III area (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, justice), or the system is a product or safety component under Annex I product-safety law.</li>" +
      "<li><b>Limited risk</b>: the system interacts with people or generates content (Article 50 transparency duties).</li>" +
      "<li><b>Minimal risk</b>: none of the above.</li></ul>" +
      "<p>The tier, your role (provider or deployer) and the GPAI and FRIA questions decide which sections are mandatory. High-risk requirements can still be included as voluntary best practice for lower tiers.</p>" +
      "<h2>2. Scoring</h2>" +
      "<p>Each question has a weight of 3 (core obligation), 2 (important) or 1 (supporting). Answers score Yes = 1, Partially = 0.5, No = 0. Not applicable is left out, and unanswered counts as No.</p>" +
      '<p class="formula">score = Σ(weight × answer value) ÷ Σ(weight) × 100</p>' +
      "<p>Bands: Strong ≥ 85, Good ≥ 70, Developing ≥ 50, Early stage &lt; 50. Screening answers are not scored.</p>" +
      "<h2>3. Gap severity</h2><ul>" +
      "<li>Weight 3: <b>critical</b> for high-risk systems, otherwise <b>high</b>.</li>" +
      "<li>Weight 2: <b>high</b> for high-risk systems, otherwise <b>medium</b>.</li>" +
      "<li>Weight 1: <b>medium</b> for high-risk systems, otherwise <b>low</b>.</li>" +
      "<li>A Partially answer lowers severity by one level; voluntary sections by two.</li></ul>" +
      "<h2>4. Outputs</h2><ul><li>Overall score and a score per category.</li><li>Gap list with article references and a recommended action for each.</li>" +
      "<li>A three-phase remediation roadmap (30, 90 and 180 days) ordered by severity.</li><li>A checklist of the documents you need to show for each applicable obligation.</li>" +
      "<li>Export as PDF (print), JSON (full data) or CSV (gap list).</li></ul>" +
      "<h2>Source</h2><ul>" +
      '<li><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener">Regulation (EU) 2024/1689 (Artificial Intelligence Act)</a></li></ul>' +
      "<h2>Disclaimer</h2><p>This tool is a self-assessment aid. It does not provide legal advice, and a good score does not certify compliance.</p>" +
      '<p><a class="btn btn-primary" href="#/">Start an assessment</a></p></div></div>';
  }

  // ---------- Events ----------
  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    if (action === "start") {
      state.framework = FRAMEWORK;
      save();
      go(state.screeningDone && screeningComplete() ? "#/assess/" + firstIncomplete(window.Engine.plan(state)) : "#/screening");
    } else if (action === "reset") {
      if (!window.confirm("Clear all answers and start a new assessment?")) return;
      state = blank(); ui.tab = "overview"; ui.gapFilter = "all";
      save(); go("#/");
    } else if (action === "screen") {
      state.screening[el.getAttribute("data-q")] = el.getAttribute("data-v");
      save(); updateScreening(el.getAttribute("data-q"));
    } else if (action === "screen-done") {
      if (!screeningComplete()) return;
      state.screeningDone = true; save(); go("#/assess/0");
    } else if (action === "answer") {
      var q = el.getAttribute("data-q"), v = el.getAttribute("data-v");
      state.answers[q] = state.answers[q] === v ? undefined : v;
      if (!state.answers[q]) delete state.answers[q];
      save();
      var card = document.getElementById("q-" + q);
      card.classList.toggle("answered", !!state.answers[q]);
      card.querySelectorAll("[data-action=answer]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === state.answers[q])); });
      refreshAssessChrome();
    } else if (action === "toggle-note") {
      var ta = document.querySelector('[data-note="' + el.getAttribute("data-q") + '"]');
      ta.hidden = !ta.hidden;
      if (!ta.hidden) ta.focus();
    } else if (action === "tab") {
      ui.tab = el.getAttribute("data-tab");
      document.querySelectorAll("[data-action=tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b === el)); });
      document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== ui.tab; });
    } else if (action === "filter") {
      ui.gapFilter = el.getAttribute("data-sev");
      document.querySelectorAll("[data-action=filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === el)); });
      document.querySelectorAll(".gap[data-sev]").forEach(function (g) { g.hidden = ui.gapFilter !== "all" && g.getAttribute("data-sev") !== ui.gapFilter; });
    } else if (action === "print") {
      window.print();
    } else if (action === "export-csv") {
      exportCsv();
    } else if (action === "export-json") {
      exportJson();
    }
  });

  app.addEventListener("change", function (e) {
    var el = e.target;
    var action = el.getAttribute("data-action");
    if (action === "screen-choice") {
      state.screening[el.getAttribute("data-q")] = el.value;
      save(); updateScreening(el.getAttribute("data-q"));
    } else if (action === "screen-multi") {
      var id = el.getAttribute("data-q");
      var q = window.SCREENING.filter(function (x) { return x.id === id; })[0];
      var exclusive = q.options.filter(function (o) { return o.exclusive; }).map(function (o) { return o.value; });
      var cur = (state.screening[id] || []).slice();
      if (el.checked) {
        cur = exclusive.indexOf(el.value) !== -1 ? [el.value] : cur.filter(function (v) { return exclusive.indexOf(v) === -1; }).concat(el.value);
      } else {
        cur = cur.filter(function (v) { return v !== el.value; });
      }
      state.screening[id] = cur;
      save(); updateScreening(id);
    } else if (action === "voluntary") {
      state.includeVoluntary = el.checked;
      save(); document.getElementById("tier-preview").innerHTML = tierPreviewHtml();
    } else if (action === "jump") {
      go("#/assess/" + el.value);
    }
  });

  app.addEventListener("input", function (e) {
    var el = e.target;
    if (el.hasAttribute("data-meta")) {
      state.meta[el.getAttribute("data-meta")] = el.value; save();
    } else if (el.hasAttribute("data-note")) {
      var id = el.getAttribute("data-note");
      if (el.value.trim()) state.notes[id] = el.value; else delete state.notes[id];
      save();
      var t = document.querySelector('[data-action=toggle-note][data-q="' + id + '"]');
      if (t) t.textContent = el.value.trim() ? "✎ Evidence / notes" : "+ Add evidence or notes";
    }
  });

  // Re-renders one screening card plus the preview, keeping scroll position.
  function updateScreening(id) {
    var ids = window.SCREENING.map(function (q) { return q.id; });
    var q = window.SCREENING.filter(function (x) { return x.id === id; })[0];
    var card = document.getElementById(id);
    if (card && q) {
      var tmp = document.createElement("div");
      tmp.innerHTML = screeningQuestionHtml(q, ids.indexOf(id) + 1);
      card.replaceWith(tmp.firstChild);
    }
    document.getElementById("tier-preview").innerHTML = tierPreviewHtml();
    var btn = document.querySelector("[data-action=screen-done]");
    if (btn) btn.disabled = !screeningComplete();
    if (state.screeningDone && !screeningComplete()) { state.screeningDone = false; save(); }
  }

  document.querySelector("[data-action=toggle-theme]").addEventListener("click", function () {
    var root = document.documentElement;
    var current = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("aicc:theme", next); } catch (e) { /* ignore */ }
  });

  route();
})();

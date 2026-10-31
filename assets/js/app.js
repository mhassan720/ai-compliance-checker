/*
 * User interface: hash router, views and event handling.
 * State is kept in localStorage under STORAGE_KEY; nothing leaves the browser.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "aicc:v1";
  var app = document.getElementById("app");
  var state = load();
  var ui = { gapFilter: "all", tab: "overview", ai: { plan: "", messages: [], busy: "", error: "" } };

  // ---------- Persistence ----------
  function blank() {
    return { version: 1, framework: "eu", screening: {}, answers: {}, notes: {}, meta: { system: "", org: "" }, includeVoluntary: true, screeningDone: false };
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.version === 1) return Object.assign(blank(), s, { framework: "eu" }); }
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
  function screeningIds() {
    return window.SCREENING.map(function (q) { return q.id; });
  }
  function screeningComplete() {
    return screeningIds().every(function (id) {
      var v = state.screening[id];
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
  function groupLabel(fwName, group) {
    return group;
  }
  function statusChip(status) {
    if (status === "voluntary") return '<span class="chip sev-low">Voluntary best practice</span>';
    if (status === "assurance") return '<span class="chip chip-accent">Runtime Assurance · beyond the legal minimum</span>';
    return '<span class="chip sev-good">Applies to you</span>';
  }
  function fwLabel(id) {
    return "EU AI Act";
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
  function aiEnabled() {
    return !!(window.AICC_CONFIG && window.AICC_CONFIG.aiEndpoint);
  }
  // Minimal, safe formatting for AI answers: escape everything, then bold and lists.
  function formatAi(text) {
    var out = [], list = null;
    esc(text).split(/\n/).forEach(function (line) {
      var l = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").trim();
      var m = l.match(/^(\d+)[.)]\s+(.*)$/) || l.match(/^[-*•]\s+(.*)$/);
      var kind = /^\d/.test(l) && m ? "ol" : m ? "ul" : null;
      if (kind) {
        if (!list || list.kind !== kind) { list = { kind: kind, items: [] }; out.push(list); }
        list.items.push(m[m.length - 1]);
      } else {
        list = null;
        if (l) out.push("<p>" + l.replace(/^#+\s*/, "") + "</p>");
      }
    });
    return out.map(function (b) {
      return typeof b === "string" ? b : "<" + b.kind + ">" + b.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</" + b.kind + ">";
    }).join("");
  }
  // The only data sent to the AI service: no system name, organisation or notes.
  function aiContext(r) {
    return {
      framework: fwLabel(r.framework),
      tier: tierLabel(r.profile.tier),
      overall: r.overall,
      scores: r.frameworks.map(function (f) { return f.name + " " + f.score + "%"; }),
      layers: r.layers.map(function (l) { return l.label + " " + (l.score === null ? "n/a" : l.score + "%"); }),
      openThreats: r.threats.filter(function (t) { return t.status === "open" || t.status === "partial"; }).map(function (t) { return t.name; }),
      gaps: r.gaps.slice(0, 15).map(function (g) { return { ref: g.ref, text: g.text, severity: g.severity, section: g.section }; })
    };
  }
  function callAi(path, body) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 90000);
    return fetch(window.AICC_CONFIG.aiEndpoint.replace(/\/$/, "") + path, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.detail || "The AI assistant is not available right now.");
        return data;
      });
    }, function () {
      throw new Error("Could not reach the AI assistant. It may be starting up; try again in a minute.");
    }).finally(function () { clearTimeout(timer); });
  }
  function slug(s) {
    return (s || "ai-system").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-system";
  }

  // ---------- Router ----------
  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/");
    var view = parts[0] || "home";

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
  var CARDS = [
    { kicker: "Step 1", title: "Risk classification", text: "Screening questions place the system in a risk tier and decide which obligations apply.",
      points: ["Prohibited practices (Art. 5)", "High-risk areas (Art. 6, Annex I and III)", "Transparency duties (Art. 50)", "General-purpose AI models (Chapter V)"] },
    { kicker: "Step 2", title: "Obligations questionnaire", text: "Only the questions that apply to your risk tier and role are asked.",
      points: ["Provider and deployer obligations", "Requirements for high-risk systems (Art. 9-17)", "Fundamental rights impact assessment (Art. 27)", "Optional Runtime Assurance module"] },
    { kicker: "Step 3", title: "Results and remediation", text: "A score, a gap analysis with article references and a plan to close the gaps.",
      points: ["Score by obligation area", "Gaps ranked by severity", "30, 90 and 180 day roadmap", "Document checklist and PDF export"] }
  ];

  function renderHome() {
    var hasProgress = state.screeningDone || Object.keys(state.answers).length > 0;
    var html = '<div class="container">' +
      '<section class="hero">' +
      '<span class="chip chip-accent eyebrow">Regulation (EU) 2024/1689 · Free · No account needed</span>' +
      "<h1>EU AI Act compliance checker</h1>" +
      '<p class="lead">Classify your AI system under the EU AI Act, answer the questions that apply to you, and get a score, a gap analysis with article references, a remediation roadmap and a document checklist.</p>' +
      '<div class="trust-row"><span>Runs in your browser</span><span>Your answers stay on your device</span><span>Export to PDF, JSON or CSV</span>' + (aiEnabled() ? "<span>Optional AI assistant</span>" : "") + "</div>" +
      "</section>";

    if (hasProgress) {
      var items = window.Engine.plan(state);
      var t = state.screeningDone ? totals(items) : { pct: 0 };
      html += '<div class="card resume"><div><b>Continue your EU AI Act assessment</b>' +
        (state.meta.system ? ' for <b>' + esc(state.meta.system) + "</b>" : "") +
        '<div class="muted small">' + (state.screeningDone ? t.pct + "% of questions answered" : "Screening not finished") + "</div></div>" +
        '<div class="btn-row">' +
        (state.screeningDone ? '<a class="btn" href="#/results">View results</a>' : "") +
        '<a class="btn btn-primary" href="' + (state.screeningDone ? "#/assess/" + firstIncomplete(items) : "#/screening") + '">Continue</a>' +
        '<button class="btn btn-ghost" data-action="reset">Start over</button></div></div>';
    }

    html += '<h2 style="margin-top:32px">How the assessment works</h2><p class="muted">Up to 73 questions, about 25 minutes. You can stop at any time and continue later.</p>' +
      '<div class="fw-grid">';
    CARDS.forEach(function (c) {
      html += '<div class="card fw-card static">' +
        '<span class="kicker">' + c.kicker + "</span><h3>" + c.title + '</h3><p class="muted small" style="margin:0">' + c.text + "</p>" +
        "<ul>" + c.points.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></div>";
    });
    html += "</div>" +
      '<div class="start-bar"><button class="btn btn-primary" data-action="start">' + (hasProgress ? "Go to screening →" : "Start assessment →") + "</button>" +
      '<span class="muted small">Your answers are saved in this browser only.</span></div></div>';
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
    var ids = screeningIds();
    var qs = window.SCREENING.filter(function (q) { return ids.indexOf(q.id) !== -1; });
    var html = '<div class="container" style="max-width:860px"><div class="page-head">' + stepsHtml(2) +
      "<h1>System screening</h1><p class=\"muted\">" +
      "These questions classify your system's risk tier under the EU AI Act and decide which obligations apply. They are not part of the score." +
      '</p></div><div class="card"><div class="fields">' +
      '<div class="field"><label for="m-system">AI system name <span class="muted small">(optional)</span></label><input id="m-system" data-meta="system" value="' + esc(state.meta.system) + '" placeholder="e.g. Loan pre-screening model"></div>' +
      '<div class="field"><label for="m-org">Organisation <span class="muted small">(optional)</span></label><input id="m-org" data-meta="org" value="' + esc(state.meta.org) + '" placeholder="e.g. Acme Ltd"></div>' +
      '</div></div><div class="q-list">' + qs.map(function (q, i) { return screeningQuestionHtml(q, i + 1); }).join("") + "</div>";

    html += '<div class="card" style="margin-bottom:16px"><label class="toggle"><input type="checkbox" data-action="voluntary"' + (state.includeVoluntary ? " checked" : "") + ">" +
      "<span><b>Include best-practice sections that are not legally required for my tier</b><br><span class=\"muted small\">For example the high-risk requirements when your system is limited or minimal risk. They are marked voluntary and their gaps get a lower priority.</span></span></label></div>";

    html += '<div id="tier-preview">' + tierPreviewHtml() + "</div>" +
      '<div class="nav-row" style="margin:20px 0 48px"><a class="btn btn-ghost" href="#/">← Home</a>' +
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
      '<div class="card profile-strip"><span class="muted small">' + esc(fwLabel(state.framework)) + "</span>" +
      '<span class="tier tier-' + prof.tier + '" style="font-size:.82rem;padding:3px 10px">' + esc(tierLabel(prof.tier)) + "</span>" +
      (state.meta.system ? '<span class="chip">' + esc(state.meta.system) + "</span>" : "") +
      '<a class="btn btn-ghost btn-sm" href="#/screening" style="margin-left:auto">Edit screening</a></div>' +
      '<div class="mobile-sections"><label class="visually-hidden" for="sec-select">Section</label><select id="sec-select" class="btn" style="width:100%;justify-content:flex-start" data-action="jump">' +
      items.map(function (it, i) {
        return '<option value="' + i + '"' + (i === index ? " selected" : "") + ">" + (i + 1) + ". " + esc(it.section.title) + " (" + answeredIn(it.section) + "/" + it.section.questions.length + ")</option>";
      }).join("") + "</select></div>" +
      '<div class="sec-head"><span class="chip chip-accent">' + esc(item.fw.name) + " · " + esc(sec.articles) + "</span>" +
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
      var g = groupLabel(it.fw.name, it.section.group);
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
      '<div class="muted">' + esc(fwLabel(r.framework)) + (r.meta.system ? " · " + esc(r.meta.system) : "") + (r.meta.org ? " · " + esc(r.meta.org) : "") + " · " + date + "</div></div>" +
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
      '<div class="card"><div class="muted small">' + "EU AI Act risk classification" + "</div>" +
      '<div style="margin:6px 0 4px"><span class="tier tier-' + p.tier + '">' + esc(tierLabel(p.tier)) + "</span></div>" +
      '<ul class="notes">' + p.basis.concat(p.notes).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
      (r.frameworks.length > 1 ? '<div class="fw-scores">' + r.frameworks.map(function (f) {
        return '<div class="fw-score"><div class="muted small">' + esc(f.name) + "</div><b>" + f.score + '%</b><div class="bar" style="margin-top:6px"><span class="' + fillClass(f.score) + '" style="width:' + f.score + '%"></span></div></div>';
      }).join("") + "</div>" : "") +
      '<div class="stat-row">' + ["critical", "high", "medium", "low"].map(function (s) {
        return '<div class="stat sev-' + s + '"><b>' + r.gapCounts[s] + "</b><span>" + s + "</span></div>";
      }).join("") + "</div></div></div>";

    var tabs = [["overview", "Overview"], ["coverage", "Coverage"], ["gaps", "Gaps (" + r.gaps.length + ")"], ["roadmap", "Roadmap"], ["documents", "Documents (" + r.documents.length + ")"]];
    if (aiEnabled()) tabs.push(["ai", "AI Assistant"]);
    else if (ui.tab === "ai") ui.tab = "overview";
    html += '<div class="tabs" role="tablist">' + tabs.map(function (t) {
      return '<button role="tab" aria-selected="' + (ui.tab === t[0]) + '" data-action="tab" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + "</div>";

    html += panel("overview", "Score by category", overviewHtml(r)) +
      panel("coverage", "Where your controls are enforced", coverageHtml(r)) +
      panel("gaps", "Gap analysis", gapsHtml(r)) +
      panel("roadmap", "Remediation roadmap", roadmapHtml(r)) +
      panel("documents", "Required documentation", documentsHtml(r)) +
      (aiEnabled() ? panel("ai", "AI remediation plan", '<div id="ai-panel">' + aiHtml() + "</div>") : "");

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
      var g = groupLabel(s.fwName, s.group);
      if (g !== last) { html += '<div class="bar-group">' + esc(g) + "</div>"; last = g; }
      var score = s.score === null ? 0 : s.score;
      html += '<div class="bar-row"><span class="lbl" title="' + esc(s.title) + '">' + esc(s.title) + (s.status === "voluntary" ? "<small>voluntary</small>" : s.status === "assurance" ? "<small>assurance</small>" : "") + "</span>" +
        '<div class="bar"><span class="' + fillClass(score) + '" style="width:' + score + '%"></span></div><span class="v">' + (s.score === null ? "n/a" : s.score + "%") + "</span></div>";
    });
    html += "</div></div>";
    if (r.strengths.length) {
      html += '<div class="card" style="margin-top:14px"><h3>Strengths</h3><p class="muted small">Categories at 80% or above.</p><div class="btn-row">' +
        r.strengths.map(function (s) { return '<span class="chip sev-good">✓ ' + esc(s) + "</span>"; }).join("") + "</div></div>";
    }
    return html;
  }

  function coverageHtml(r) {
    var byId = {};
    r.layers.forEach(function (l) { byId[l.id] = l; });
    var paper = byId.lifecycle, run = byId.runtime;
    var hasRt = r.frameworks.some(function (f) { return f.id === "rt"; });
    var lead = paper.share + "% of what you were assessed on is enforced on paper (documents, processes, tests before release). " +
      (run.score === null ? "Nothing is checked automatically on each decision." :
        "Checks on every decision score " + run.score + "%.");
    var html = '<div class="card"><p style="margin:0"><b>' + esc(lead) + "</b></p>" +
      '<p class="muted small" style="margin:6px 0 0">A checklist shows what is documented. Runtime controls show what is enforced and evidenced on each decision while the system runs.' +
      (hasRt ? "" : ' To assess runtime controls, answer <b>Yes</b> to the screening question about decisions made while the system runs. <a href="#/screening">Edit screening</a>') + "</p></div>";

    html += '<div class="layers">' + r.layers.map(function (l) {
      var sc = l.score === null ? 0 : l.score;
      return '<div class="card layer"><div class="muted small">' + esc(l.description) + "</div><h3>" + esc(l.label) + "</h3>" +
        '<div class="layer-score">' + (l.score === null ? "n/a" : l.score + "%") + "</div>" +
        '<div class="bar"><span class="' + fillClass(sc) + '" style="width:' + sc + '%"></span></div>' +
        '<div class="muted small" style="margin-top:6px">' + l.questions + " questions · " + l.share + "% of total weight</div></div>";
    }).join("") + "</div>";

    var label = { covered: ["sev-good", "Covered"], partial: ["sev-medium", "Partly covered"], open: ["sev-critical", "Not covered"], "not-assessed": ["", "Not assessed"] };
    html += '<div class="card" style="margin-top:14px;overflow-x:auto"><h3>Threat coverage</h3>' +
      '<p class="muted small">Threats a high-risk decision system faces at runtime, and whether your answers cover them. A threat is covered when every related question that applies to you is answered Yes.</p>' +
      '<table class="doc-table"><thead><tr><th>Threat</th><th>Status</th><th>Related questions not yet Yes</th></tr></thead><tbody>' +
      r.threats.map(function (t) {
        var l = label[t.status];
        return "<tr><td>" + esc(t.name) + '</td><td><span class="chip ' + l[0] + '">' + l[1] + '</span></td><td class="muted">' +
          (t.status === "not-assessed" ? "None of its questions apply to this assessment" : t.missing.length ? esc(t.missing.join(", ")) : "None") + "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<p class="muted small" style="margin:10px 0 0">Out of scope for runtime checks: a manipulation that keeps the whole behavioural fingerprint unchanged, a model already compromised before certification, and subversion of the trusted computing base. These need offline attestation.</p></div>';
    return html;
  }

  var AI_SUGGESTIONS = ["Which gap should I fix first, and why?", "Explain my risk classification in simple words", "What evidence will an auditor ask me for?"];

  function aiHtml() {
    var a = ui.ai;
    var html = '<div class="card ai-note no-print"><b>How this works.</b> When you click a button below, your framework, risk level, scores and top 15 gaps are sent to the AI assistant hosted on Hugging Face. ' +
      "Your system name, organisation and notes are never sent, and nothing is stored. AI answers can be wrong; check them before acting.</div>";
    html += '<div class="card" style="margin-top:14px"><div class="sec-head" style="justify-content:space-between"><h3 style="margin:0">Remediation plan</h3>' +
      '<button class="btn btn-sm btn-primary no-print" data-action="ai-plan"' + (a.busy ? " disabled" : "") + ">" + (a.plan ? "Generate again" : "Generate AI plan") + "</button></div>" +
      (a.busy === "plan" ? '<p class="muted ai-wait">Writing your plan. This can take up to a minute…</p>' : "") +
      (a.plan ? '<div class="ai-text">' + formatAi(a.plan) + "</div>" : a.busy ? "" : '<p class="muted small" style="margin:8px 0 0">A step-by-step plan for your gaps, with article references and timeframes.</p>') +
      "</div>";
    html += '<div class="card no-print" style="margin-top:14px"><h3>Ask about your result</h3><div class="chat" id="chat-log">' +
      (a.messages.length ? a.messages.map(function (m) {
        return '<div class="msg msg-' + m.role + '">' + (m.role === "user" ? esc(m.content) : formatAi(m.content)) + "</div>";
      }).join("") : '<div class="btn-row">' + AI_SUGGESTIONS.map(function (s) {
        return '<button class="chip suggest" data-action="ai-suggest" data-text="' + esc(s) + '">' + esc(s) + "</button>";
      }).join("") + "</div>") +
      (a.busy === "chat" ? '<div class="msg msg-assistant muted ai-wait">Thinking…</div>' : "") + "</div>" +
      '<div class="chat-input"><input id="ai-input" type="text" maxlength="2000" placeholder="Ask a question about your gaps or obligations"' + (a.busy ? " disabled" : "") + ">" +
      '<button class="btn btn-primary" data-action="ai-send"' + (a.busy ? " disabled" : "") + ">Send</button></div></div>";
    if (a.error) html += '<div class="alert alert-critical no-print" style="margin-top:14px">' + esc(a.error) + "</div>";
    return html;
  }

  function refreshAi() {
    var el = document.getElementById("ai-panel");
    if (!el) return;
    el.innerHTML = aiHtml();
    var log = document.getElementById("chat-log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  function aiPlan() {
    var r = window.Engine.evaluate(state);
    ui.ai.busy = "plan"; ui.ai.error = ""; refreshAi();
    callAi("/plan", { context: aiContext(r) }).then(function (d) { ui.ai.plan = d.plan || ""; },
      function (e) { ui.ai.error = e.message; }).finally(function () { ui.ai.busy = ""; refreshAi(); });
  }

  function aiSend(text) {
    text = (text || "").trim();
    if (!text || ui.ai.busy) return;
    var r = window.Engine.evaluate(state);
    ui.ai.messages.push({ role: "user", content: text.slice(0, 2000) });
    ui.ai.busy = "chat"; ui.ai.error = ""; refreshAi();
    callAi("/chat", { context: aiContext(r), messages: ui.ai.messages.slice(-12) }).then(function (d) {
      ui.ai.messages.push({ role: "assistant", content: d.reply || "" });
    }, function (e) {
      ui.ai.messages.pop();
      ui.ai.error = e.message;
    }).finally(function () { ui.ai.busy = ""; refreshAi(); var i = document.getElementById("ai-input"); if (i) i.focus(); });
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
        '<span class="chip">' + esc(g.ref) + '</span><span class="muted small">' + (g.fw === "rt" ? "Runtime Assurance · " : "") + esc(g.section) + "</span>" +
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
        return "<tr><td>" + esc(d.name) + '</td><td class="muted">' + esc(d.fw) + " · " + esc(d.section) + '</td><td><span class="chip ' + l[0] + '">' + l[1] + "</span></td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function exportCsv() {
    var r = window.Engine.evaluate(state);
    var rows = [["Severity", "Framework", "Section", "Reference", "Question", "Answer", "Recommended action", "Notes"]];
    r.gaps.forEach(function (g) { rows.push([g.severity, g.fwName, g.section, g.ref, g.text, g.answer, g.guidance, state.notes[g.id] || ""]); });
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
      "<h2>4. Runtime Assurance module</h2>" +
      "<p>A checklist shows what is documented, not what the system actually does on each decision. When you answer Yes to the screening question about decisions made while the system runs, 33 extra questions check whether the obligations of Articles 10, 12, 13, 14 and 15 are enforced and evidenced on every decision:</p><ul>" +
      "<li><b>Per-decision guards</b>: input screening, counterfactual non-discrimination, data minimisation, precondition proof and groundedness.</li>" +
      "<li><b>Reasoning faithfulness</b>: the stated reasons must be the reasons that produced the decision.</li>" +
      "<li><b>Model integrity attestation</b>: the running model must behave like the model that was approved.</li>" +
      "<li><b>Tamper-evident audit trail</b>, <b>risk routing</b> to human oversight, <b>trust states</b> with a fixed remediation rule, and <b>safe re-certification</b> after drift.</li></ul>" +
      "<p>These questions go beyond the legal minimum, so their gaps are rated one level lower than legal gaps. The <b>Coverage</b> tab shows how much of your compliance is enforced on paper, on every decision, by people, and after release, and which runtime threats remain open.</p>" +
      "<p class=\"small muted\">Method based on: M. Hassan, B. Sardar, S. Islam, S. Silvestri, F. Fiori, D. Di Stasio, D. Amelin, <i>Governing High-Risk AI at Runtime: Reasoning Guards, Behavioural Attestation and Trust-Based Remediation</i>.</p>" +
      (aiEnabled() ? "<h2>AI assistant (optional)</h2><p>On the results page, the AI Assistant tab can write a remediation plan and answer questions about your result. It runs on a Hugging Face Space using the open Qwen 2.5 model. " +
        "Only when you click a button, it receives your framework, risk level, scores and top 15 gaps. Your system name, organisation and notes are never sent, and the service stores nothing. AI answers can be wrong; check them before acting.</p>" : "") +
      "<h2>5. Outputs</h2><ul><li>Overall score and a score per obligation area.</li><li>Gap list with article references and a recommended action for each.</li>" +
      "<li>A three-phase remediation roadmap (30, 90 and 180 days) ordered by severity.</li><li>A checklist of the documents you need to show for each applicable obligation.</li>" +
      "<li>Export as PDF (print), JSON (full data) or CSV (gap list).</li></ul>" +
      "<h2>Sources</h2><ul>" +
      '<li><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener">Regulation (EU) 2024/1689 (Artificial Intelligence Act)</a></li>' +
      "</ul>" +
      "<h2>Disclaimer</h2><p>This tool is a self-assessment aid. It does not provide legal advice, and a good score does not certify compliance.</p>" +
      '<p><a class="btn btn-primary" href="#/">Start an assessment</a></p></div></div>';
  }

  // ---------- Events ----------
  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    if (action === "start") {
      state.framework = "eu";
      save();
      go(state.screeningDone && screeningComplete() ? "#/assess/0" : "#/screening");
    } else if (action === "reset") {
      if (!window.confirm("Clear all answers and start a new assessment?")) return;
      state = blank(); ui.tab = "overview"; ui.gapFilter = "all"; ui.ai = { plan: "", messages: [], busy: "", error: "" };
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
    } else if (action === "ai-plan") {
      aiPlan();
    } else if (action === "ai-send") {
      var input = document.getElementById("ai-input");
      aiSend(input && input.value);
    } else if (action === "ai-suggest") {
      aiSend(el.getAttribute("data-text"));
    } else if (action === "print") {
      window.print();
    } else if (action === "export-csv") {
      exportCsv();
    } else if (action === "export-json") {
      exportJson();
    }
  });

  app.addEventListener("keydown", function (e) {
    if (e.target.id === "ai-input" && e.key === "Enter") { e.preventDefault(); aiSend(e.target.value); }
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
    var ids = screeningIds();
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

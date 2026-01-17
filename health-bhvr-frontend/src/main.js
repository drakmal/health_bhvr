const API_BASE = "http://localhost:3000";

document.querySelector("#app").innerHTML = `
  <div style="max-width:520px;margin:24px auto;font-family:system-ui;padding:16px;">
    <h2 style="margin-bottom:6px;">Health Behaviour Self-Check</h2>
    <p style="margin-top:0;color:#555;">Self-fill questionnaire. Get personalised advice instantly.</p>

    <label><b>Age group</b></label><br/>
    <select id="age_group" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="18-25">18-25</option>
      <option value="26-44">26-44</option>
      <option value="45-60">45-60</option>
      <option value=">60">&gt;60</option>
    </select>

    <label><b>Sex</b></label><br/>
    <select id="sex" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>

    <label><b>District</b></label><br/>
    <input id="district" placeholder="e.g., Muallim" style="width:100%;padding:10px;margin:6px 0 12px;" value="Muallim"/>

    <label><b>Community</b></label><br/>
    <input id="community" placeholder="e.g., Kampung / Workplace" style="width:100%;padding:10px;margin:6px 0 12px;" value="Proton City"/>

    <hr style="margin:18px 0;"/>

    <h3 style="margin:0 0 10px;">Smoking</h3>

    <label><b>Smoking status</b></label><br/>
    <select id="smoking_status" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="never">Never</option>
      <option value="ex">Ex-smoker</option>
      <option value="sometimes">Sometimes</option>
      <option value="daily">Daily</option>
    </select>

    <label><b>Time to first cigarette after waking</b></label><br/>
    <select id="smoking_ttfc" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="within_5">Within 5 minutes</option>
      <option value="6_30">6–30 minutes</option>
      <option value="31_60">31–60 minutes</option>
      <option value="after_60">After 60 minutes</option>
    </select>

    <label><b>Cigarettes per day</b></label><br/>
    <select id="smoking_cigs_per_day" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="1_10">1–10</option>
      <option value="11_20">11–20</option>
      <option value="21_30">21–30</option>
      <option value="31_plus">31+</option>
    </select>

    <label><b>Intention to quit</b></label><br/>
    <select id="smoking_intention" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="no_6mo">No plan within 6 months</option>
      <option value="yes_6mo">Plan within 6 months</option>
      <option value="yes_30d">Plan within 30 days</option>
      <option value="already_quit">Already quit</option>
    </select>

    <label><b>Quit attempt in last 12 months?</b></label><br/>
    <select id="smoking_attempt_12m" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>

    <hr style="margin:18px 0;"/>

    <h3 style="margin:0 0 10px;">Alcohol (AUDIT-C)</h3>

    <label><b>Q1 score (0–4)</b></label><br/>
    <input id="auditc_q1" type="number" min="0" max="4" value="0" style="width:100%;padding:10px;margin:6px 0 12px;" />

    <label><b>Q2 score (0–4)</b></label><br/>
    <input id="auditc_q2" type="number" min="0" max="4" value="0" style="width:100%;padding:10px;margin:6px 0 12px;" />

    <label><b>Q3 score (0–4)</b></label><br/>
    <input id="auditc_q3" type="number" min="0" max="4" value="0" style="width:100%;padding:10px;margin:6px 0 12px;" />

    <label><b>Intention to reduce alcohol</b></label><br/>
    <select id="alcohol_intention" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="no_6mo">No plan within 6 months</option>
      <option value="yes_6mo">Plan within 6 months</option>
      <option value="yes_30d">Plan within 30 days</option>
      <option value="already_reduced">Already reduced</option>
    </select>

    <label><b>Cut down in last 3 months?</b></label><br/>
    <select id="alcohol_cutdown_3m" style="width:100%;padding:10px;margin:6px 0 12px;">
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>

    <button id="submitBtn" style="width:100%;padding:12px;font-weight:700;margin-top:8px;">
      Submit & Get Advice
    </button>

    <div id="status" style="margin-top:12px;color:#555;"></div>

    <div id="output" style="margin-top:16px;padding:12px;border:1px solid #ddd;border-radius:8px;display:none;">
      <h3 style="margin:0 0 8px;">Your Personalised Plan</h3>
      <div id="outputText"></div>
    </div>
  </div>
`;

function showError(msg) {
  document.querySelector("#status").style.color = "crimson";
  document.querySelector("#status").textContent = msg;
}

function showStatus(msg) {
  document.querySelector("#status").style.color = "#555";
  document.querySelector("#status").textContent = msg;
}

function renderOutput(tailored) {
  const out = document.querySelector("#output");
  const outText = document.querySelector("#outputText");
  out.style.display = "block";

  const parts = [];

  // ✅ Overall clinic-ready recommendation
  if (tailored.overall) {
    parts.push(`
      <div style="margin-bottom:14px;padding:12px;border:1px solid #ddd;border-radius:8px;">
        <b>Overall Recommendation</b><br/>
        Risk: <b>${tailored.overall.overallRisk}</b><br/>
        Next step: ${tailored.overall.nextStep}<br/>
        Urgency: <b>${tailored.overall.urgency}</b><br/>
        <div style="margin-top:8px;"><b>Referral:</b> ${tailored.overall.referral}</div>
      </div>
    `);
  }

  // ✅ Smoking block
  if (tailored.smoking) {
    parts.push(`
      <div style="margin-bottom:14px;padding:12px;border:1px solid #ddd;border-radius:8px;">
        <b>${tailored.smoking.title}</b><br/>
        Score: ${tailored.smoking.score} | ${tailored.smoking.riskLabel}<br/>
        Stage: ${tailored.smoking.stage}<br/>
        <div style="margin-top:6px;"><b>Urgency:</b> ${tailored.smoking.urgency || "Routine"}</div>
        <div style="margin-top:6px;"><b>Referral:</b> ${tailored.smoking.referral || "-"}</div>
        <div style="margin-top:8px;">
          <ul>${tailored.smoking.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
        </div>
      </div>
    `);
  }

  // ✅ Alcohol block
  if (tailored.alcohol) {
    parts.push(`
      <div style="margin-bottom:14px;padding:12px;border:1px solid #ddd;border-radius:8px;">
        <b>${tailored.alcohol.title}</b><br/>
        Score: ${tailored.alcohol.score} | ${tailored.alcohol.riskLabel}<br/>
        Stage: ${tailored.alcohol.stage}<br/>
        <div style="margin-top:6px;"><b>Urgency:</b> ${tailored.alcohol.urgency || "Routine"}</div>
        <div style="margin-top:6px;"><b>Referral:</b> ${tailored.alcohol.referral || "-"}</div>
        <div style="margin-top:8px;">
          <ul>${tailored.alcohol.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
        </div>
      </div>
    `);
  }

  outText.innerHTML = parts.join("");
}

document.querySelector("#submitBtn").addEventListener("click", async () => {
  try {
    showStatus("Submitting...");

    const body = {
      age_group: document.querySelector("#age_group").value,
      sex: document.querySelector("#sex").value,
      district: document.querySelector("#district").value,
      community: document.querySelector("#community").value,
      language: "EN",

      smoking_status: document.querySelector("#smoking_status").value,
      smoking_ttfc: document.querySelector("#smoking_ttfc").value,
      smoking_cigs_per_day: document.querySelector("#smoking_cigs_per_day").value,
      smoking_intention: document.querySelector("#smoking_intention").value,
      smoking_attempt_12m: document.querySelector("#smoking_attempt_12m").value,

      auditc_q1: Number(document.querySelector("#auditc_q1").value || 0),
      auditc_q2: Number(document.querySelector("#auditc_q2").value || 0),
      auditc_q3: Number(document.querySelector("#auditc_q3").value || 0),
      alcohol_intention: document.querySelector("#alcohol_intention").value,
      alcohol_cutdown_3m: document.querySelector("#alcohol_cutdown_3m").value
    };

    const res = await fetch(`${API_BASE}/api/submit-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const json = await res.json();

    if (!res.ok) throw new Error(json?.error || "Submission failed");

    showStatus("✅ Submitted. Advice generated.");
    renderOutput(json.tailored_output);
  } catch (err) {
    console.error(err);
    showError(`❌ ${err.message || err}`);
  }
});

// src/scoring.js

export function computeSmokingScore({
  smoking_status,
  smoking_ttfc,
  smoking_cigs_per_day,
  ttfcMap,
  cigsMap
}) {
  if (!["daily", "sometimes"].includes(smoking_status)) return 0;

  const ttfcScore = ttfcMap[smoking_ttfc] ?? 0;
  const cigsScore = cigsMap[smoking_cigs_per_day] ?? 0;

  return ttfcScore + cigsScore; // 0–6
}

export function smokingDependenceLevel(score) {
  if (score <= 1) return "low";
  if (score <= 3) return "moderate";
  return "high";
}

export function computeAuditCScore({ auditc_q1, auditc_q2, auditc_q3 }) {
  return (auditc_q1 ?? 0) + (auditc_q2 ?? 0) + (auditc_q3 ?? 0); // 0–12
}

export function alcoholRiskLevel({ score, sex }) {
  // Pragmatic triage thresholds:
  // Women: >=3 risky
  // Men: >=4 risky
  // Any: >=8 very high
  if (score >= 8) return "very_high";

  const isFemale = String(sex).toLowerCase() === "female";
  const threshold = isFemale ? 3 : 4;

  if (score >= threshold) return "risky";
  return score === 0 ? "none" : "low";
}

export function determineStage({ intention, attemptRecent, quitDuration }) {
  // intention: no_6mo | yes_6mo | yes_30d | already_quit/already_reduced
  // attemptRecent: yes/no (can be null)
  // quitDuration: <6m | >=6m (can be null)

  if (intention === "no_6mo") return "precontemplation";
  if (intention === "yes_6mo") return "contemplation";
  if (intention === "yes_30d") return "preparation";

  if (intention === "already_quit" || intention === "already_reduced") {
    if (quitDuration === ">=6m") return "maintenance";
    return "action";
  }

  if (attemptRecent === "yes") return "preparation";
  return "contemplation";
}

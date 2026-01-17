// src/tailoring.js

const TEXT = {
  EN: {
    smoking: {
      title: "Smoking",
      risk: { low: "Low dependence", moderate: "Moderate dependence", high: "High dependence" }
    },
    alcohol: {
      title: "Alcohol",
      risk: { none: "No alcohol use", low: "Low risk", risky: "Risky drinking", very_high: "Very high risk" }
    },
    stageLabel: {
      precontemplation: "Precontemplation",
      contemplation: "Contemplation",
      preparation: "Preparation",
      action: "Action",
      maintenance: "Maintenance"
    }
  },
  BM: {
    smoking: {
      title: "Merokok",
      risk: { low: "Kebergantungan rendah", moderate: "Kebergantungan sederhana", high: "Kebergantungan tinggi" }
    },
    alcohol: {
      title: "Alkohol",
      risk: { none: "Tidak mengambil alkohol", low: "Risiko rendah", risky: "Minum berisiko", very_high: "Risiko sangat tinggi" }
    },
    stageLabel: {
      precontemplation: "Pra-renungan",
      contemplation: "Renungan",
      preparation: "Persediaan",
      action: "Tindakan",
      maintenance: "Pengekalan"
    }
  }
};

function bulletsForSmoking({ depLevel, stage, triggers, lang }) {
  const base = [];

  if (stage === "precontemplation") {
    base.push(lang === "BM" ? "Tidak mengapa jika belum bersedia." : "It’s okay if you’re not ready yet.");
    base.push(lang === "BM" ? "Langkah kecil: kenal pasti pencetus minggu ini." : "Small step: notice your triggers this week.");
  } else if (stage === "contemplation") {
    base.push(lang === "BM" ? "Anda sedang mempertimbangkan perubahan." : "You’re considering change.");
    base.push(lang === "BM" ? "Pilih 1 sebab paling bermakna (kesihatan/keluarga/duit)." : "Pick 1 reason that matters most (health/family/money).");
  } else if (stage === "preparation") {
    base.push(lang === "BM" ? "Tetapkan tarikh berhenti dalam 30 hari." : "Set a quit date within 30 days.");
    base.push(lang === "BM" ? "Buang rokok/pemetik api dari beg & kereta." : "Remove cigarettes/lighters from your bag & car.");
  } else if (stage === "action") {
    base.push(lang === "BM" ? "Anda sudah bermula. Lindungi kemajuan anda." : "You’ve started. Protect your progress.");
    base.push(lang === "BM" ? "Jika tergelincir, mula semula segera." : "If you slip, restart immediately.");
  } else if (stage === "maintenance") {
    base.push(lang === "BM" ? "Tahniah, anda kekal konsisten." : "Well done staying consistent.");
    base.push(lang === "BM" ? "Sediakan pelan bila stres atau bersama rakan." : "Keep a plan for stress or social triggers.");
  }

  if (depLevel === "moderate") {
    base.push(lang === "BM" ? "Sokongan klinik boleh bantu tingkatkan peluang berjaya." : "Clinic support can improve success.");
  }
  if (depLevel === "high") {
    base.push(lang === "BM" ? "Skor menunjukkan kebergantungan tinggi, bantuan profesional disarankan." : "High dependence; professional support is recommended.");
    base.push(lang === "BM" ? "Pertimbangkan program MQuit di Klinik Kesihatan." : "Consider MQuit support at Klinik Kesihatan.");
  }

  const trg = Array.isArray(triggers) ? triggers : [];
  if (trg.includes("stress")) {
    base.push(lang === "BM" ? "Bila stres: nafas dalam 1 minit + air kosong." : "When stressed: 1-minute breathing + water.");
  }
  if (trg.includes("after_meals")) {
    base.push(lang === "BM" ? "Selepas makan: gosok gigi / kunyah gula-gula getah." : "After meals: brush teeth or chew gum.");
  }

  return base.slice(0, 5);
}

function bulletsForAlcohol({ riskLevel, stage, lang }) {
  const base = [];

  if (riskLevel === "none") {
    base.push(lang === "BM" ? "Teruskan gaya hidup sihat." : "Keep up the healthy routine.");
    return base;
  }

  if (stage === "precontemplation") {
    base.push(lang === "BM" ? "Tidak mengapa jika belum mahu berubah." : "It’s okay if you’re not ready yet.");
    base.push(lang === "BM" ? "Langkah kecil: catat hari minum untuk 1 minggu." : "Small step: track your drinking days for 1 week.");
  } else if (stage === "contemplation") {
    base.push(lang === "BM" ? "Anda sedang mempertimbangkan untuk kurangkan." : "You’re thinking about cutting down.");
    base.push(lang === "BM" ? "Cuba tambah hari tanpa alkohol setiap minggu." : "Add alcohol-free days each week.");
  } else if (stage === "preparation") {
    base.push(lang === "BM" ? "Tetapkan had: hari/minggu dan jumlah setiap sesi." : "Set a limit: days/week and drinks/session.");
    base.push(lang === "BM" ? "Rancang alternatif untuk aktiviti sosial." : "Plan alternatives for social occasions.");
  } else if (stage === "action") {
    base.push(lang === "BM" ? "Kemajuan bagus. Elakkan pencetus berulang." : "Great progress. Avoid repeat triggers.");
  } else if (stage === "maintenance") {
    base.push(lang === "BM" ? "Terus kekalkan had yang selamat." : "Maintain your safer limits.");
  }

  if (riskLevel === "risky") {
    base.push(lang === "BM" ? "Skor menunjukkan minum berisiko — kurangkan secara berperingkat." : "Risky drinking — reduce gradually.");
  }

  if (riskLevel === "very_high") {
    base.push(lang === "BM" ? "Skor sangat tinggi — penilaian klinik disarankan." : "Very high score — clinical assessment recommended.");
    base.push(lang === "BM" ? "Pertimbangkan jumpa Klinik Kesihatan untuk sokongan." : "Consider Klinik Kesihatan support.");
  }

  return base.slice(0, 5);
}

// ✅ NEW: referral + urgency logic
function smokingReferralUrgency({ smoking, lang }) {
  if (!smoking || smoking.status === "never") {
    return { urgency: null, referral: null };
  }

  if (smoking.dependenceLevel === "high") {
    return {
      urgency: lang === "BM" ? "Keutamaan (minggu ini)" : "Prioritised (this week)",
      referral: lang === "BM" ? "Rujuk Klinik Kesihatan (MQuit)" : "Refer Klinik Kesihatan (MQuit)"
    };
  }

  if (smoking.dependenceLevel === "moderate") {
    return {
      urgency: lang === "BM" ? "Disaran (dalam 2 minggu)" : "Recommended (within 2 weeks)",
      referral: lang === "BM" ? "Pertimbangkan sokongan MQuit" : "Consider MQuit support"
    };
  }

  return {
    urgency: lang === "BM" ? "Rutin" : "Routine",
    referral: lang === "BM" ? "Pendidikan kesihatan & pemantauan" : "Health education & monitoring"
  };
}

function alcoholReferralUrgency({ alcohol, lang }) {
  if (!alcohol) return { urgency: null, referral: null };

  if (alcohol.riskLevel === "very_high") {
    return {
      urgency: lang === "BM" ? "Keutamaan (minggu ini)" : "Prioritised (this week)",
      referral: lang === "BM" ? "Rujuk Klinik Kesihatan untuk penilaian" : "Refer Klinik Kesihatan for clinical assessment"
    };
  }

  if (alcohol.riskLevel === "risky") {
    return {
      urgency: lang === "BM" ? "Disaran (dalam 2 minggu)" : "Recommended (within 2 weeks)",
      referral: lang === "BM" ? "Kaunseling pengurangan alkohol" : "Brief counselling to cut down"
    };
  }

  if (alcohol.riskLevel === "none") {
    return {
      urgency: lang === "BM" ? "Rutin" : "Routine",
      referral: lang === "BM" ? "Tiada rujukan diperlukan" : "No referral needed"
    };
  }

  return {
    urgency: lang === "BM" ? "Rutin" : "Routine",
    referral: lang === "BM" ? "Pendidikan kesihatan & pemantauan" : "Health education & monitoring"
  };
}

function smokingUrgencyAndReferral({ depLevel, stage, lang }) {
  // urgency rules (simple + practical)
  let urgency = "Routine";
  if (depLevel === "high") urgency = "Prioritised (this week)";
  if (stage === "action" || stage === "preparation") urgency = "Prioritised (this week)";

  // referral rules
  let referral = "-";
  if (depLevel === "high") {
    referral = lang === "BM"
      ? "Rujuk Klinik Kesihatan (MQuit)"
      : "Refer Klinik Kesihatan (MQuit)";
  } else if (depLevel === "moderate") {
    referral = lang === "BM"
      ? "Pertimbangkan sokongan Klinik Kesihatan"
      : "Consider Klinik Kesihatan support";
  }

  return { urgency, referral };
}

function alcoholUrgencyAndReferral({ riskLevel, stage, lang }) {
  let urgency = "Routine";

  if (riskLevel === "very_high") urgency = "Urgent (within 1–3 days)";
  else if (riskLevel === "risky") urgency = "Prioritised (this week)";
  else if (stage === "action" || stage === "preparation") urgency = "Prioritised (this week)";

  let referral = "-";
  if (riskLevel === "very_high") {
    referral = lang === "BM"
      ? "Rujuk Klinik Kesihatan untuk penilaian klinik"
      : "Refer Klinik Kesihatan for clinical assessment";
  } else if (riskLevel === "risky") {
    referral = lang === "BM"
      ? "Pertimbangkan kaunseling pengurangan alkohol (Klinik Kesihatan)"
      : "Consider brief counselling (Klinik Kesihatan)";
  }

  return { urgency, referral };
}

function computeUrgencySmoking(depLevel) {
  if (depLevel === "high") return "Prioritised (this week)";
  if (depLevel === "moderate") return "Soon (within 2–4 weeks)";
  return "Routine";
}

function computeReferralSmoking(depLevel, referralLinks = {}) {
  if (depLevel === "high") return referralLinks.mquit ? "MQuit (Klinik Kesihatan)" : "MQuit (Klinik Kesihatan)";
  if (depLevel === "moderate") return referralLinks.clinic ? "Klinik Kesihatan (brief support)" : "Klinik Kesihatan (brief support)";
  return "-";
}

function computeUrgencyAlcohol(riskLevel) {
  if (riskLevel === "very_high") return "Prioritised (this week)";
  if (riskLevel === "risky") return "Soon (within 2–4 weeks)";
  return "Routine";
}

function computeReferralAlcohol(riskLevel, referralLinks = {}) {
  if (riskLevel === "very_high") return referralLinks.clinic ? "Klinik Kesihatan (medical assessment)" : "Klinik Kesihatan (medical assessment)";
  if (riskLevel === "risky") return referralLinks.clinic ? "Klinik Kesihatan (brief intervention)" : "Klinik Kesihatan (brief intervention)";
  return "-";
}


export function generateTailoredOutput({ lang = "EN", smoking, alcohol, referralLinks = {} }) {
  const L = TEXT[lang] ?? TEXT.EN;

  const output = {
    lang,
    summary: [],
    smoking: null,
    alcohol: null,
    referrals: {
      clinic: referralLinks.clinic ?? null,
      mquit: referralLinks.mquit ?? null
    }
  };

// ✅ Smoking
if (smoking && smoking.status !== "never") {
  const smokeRU = smokingReferralUrgency({ smoking, lang });

  output.smoking = {
    title: L.smoking.title,
    score: smoking.score,
    riskLabel: L.smoking.risk[smoking.dependenceLevel] ?? smoking.dependenceLevel,
    stage: L.stageLabel[smoking.stage] ?? smoking.stage,
    urgency: smokeRU.urgency,
    referral: smokeRU.referral,
    bullets: bulletsForSmoking({
      depLevel: smoking.dependenceLevel,
      stage: smoking.stage,
      triggers: smoking.triggers,
      lang
    })
  };
}


// ✅ Alcohol
if (alcohol) {
  const alcoholRU = alcoholReferralUrgency({ alcohol, lang });

  output.alcohol = {
    title: L.alcohol.title,
    score: alcohol.score,
    riskLabel: L.alcohol.risk[alcohol.riskLevel] ?? alcohol.riskLevel,
    stage: L.stageLabel[alcohol.stage] ?? alcohol.stage,
    urgency: alcoholRU.urgency,
    referral: alcoholRU.referral,
    bullets: bulletsForAlcohol({
      riskLevel: alcohol.riskLevel,
      stage: alcohol.stage,
      lang
    })
  };
}


if (output.smoking) {
  output.summary.push(`${output.smoking.title}: ${output.smoking.riskLabel} (${output.smoking.stage})`);
}
if (output.alcohol) {
  output.summary.push(`${output.alcohol.title}: ${output.alcohol.riskLabel} (${output.alcohol.stage})`);
}

  return output;
}

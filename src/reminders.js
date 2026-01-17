// src/reminders.js
import { supabase } from "./supabase.js";

import {
  computeSmokingScore,
  smokingDependenceLevel,
  computeAuditCScore,
  alcoholRiskLevel,
  determineStage
} from "./scoring.js";

import { generateTailoredOutput } from "./tailoring.js";

const TTFC_MAP = { within_5: 3, "6_30": 2, "31_60": 1, after_60: 0 };
const CIGS_MAP = { "1_10": 0, "11_20": 1, "21_30": 2, "31_plus": 3 };

function toInt(v) {
  if (typeof v === "number") return v;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * POST /api/submit-assessment
 * Creates participant + assessment and returns tailored_output
 */
export async function submitAssessmentHandler(req, res) {
  try {
    const payload = req.body;
    const lang = payload.language || "EN";

    // 1) create participant
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .insert([{
        age_group: payload.age_group,
        sex: payload.sex,
        district: payload.district ?? null,
        community: payload.community ?? null,
        language: lang
      }])
      .select("*")
      .single();

    if (pErr) throw pErr;

    // 2) compute smoking score
    const smokingScore = computeSmokingScore({
      smoking_status: payload.smoking_status,
      smoking_ttfc: payload.smoking_ttfc,
      smoking_cigs_per_day: payload.smoking_cigs_per_day,
      ttfcMap: TTFC_MAP,
      cigsMap: CIGS_MAP
    });

    const smokingDepLevel = smokingDependenceLevel(smokingScore);

    const smokingStage = determineStage({
      intention: payload.smoking_intention,
      attemptRecent: payload.smoking_attempt_12m,
      quitDuration: payload.smoking_quit_duration
    });

    // 3) compute alcohol score
    const auditcScore = computeAuditCScore({
      auditc_q1: toInt(payload.auditc_q1),
      auditc_q2: toInt(payload.auditc_q2),
      auditc_q3: toInt(payload.auditc_q3)
    });

    const alcoholRisk = alcoholRiskLevel({ score: auditcScore, sex: payload.sex });

    const alcoholStage = determineStage({
      intention: payload.alcohol_intention,
      attemptRecent: payload.alcohol_cutdown_3m,
      quitDuration: null
    });

    // 4) create tailored output (snapshot)
    const tailored = generateTailoredOutput({
      lang,
      smoking: {
        status: payload.smoking_status,
        score: smokingScore,
        dependenceLevel: smokingDepLevel,
        stage: smokingStage,
        triggers: payload.smoking_triggers || []
      },
      alcohol: {
        score: auditcScore,
        riskLevel: alcoholRisk,
        stage: alcoholStage
      },
      referralLinks: {
        clinic: payload.referral_clinic_url ?? null,
        mquit: payload.referral_mquit_url ?? null
      }
    });

    // 5) insert assessment
    const { data: assessment, error: aErr } = await supabase
      .from("assessments")
      .insert([{
        participant_id: participant.id,

        smoking_status: payload.smoking_status,
        smoking_ttfc: payload.smoking_ttfc ?? null,
        smoking_cigs_per_day: payload.smoking_cigs_per_day ?? null,
        smoking_intention: payload.smoking_intention ?? null,
        smoking_attempt_12m: payload.smoking_attempt_12m ?? null,
        smoking_quit_duration: payload.smoking_quit_duration ?? null,
        smoking_triggers: payload.smoking_triggers ?? null,

        auditc_q1: toInt(payload.auditc_q1),
        auditc_q2: toInt(payload.auditc_q2),
        auditc_q3: toInt(payload.auditc_q3),
        alcohol_intention: payload.alcohol_intention ?? null,
        alcohol_cutdown_3m: payload.alcohol_cutdown_3m ?? null,

        smoking_score: smokingScore,
        smoking_dependence_level: smokingDepLevel,
        smoking_stage: smokingStage,

        alcohol_score: auditcScore,
        alcohol_risk_level: alcoholRisk,
        alcohol_stage: alcoholStage,

        tailored_output: tailored
      }])
      .select("*")
      .single();

    if (aErr) throw aErr;

    return res.json({
      ok: true,
      participant_id: participant.id,
      assessment_id: assessment.id,
      tailored_output: tailored
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ ok: false, error: err?.message || String(err) });
  }
}

/**
 * POST /api/reminders/send-due
 * Placeholder for cron (we will add Telegram sending later)
 */
export async function sendDueRemindersHandler(req, res) {
  return res.json({ ok: true, note: "sendDueRemindersHandler works (cron endpoint ready)" });
}

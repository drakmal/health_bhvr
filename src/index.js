import dotenv from "dotenv";

// ✅ Force dotenv to read from project root .env
dotenv.config({ path: new URL("../.env", import.meta.url) });

import express from "express";
import cors from "cors";

import { submitAssessmentHandler, sendDueRemindersHandler } from "./reminders.js";
import { telegramWebhookHandler } from "./telegram.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/submit-assessment", submitAssessmentHandler);
app.post("/api/telegram/webhook", telegramWebhookHandler);
app.post("/api/reminders/send-due", sendDueRemindersHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT || 3000}`);
});

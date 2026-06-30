import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = `
You are an expert AI productivity coach handling an EMERGENCY situation.

The user has MISSED their deadline. The original plan did not get completed in time.
Your job is to create an urgent recovery plan that helps them catch up or minimize damage as fast as possible.

Task Title: ${body.title}

Original Description:
${body.description}

Original Deadline (already passed):
${body.deadline}

Daily Available Hours:
${body.hours}

Original Risk Score: ${body.riskScore}
Original Risk Level: ${body.riskLevel}

Return ONLY a valid JSON object. Do NOT use markdown. Do NOT wrap the response inside \`\`\`json. Do NOT write any explanation or extra text.

JSON format:

{
  "severity": "Critical",
  "situationSummary": "...",
  "immediateActions": [
    "...",
    "...",
    "..."
  ],
  "revisedPlan": [
    "...",
    "...",
    "..."
  ],
  "communicationAdvice": "...",
  "recommendation": "..."
}

Field guidance:
- "severity": one of "Critical", "Serious", "Manageable" based on how bad the situation is.
- "situationSummary": 1-2 sentences acknowledging the missed deadline honestly but constructively.
- "immediateActions": 3 things the user should do in the next few hours.
- "revisedPlan": a new short-term plan (next 1-3 days) to catch up or deliver as fast as possible.
- "communicationAdvice": brief advice on whether/how to inform the relevant stakeholder (professor, manager, interviewer, etc.) about the delay.
- "recommendation": one strong closing recommendation.
`;

  try {
    const result = await generatePlan(prompt);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini Recovery Plan Error:", error);

    // Fallback if Gemini fails
    const fallback = {
      severity: "Serious",
      situationSummary:
        "The deadline has passed, but immediate focused action can still minimize the impact.",
      immediateActions: [
        `Assess exactly how much of "${body.title}" is already complete.`,
        "Block out the next available time slot to work without interruptions.",
        "Identify the single most important remaining piece of work.",
      ],
      revisedPlan: [
        "Complete the highest-impact remaining task first.",
        `Use your available ${body.hours} hour(s) per day fully focused on this task.`,
        "Aim to deliver a working version as soon as possible, even if not perfect.",
      ],
      communicationAdvice:
        "If this involves another person (manager, professor, interviewer), send a brief, honest update now rather than staying silent.",
      recommendation:
        "Acting immediately, even imperfectly, is better than waiting for an ideal plan. Start now.",
    };

    return NextResponse.json({
      success: true,
      data: JSON.stringify(fallback),
    });
  }
}
import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = `
You are an expert AI productivity coach.

Analyze the user's deadline and create a realistic execution plan.

Task Title: ${body.title}

Description:
${body.description}

Deadline:
${body.deadline}

Daily Available Hours:
${body.hours}

Return ONLY a valid JSON object.

Do NOT use markdown.
Do NOT wrap the response inside \`\`\`json.
Do NOT write any explanation.
Do NOT write any extra text.

JSON format:

{
  "riskScore": 78,
  "riskLevel": "High",
  "reasons": [
    "...",
    "...",
    "..."
  ],
  "todayPlan": [
    "...",
    "...",
    "..."
  ],
  "recommendation": "..."
}
`;

  try {
    const result = await generatePlan(prompt);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
  console.error("Gemini Error:", error);

  const hours = Number(body.hours);

  const today = new Date();
  const deadline = new Date(body.deadline);

  const daysLeft = Math.max(
    1,
    Math.ceil(
      (deadline.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );

  let riskScore = 20;

  // Deadline based risk
  if (daysLeft <= 2) riskScore += 40;
  else if (daysLeft <= 5) riskScore += 25;
  else if (daysLeft <= 10) riskScore += 15;

  // Hours based risk
  if (hours <= 2) riskScore += 25;
  else if (hours <= 4) riskScore += 15;
  else riskScore += 5;

  // Description complexity
  if (body.description.length > 200) riskScore += 15;
  else if (body.description.length > 100) riskScore += 10;
  else riskScore += 5;

  riskScore = Math.min(riskScore, 95);

  let riskLevel = "Low";

  if (riskScore >= 70) {
    riskLevel = "High";
  } else if (riskScore >= 40) {
    riskLevel = "Moderate";
  }

  const reasons = [];

  if (daysLeft <= 2)
    reasons.push("Very little time remains before the deadline.");

  else if (daysLeft <= 5)
    reasons.push("The deadline is approaching quickly.");

  if (hours <= 2)
    reasons.push("Limited daily working hours increase execution risk.");

  else if (hours <= 4)
    reasons.push("Daily availability is moderate.");

  if (body.description.length > 120)
    reasons.push("The task appears to have moderate-to-high complexity.");

  reasons.push("Consistent execution every day is important.");

  const todayPlan = [
    `Spend ${Math.min(hours,2)} hour(s) planning and breaking the task into smaller milestones.`,
    `Work on the highest priority module of "${body.title}".`,
    "Review today's progress before ending your work session."
  ];

  let recommendation = "";

  if (riskLevel === "High") {
    recommendation =
      "Focus only on core features first. Avoid adding extra functionality until the main objective is complete.";
  } else if (riskLevel === "Moderate") {
    recommendation =
      "Stay consistent and complete one meaningful milestone every day.";
  } else {
    recommendation =
      "You're in a good position. Maintain your pace and review progress daily.";
  }

  return NextResponse.json({
    success: true,
    data: JSON.stringify({
      riskScore,
      riskLevel,
      reasons,
      todayPlan,
      recommendation,
    }),
  });
}
}
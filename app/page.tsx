"use client";
import { useEffect } from "react";
import { getDocs } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp , deleteDoc,doc,} from "firebase/firestore";

type AIResult = {
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  todayPlan: string[];
  recommendation: string;
}; 
type Deadline = {
  id: string;
  title: string;
  deadline: string;
  aiResult: AIResult;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [email, setEmail] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          deadline,
          description,
          hours,
        }),
      });

      const data = await response.json();

      console.log("AI Response:", JSON.stringify(data, null, 2));
      if (data.success) {
        console.log("Inside success block");
        const cleaned = data.data
        
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
         console.log("Cleaned:", cleaned);
        const parsed = JSON.parse(cleaned);
         console.log("Saving to Firestore...");
         setAiResult(parsed);
         const reminderDate = new Date(deadline);
         reminderDate.setDate(reminderDate.getDate() - 1);
         reminderDate.setHours(9, 0, 0, 0);

         
         await addDoc(collection(db, "deadlines"), {
                title,
               description,
                deadline,
                 hours,
                 email,
                aiResult: parsed,
               createdAt: serverTimestamp(),
                reminderTime: Timestamp.fromDate(reminderDate),   // seedha yahan use karo
               reminderSent: false
});
await fetchDeadlines();
console.log("Saved successfully!");
      } else {
        alert("Failed to generate AI plan");
      }
    } catch (err: any) {
  console.error("FULL ERROR:", err);
  alert(err.message);
} finally {
      setLoading(false);
    }
  }; 
  const fetchDeadlines = async () => {
  const snapshot = await getDocs(collection(db, "deadlines"));

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Deadline[];

  setDeadlines(data);
}; 
useEffect(() => {
  fetchDeadlines();
}, []); 
const handleDelete = async (id: string) => {
  try {
    await deleteDoc(doc(db, "deadlines", id));

    setDeadlines((prev) => prev.filter((item) => item.id !== id));

    alert("Deadline deleted successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to delete deadline.");
  }
}; 



  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              🤖 Deadline Guardian AI
            </h1>

            <p className="mt-2 text-slate-400">
              Your AI companion that helps you finish before it's too late.
            </p>
          </div>

          <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-400">
            🟢 AI Ready
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"> 
          <div className="mb-8 grid gap-4 md:grid-cols-4">

  <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
    <p className="text-slate-400 text-sm">
      📚 Total Deadlines
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      {deadlines.length}
    </h2>
  </div>

  <div className="rounded-xl border border-red-500/20 bg-slate-950 p-4">
    <p className="text-red-400 text-sm">
      🔴 High Risk
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      {deadlines.filter(d=>d.aiResult.riskScore>=70).length}
    </h2>
  </div>

  <div className="rounded-xl border border-yellow-500/20 bg-slate-950 p-4">
    <p className="text-yellow-300 text-sm">
      🟡 Moderate
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      {
        deadlines.filter(
          d=>d.aiResult.riskScore>=40 && d.aiResult.riskScore<70
        ).length
      }
    </h2>
  </div>

  <div className="rounded-xl border border-green-500/20 bg-slate-950 p-4">
    <p className="text-green-400 text-sm">
      🟢 Low Risk
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      {deadlines.filter(d=>d.aiResult.riskScore<40).length}
    </h2>
  </div>

</div>

          <h2 className="mb-6 text-2xl font-semibold">
            ➕ Add New Deadline
          </h2> 
                    <div className="grid gap-4 md:grid-cols-2">

            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />

            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />

            <input
              type="number"
              placeholder="Daily Available Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-violet-500"
            />

          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "🤖 Generating AI Plan..."
              : "🚀 Generate AI Plan"}
          </button>

          {aiResult && (

            <div className="mt-8 grid gap-6 lg:grid-cols-3">

              {/* Risk Card */}

              <div className="rounded-2xl border border-red-500/20 bg-slate-950 p-5">

                <h3 className="text-lg font-semibold text-red-400">
                  🔴 Deadline Risk Score
                </h3>

                <p className="mt-4 text-5xl font-bold">
                  {aiResult.riskScore}%
                </p>

                <span className="mt-2 inline-block rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300">
                  {aiResult.riskLevel}
                </span>

                <ul className="mt-5 space-y-2 text-sm text-slate-400">

                  {aiResult.reasons.map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}

                </ul>

              </div> 
                            {/* Today's Plan */}

              <div className="rounded-2xl border border-violet-500/20 bg-slate-950 p-5">

                <h3 className="text-lg font-semibold text-violet-300">
                  📅 Today's AI Plan
                </h3>

                <ul className="mt-5 space-y-3">

                  {aiResult.todayPlan.map((task, index) => (
                    <li key={index}>✅ {task}</li>
                  ))}

                </ul>

              </div>

              {/* Recommendation */}

              <div className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-5">

                <h3 className="text-lg font-semibold text-emerald-400">
                  💡 AI Recommendation
                </h3>

                <p className="mt-5 leading-7 text-slate-300">
                  {aiResult.recommendation}
                </p>

              </div>

            </div>

          )} 

           <div className="mt-12">
              <h2 className="mb-6 text-3xl font-bold">
                 📚 Saved Deadlines
              </h2>
           </div> 
           <div className="grid gap-4">
  {deadlines.map((item) => (
  <div
    key={item.id}
    className="rounded-xl border border-slate-700 bg-slate-900 p-5"
  >
    <div className="mb-4 flex justify-end">
      <button
        onClick={() => handleDelete(item.id)}
        className="rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
      >
        🗑 Delete
      </button>
    </div>

    <h3 className="text-xl font-semibold">
      {item.title}
    </h3>

    <p className="mt-2 text-slate-400">
      📅 {item.deadline}
    </p>

    <div className="mt-3 flex items-center justify-between">
      <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-300">
        Risk: {item.aiResult.riskScore}%
      </span>

      <span className="text-violet-300">
        {item.aiResult.riskLevel}
      </span>
    </div>

    <div className="mt-4">
      <div className="h-2 w-full rounded-full bg-slate-700">
        <div
          className={`h-2 rounded-full ${
            item.aiResult.riskScore >= 70
              ? "bg-red-500"
              : item.aiResult.riskScore >= 40
              ? "bg-yellow-400"
              : "bg-green-500"
          }`}
          style={{ width: `${item.aiResult.riskScore}%` }}
        />
      </div>
    </div>
  </div>
  
))} 
</div>

        </div>

      </div>
    </main>
  );
}
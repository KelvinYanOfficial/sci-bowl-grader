export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { userAnswer, correctAnswer, isMultipleChoice = false } = req.body;

  if (isMultipleChoice) {
    const clean = str => str.trim().toLowerCase().replace(/\.$/, "");
    return res.status(200).json({
      result: clean(userAnswer) === clean(correctAnswer) ? "correct" : "incorrect"
    });
  }

  const prompt = `
You are an official Science Bowl answer grader. The student answered: "${userAnswer}". 
The correct answer is: "${correctAnswer}".

ONLY respond "correct" if the student's answer matches the correct answer in meaning AND contains all essential words.

If the student's answer is vague, incomplete, overly broad, or rephrased in an imprecise way — respond "incorrect".

ONLY respond with "correct" or "incorrect". No explanation.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
        temperature: 0
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.toLowerCase() || "incorrect";
    res.status(200).json({ result: content.includes("correct") ? "correct" : "incorrect" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI grading failed" });
  }
}

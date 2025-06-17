const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/grade", async (req, res) => {
  const { question, userAnswer, correctAnswer } = req.body;

  const prompt = `
Question: ${question}
Correct Answer: ${correctAnswer}
User Answer: ${userAnswer}

Does the user answer mean the same thing as the correct answer in the context of the question? Respond only with "correct" or "incorrect".
`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const text = chat.choices[0].message.content.toLowerCase();
    const result = text.includes("correct") ? "correct" : "incorrect";
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI grading failed." });
  }
});

app.listen(port, () => {
  console.log(`Grader server running at http://localhost:${port}`);
});

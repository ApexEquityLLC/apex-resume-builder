import express from "express";
import cors from "cors";
import { writeFileSync } from "fs";
import OpenAI from "openai";
import { Document, Packer, Paragraph, TextRun } from "docx";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate-resume", async (req, res) => {
  try {
    const { name, jobTitle, experience, education, skills } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a professional resume for ${name}, applying for a ${jobTitle} position. Include sections for Experience (${experience}), Education (${education}), and Skills (${skills}).`
        }
      ]
    });

    const resumeText = completion.choices[0].message.content;

    const doc = new Document({
      sections: [
        {
          children: [new Paragraph(new TextRun(resumeText))]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = "resume.docx";
    writeFileSync(filePath, buffer);

    res.download(filePath, "resume.docx");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating resume.");
  }
});

app.get("/", (req, res) => res.send("✅ Apex Resume Builder API is live!"));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

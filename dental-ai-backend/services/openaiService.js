const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateDentalResponse = async (history) => {
  const messages = history.map((msg) => ({
    role: msg.speaker === "agent" ? "assistant" : "user",
    content: msg.transcript,
  }));

  messages.unshift({
    role: "system",
    content:
      "You are Grace from South Bay Dental Office, friendly and informal, following up on teeth cleaning inquiries. Respond in a friendly, informal tone, using emojis and contractions. Keep responses concise, under 100 words. Use simple language suitable for a 10-year-old. Avoid technical jargon and complex terms. If asked about teeth cleaning, provide a brief overview of the process, emphasizing its importance for oral health. If the user asks about dental procedures, explain them simply and clearly.",
  });

  const { choices } = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.3,
  });

  return choices[0].message.content;
};

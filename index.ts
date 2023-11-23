const MODEL = process.env.MODEL ?? "";
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT ?? "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

const decoder = new TextDecoder();

process.stdout.write("Question: ");
for await (const message of console) {
  const resp = await fetch(OPENAI_API_ENDPOINT, {
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are an experienced software engineer. All you need to do is taking the question from user and responding the correct answer as well as some references.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: MODEL,
      stream: true,
    }),
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!resp.body) {
    throw new Error("Empty response body!");
  }
  console.log("-".repeat(80));
  for await (const chunk of resp.body) {
    for (const chunkData of decoder.decode(chunk).split(/\n+/).slice(0, -1)) {
      const data = JSON.parse(chunkData.slice(6));
      if (!!data.choices[0].finish_reason) {
        break;
      }
      process.stdout.write(data.choices[0].delta.content);
    }
  }
  console.log(`\n${"-".repeat(80)}`);
  process.stdout.write("Question: ");
}

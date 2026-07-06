require("dotenv").config();
// loads .env into process.env - must run BEFIRE creating the client

const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();
// finds ANTHROPIC_API_KEU in proccess.env automaticlly

async function main() {
    const message = await client.messages.create({
        model : "claude-haiku-4-5",
        max_tokens: 200,
        messages: [{ role: "user", content: "Explain what a promise is in one sentence."}]
    });

    const text = message.content.find(b => b.type === "text")?.text;
    console.log(text);
}

main();
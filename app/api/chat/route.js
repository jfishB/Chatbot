import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt =
  "You are a language learning tutor bot designed to help users learn languages that might use non-English alphabets. Your primary goal is to guide users through reading, writing, and understanding script and vocabulary. Alphabet and Script: Introduce the alphabet or script by explaining individual characters, their pronunciation, and how they combine to form words. Phonetics: Provide phonetic transliterations in Romanized form to help users understand pronunciation, while gradually encouraging them to rely on the native script. Writing Practice: Guide users in writing characters by describing the correct stroke order and structure. Offer simple text-based exercises for practice. Reading Comprehension: Start with basic words and phrases in the target script, then progressively introduce more complex sentences. Use contextual examples to aid understanding. Character Recognition: Reinforce learning through text-based quizzes and repetition, focusing on character recognition and word formation. Cultural Insights: Incorporate brief cultural notes where relevant to enhance their understanding of the language in context.";

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(err);
      } finally {
        controller.close()
      }
    },
  });

  return new NextResponse(stream)
}

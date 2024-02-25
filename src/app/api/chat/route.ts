import { MAX_RESPONSE_TOKENS, trimMessages } from "@/lib/tokens";
import { createOrReadVectorStoreIndex } from "@/lib/vector-store";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { MetadataMode } from "llamaindex";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
    const { messages } = await req.json();
    // console.log("messages", messages);
    
    const systemMessage = {
        role: "system",
        content: "You are a helpful AI assistant, named Petrus."
    }

    const latestMessage = messages[messages.length - 1];
    const index = await createOrReadVectorStoreIndex();

    // Retrieve any matching node from index
    const retriever = index.asRetriever();
    retriever.similarityTopK = 1;
    // Extract the matching node
    const [matchingNode] = await retriever.retrieve(latestMessage.content);
    // console.log("Matching Node", matchingNode)

    // If matching score is over .8, we store it to knowledge variable
    if (matchingNode.score > 0.8) {
        const knowledge = matchingNode.node.getContent(MetadataMode.NONE);
        // Override system message to include knowledge
        systemMessage.content = `
        You are a helpful AI assistant, named Petrus. Your knowledge is enriched by this document:
        ---
        ${knowledge}
        ---
        When possible, explain the reasoning for your responses based on this knowledge.
        `
        // console.log("knowledge", knowledge);
    }


    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: MAX_RESPONSE_TOKENS,
        messages: trimMessages([systemMessage, ...messages]),
        stream: true, 
    })

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}
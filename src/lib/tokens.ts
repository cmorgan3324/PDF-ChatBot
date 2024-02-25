import { encoding_for_model } from "@dqbd/tiktoken";
import { Message } from "ai";

const encoding = encoding_for_model("gpt-3.5-turbo");
const TOKEN_LIMIT = 4097 * 0.9 // 10% buffer for token limit since embeddings are not exact/ not OpenAI embeddings
export const MAX_RESPONSE_TOKENS = 600

function countTokens( text: string ) {
    const tokens = encoding.encode(text);
    // console.log("tokens", tokens);
    return tokens.length;
}

countTokens("Hello world, how are you?");

export function trimMessages (messages: Message[]): Message[] {
    const [systemMessage, ...restMessages] = messages

    let totalTokens = countTokens(systemMessage.content) + MAX_RESPONSE_TOKENS;
    const trimmedMessages = []

    // Keep as many messages as possible until token limit is reached
    for (const message of restMessages.reverse()) { // Maintain reverse chronological order .reverse
        const newTotalTokens = totalTokens + countTokens(message.content); 

        if (newTotalTokens > TOKEN_LIMIT) {
            break;
        } else {
            trimmedMessages.unshift(message);
            totalTokens = newTotalTokens;
        }
    }
    trimmedMessages.unshift(systemMessage); // unshift to keep reverse chronological order and add system message last
    return trimmedMessages;
}
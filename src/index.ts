export interface Env {
  AI: Ai;
}

// Function to sanitize and truncate text
function sanitizeAndTruncateText(text: string): string {
  // Remove any HTML tags
  text = text.replace(/<[^>]*>?/gm, '');
  // Replace multiple newlines with a single newline
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim whitespace
  text = text.trim();

  return text;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Set CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method === "POST") {
      try {
        const { noun, adjective, verb } = await request.json();

        const prompt = `Generate 5 creative and slightly humorous ideas for innovative projects using these inputs:
        Noun: ${noun}
        Adjective: ${adjective}
        Verb: ${verb}

        For each idea, incorporate the noun as the focus, the adjective as a unique quality, and the verb as the main action. Be witty and concise.

        Format your response as a numbered list:
        1. [First idea]
        2. [Second idea]
        3. [Third idea]
        4. [Fourth idea]
        5. [Fifth idea]

        Keep each idea to about 1-2 sentences. Be creative, clever, and fun!`;

        const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.7
        });

        // Sanitize and truncate the text response
        const processedText = sanitizeAndTruncateText(response.response);

        return new Response(JSON.stringify({ ideas: processedText }), {
          headers: { ...headers, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to generate ideas" }), {
          status: 500,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Method not allowed", { status: 405, headers });
  },
} satisfies ExportedHandler<Env>;


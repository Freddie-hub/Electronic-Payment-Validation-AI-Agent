/**
 * Mock API route for development
 * In production, this would be replaced with actual backend integration
 * This file simulates the Next.js API route provided by the user
 */

// This is a mock file for reference - actual API calls will need to be handled by a real backend
// The frontend is configured to make requests to '/api/chat' which should be handled by your backend server

console.log('Mock API route loaded - replace with actual backend integration');

export async function POST(req) {
  try {
    const { message } = await req.json();

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:1b", // use the smaller variant you pulled
        messages: [{ role: "user", content: message }],
        stream: false,
      }),
    });

    const data = await response.json();
    console.log("Ollama raw response:", JSON.stringify(data, null, 2));

    const reply =
      data?.message?.content ||
      data?.content ||
      data?.choices?.[0]?.message?.content ||
      "No reply from model";

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return new Response(JSON.stringify({ error: "Failed to connect to Ollama" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
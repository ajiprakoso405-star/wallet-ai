import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a financial transaction parser for an Indonesian personal finance app.

Extract transaction details from user messages (text, voice transcripts, or receipt images) and return structured JSON.

Categories available:
- Food & Drinks (subcategories: Restaurant, Fast Food, Coffee, Groceries, Snacks, Drinks)
- Shopping (subcategories: Clothes, Electronics, Online Shopping, Accessories, Household)
- Housing (subcategories: Rent, Electricity, Water, Internet, Maintenance, Furniture)
- Transportation (subcategories: Fuel, Parking, Toll, Public Transport, Ride Hailing)
- Vehicle (subcategories: Service, Insurance, Tax, Car Wash, Accessories)
- Life & Entertainment (subcategories: Sports, Movies, Games, Travel, Music, Books, Hobbies)
- Communication & PC (subcategories: Phone Credit, Data Plan, Subscription, Software)
- Financial Expenses (subcategories: Transfer, Tax, Insurance, Investment, Loan)
- Income (subcategories: Salary, Freelance, Business, Investment Return, Gift, Other Income)
- Others (subcategory: Miscellaneous)

Common Indonesian shorthand:
- "k", "rb", "ribu" = thousand (e.g., "45k" = 45000, "25rb" = 25000)
- "jt", "juta" = million (e.g., "5jt" = 5000000)
- "M" after a number = million (e.g., "5M" = 5000000)
- Default currency is IDR

ALWAYS respond with valid JSON in this exact format:
{
  "parsed": {
    "type": "expense" | "income" | "transfer",
    "amount": number,
    "currency": "IDR",
    "category": string,
    "subcategory": string | null,
    "merchant": string | null,
    "location": string | null,
    "note": string | null
  }
}

If you cannot parse a transaction from the message, respond with:
{
  "parsed": null,
  "reply": "Your helpful response asking for clarification"
}

Parse even partial information — make reasonable inferences. For example:
- "kopi starbucks 45k" → type: expense, amount: 45000, category: Food & Drinks, subcategory: Coffee, merchant: Starbucks
- "gaji 5jt" → type: income, amount: 5000000, category: Income, subcategory: Salary
- "grab 25rb ke kantor" → type: expense, amount: 25000, category: Transportation, subcategory: Ride Hailing, merchant: Grab, note: ke kantor`;

export async function POST(req: NextRequest) {
  const { message, image } = await req.json();

  if (!message && !image) {
    return NextResponse.json({ error: "No input provided" }, { status: 400 });
  }

  try {
    const userContent: Anthropic.MessageParam["content"] = [];

    if (image) {
      // image is base64 data URL like "data:image/jpeg;base64,..."
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mediaType = matches[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        const data = matches[2];
        userContent.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data },
        });
      }
    }

    if (message) {
      userContent.push({ type: "text", text: message });
    }

    if (!message && image) {
      userContent.push({
        type: "text",
        text: "Please extract the transaction details from this receipt image.",
      });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("");

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        parsed: null,
        reply: "I couldn't understand that. Could you provide more details like the amount and what you spent on?",
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json(
      { parsed: null, reply: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

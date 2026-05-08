import { getOpenAIClient } from "@/lib/openai";
import { searchFoodLibrary } from "@/lib/repository";
import type { FoodEstimateItem } from "@/lib/types";

const structuredPrompt = `
You estimate food calories in kcal.
Return strict JSON with this shape:
{
  "items": [
    {
      "foodName": "string",
      "amountValue": 0,
      "amountUnit": "g|ml|serving|piece",
      "caloriesKcal": 0,
      "sourceNote": "short reason",
      "confidence": 0
    }
  ]
}
Rules:
- JSON only, no markdown.
- Use kcal only.
- confidence must be between 0 and 1.
- If amount is omitted, infer a reasonable serving and explain it in sourceNote.
- Split multiple foods into separate items.
`.trim();

function parseLocalInput(input: string) {
  return input
    .split(/[+,，]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*?)(\d+(?:\.\d+)?)\s*(g|ml|piece|serving)$/i);
      if (!match) {
        return {
          foodName: part,
          amountValue: 1,
          amountUnit: "serving" as const
        };
      }

      return {
        foodName: match[1].trim(),
        amountValue: Number(match[2]),
        amountUnit: match[3].toLowerCase() as FoodEstimateItem["amountUnit"]
      };
    });
}

async function estimateFromLibrary(input: string) {
  const parsed = parseLocalInput(input);
  const items: FoodEstimateItem[] = [];

  for (const part of parsed) {
    const matches = await searchFoodLibrary(part.foodName);
    const exact = matches.find((item) => item.canonicalName === part.foodName);
    if (!exact) {
      return null;
    }

    const scaledCalories = Math.round((part.amountValue / exact.defaultAmountValue) * exact.caloriesPerUnitKcal);
    items.push({
      foodName: exact.canonicalName,
      amountValue: part.amountValue,
      amountUnit: part.amountUnit,
      caloriesKcal: scaledCalories,
      sourceNote: `Matched local library from ${exact.referenceUnit}`,
      confidence: 0.98
    });
  }

  return items;
}

export async function estimateFood(input: string) {
  const libraryItems = await estimateFromLibrary(input);
  if (libraryItems) {
    return {
      items: libraryItems,
      totalCaloriesKcal: libraryItems.reduce((sum, item) => sum + item.caloriesKcal, 0),
      source: "library" as const
    };
  }

  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: structuredPrompt },
      { role: "user", content: input }
    ],
    temperature: 0.2
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from AI estimate");
  }

  const parsed = JSON.parse(content) as { items?: FoodEstimateItem[] };
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  if (items.length === 0) {
    throw new Error("AI estimate returned no items");
  }

  return {
    items,
    totalCaloriesKcal: items.reduce((sum, item) => sum + item.caloriesKcal, 0),
    source: "ai" as const
  };
}

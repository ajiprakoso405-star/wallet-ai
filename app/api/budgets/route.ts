import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { account: true },
      orderBy: { createdAt: "desc" },
    });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const result = await prisma.transaction.aggregate({
          where: {
            category: budget.category ?? undefined,
            type: "expense",
            date: {
              gte: budget.periodStart,
              lte: budget.periodEnd,
            },
            ...(budget.accountId ? { accountId: budget.accountId } : {}),
          },
          _sum: { amount: true },
        });
        return { ...budget, spent: result._sum.amount ?? 0 };
      })
    );

    return NextResponse.json({ budgets: budgetsWithSpent });
  } catch (error) {
    console.error("GET /api/budgets error:", error);
    return NextResponse.json({ budgets: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, amount, currency, periodStart, periodEnd, category, accountId } = body;

    if (!name || !amount || !periodEnd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        currency: currency ?? "IDR",
        periodStart: periodStart ? new Date(periodStart) : new Date(),
        periodEnd: new Date(periodEnd),
        category: category ?? null,
        accountId: accountId ?? null,
      },
      include: { account: true },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}

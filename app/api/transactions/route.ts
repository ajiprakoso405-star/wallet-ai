import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const period = searchParams.get("period") ?? "all";
    const accountId = searchParams.get("accountId");

    let dateFilter: Date | undefined;
    if (period !== "all") {
      const days = parseInt(period.replace("d", ""));
      if (!isNaN(days)) {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(dateFilter ? { date: { gte: dateFilter } } : {}),
        ...(accountId ? { accountId } : {}),
      },
      include: { account: true },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ transactions: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, currency, category, subcategory, merchant, location, note, date, accountId } = body;

    if (!type || !amount || !category || !accountId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        currency: currency ?? "IDR",
        category,
        subcategory: subcategory ?? null,
        merchant: merchant ?? null,
        location: location ?? null,
        note: note ?? null,
        date: date ? new Date(date) : new Date(),
        accountId,
      },
      include: { account: true },
    });

    const delta =
      type === "income" ? parseFloat(amount) : type === "expense" ? -parseFloat(amount) : 0;
    if (delta !== 0) {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: delta } },
      });
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

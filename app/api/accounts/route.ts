import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("GET /api/accounts error:", error);
    return NextResponse.json({ accounts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, currency, balance, color, icon } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        currency: currency ?? "IDR",
        balance: parseFloat(balance ?? "0"),
        color: color ?? "#3b82f6",
        icon: icon ?? "💳",
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("POST /api/accounts error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

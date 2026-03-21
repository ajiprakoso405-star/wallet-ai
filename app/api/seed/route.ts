import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  // Hapus data lama
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.account.deleteMany();

  // Buat akun
  const bca = await prisma.account.create({
    data: { name: "BCA", type: "bank", currency: "IDR", balance: 8500000, color: "#0066AE", icon: "https://logo.clearbit.com/bca.co.id" },
  });
  const mandiri = await prisma.account.create({
    data: { name: "Mandiri", type: "bank", currency: "IDR", balance: 3200000, color: "#003087", icon: "https://logo.clearbit.com/bankmandiri.co.id" },
  });
  const gopay = await prisma.account.create({
    data: { name: "GoPay", type: "ewallet", currency: "IDR", balance: 450000, color: "#00AA5B", icon: "https://logo.clearbit.com/gopay.co.id" },
  });
  const shopeepay = await prisma.account.create({
    data: { name: "ShopeePay", type: "ewallet", currency: "IDR", balance: 120000, color: "#EE4D2D", icon: "https://logo.clearbit.com/shopee.co.id" },
  });
  const cash = await prisma.account.create({
    data: { name: "Dompet", type: "cash", currency: "IDR", balance: 300000, color: "#22c55e", icon: "💵" },
  });

  // Helper tanggal mundur
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

  // Transaksi dummy
  const txs = [
    // Income
    { type: "income",   amount: 8000000, currency: "IDR", category: "Income",     subcategory: "Salary",    merchant: "Kantor",       accountId: bca.id,       date: daysAgo(30) },
    { type: "income",   amount: 500000,  currency: "IDR", category: "Income",     subcategory: "Freelance", merchant: "Client A",     accountId: bca.id,       date: daysAgo(15) },
    { type: "income",   amount: 200000,  currency: "IDR", category: "Income",     subcategory: "Other",     merchant: "Bonus",        accountId: mandiri.id,   date: daysAgo(10) },

    // Food & Drink
    { type: "expense",  amount: 45000,   currency: "IDR", category: "Food",       subcategory: "Restaurant",merchant: "KFC",          accountId: gopay.id,     date: daysAgo(1)  },
    { type: "expense",  amount: 28000,   currency: "IDR", category: "Food",       subcategory: "Cafe",      merchant: "Kopi Kenangan",accountId: gopay.id,     date: daysAgo(2)  },
    { type: "expense",  amount: 65000,   currency: "IDR", category: "Food",       subcategory: "Restaurant",merchant: "Warteg",       accountId: cash.id,      date: daysAgo(3)  },
    { type: "expense",  amount: 120000,  currency: "IDR", category: "Food",       subcategory: "Restaurant",merchant: "Pizza Hut",    accountId: bca.id,       date: daysAgo(5)  },
    { type: "expense",  amount: 35000,   currency: "IDR", category: "Food",       subcategory: "Delivery",  merchant: "GoFood",       accountId: gopay.id,     date: daysAgo(6)  },
    { type: "expense",  amount: 22000,   currency: "IDR", category: "Food",       subcategory: "Snack",     merchant: "Indomaret",    accountId: shopeepay.id, date: daysAgo(7)  },

    // Transport
    { type: "expense",  amount: 25000,   currency: "IDR", category: "Transport",  subcategory: "Ride",      merchant: "Gojek",        accountId: gopay.id,     date: daysAgo(1)  },
    { type: "expense",  amount: 18000,   currency: "IDR", category: "Transport",  subcategory: "Ride",      merchant: "Grab",         accountId: shopeepay.id, date: daysAgo(4)  },
    { type: "expense",  amount: 50000,   currency: "IDR", category: "Transport",  subcategory: "Fuel",      merchant: "Pertamina",    accountId: cash.id,      date: daysAgo(8)  },

    // Shopping
    { type: "expense",  amount: 350000,  currency: "IDR", category: "Shopping",   subcategory: "Clothes",   merchant: "H&M",          accountId: bca.id,       date: daysAgo(12) },
    { type: "expense",  amount: 89000,   currency: "IDR", category: "Shopping",   subcategory: "Online",    merchant: "Shopee",       accountId: shopeepay.id, date: daysAgo(9)  },
    { type: "expense",  amount: 200000,  currency: "IDR", category: "Shopping",   subcategory: "Grocery",   merchant: "Giant",        accountId: bca.id,       date: daysAgo(14) },

    // Bills
    { type: "expense",  amount: 450000,  currency: "IDR", category: "Bills",      subcategory: "Electricity",merchant: "PLN",         accountId: mandiri.id,   date: daysAgo(20) },
    { type: "expense",  amount: 150000,  currency: "IDR", category: "Bills",      subcategory: "Internet",  merchant: "IndiHome",     accountId: mandiri.id,   date: daysAgo(20) },
    { type: "expense",  amount: 85000,   currency: "IDR", category: "Bills",      subcategory: "Phone",     merchant: "Telkomsel",    accountId: gopay.id,     date: daysAgo(18) },

    // Entertainment
    { type: "expense",  amount: 54000,   currency: "IDR", category: "Entertainment",subcategory: "Streaming",merchant: "Netflix",     accountId: bca.id,       date: daysAgo(25) },
    { type: "expense",  amount: 75000,   currency: "IDR", category: "Entertainment",subcategory: "Movie",    merchant: "CGV",         accountId: gopay.id,     date: daysAgo(11) },

    // Health
    { type: "expense",  amount: 120000,  currency: "IDR", category: "Health",     subcategory: "Medicine",  merchant: "Apotek",       accountId: cash.id,      date: daysAgo(16) },
  ];

  for (const tx of txs) {
    await prisma.transaction.create({
      data: {
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        category: tx.category,
        subcategory: tx.subcategory,
        merchant: tx.merchant,
        accountId: tx.accountId,
        date: tx.date,
      },
    });
  }

  // Update balance akun sesuai transaksi (simulasi saldo setelah transaksi)
  return NextResponse.json({ ok: true, message: "Seed berhasil! Akun dan transaksi dummy sudah dibuat." });
}

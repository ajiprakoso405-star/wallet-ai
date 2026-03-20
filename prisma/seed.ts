import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate2024() {
  const start = new Date("2024-01-01").getTime();
  const end = new Date("2024-12-31").getTime();
  return new Date(start + Math.random() * (end - start));
}

function randomDateRecent() {
  // Spread across 2025 and up to today (2026-03-20)
  const start = new Date("2025-01-01").getTime();
  const end = new Date("2026-03-20").getTime();
  return new Date(start + Math.random() * (end - start));
}

const expenseCategories = [
  {
    category: "Food & Drinks",
    subcategories: ["Restaurant, fast-food", "Bar, cafe", "Groceries", "Snacks, sweets"],
    merchants: ["KFC", "McDonald's", "Starbucks", "GoFood", "GrabFood", "Indomaret", "Alfamart", "Warung Makan", "Sate Pak Haji", "Bakso Malang", "Es Teh Indonesia", "Kopi Kenangan"],
    minAmount: 15000,
    maxAmount: 250000,
  },
  {
    category: "Shopping",
    subcategories: ["Clothes & shoes", "Electronics, accessories", "Online shopping"],
    merchants: ["Tokopedia", "Shopee", "H&M", "Zara", "Uniqlo", "iBox", "Erafone", "Matahari"],
    minAmount: 50000,
    maxAmount: 1500000,
  },
  {
    category: "Transportation",
    subcategories: ["Taxi", "Public transport", "Fuel"],
    merchants: ["Grab", "Gojek", "TransJakarta", "KRL", "Pertamina", "Shell", "Blue Bird"],
    minAmount: 10000,
    maxAmount: 200000,
  },
  {
    category: "Housing",
    subcategories: ["Energy, utilities", "Maintenance, repairs", "Services"],
    merchants: ["PLN", "PDAM", "Indihome", "First Media", "Jasa Service"],
    minAmount: 100000,
    maxAmount: 2500000,
  },
  {
    category: "Life & Entertainment",
    subcategories: ["Active sport, fitness", "Cinema", "Games", "Travel, trips"],
    merchants: ["CGV", "XXI", "Netflix", "Spotify", "Steam", "Gymboree", "Tiket.com", "Traveloka"],
    minAmount: 20000,
    maxAmount: 800000,
  },
  {
    category: "Communication, PC",
    subcategories: ["Phone, cell phone", "Internet"],
    merchants: ["Telkomsel", "XL", "Indosat", "By.U", "Smartfren"],
    minAmount: 15000,
    maxAmount: 150000,
  },
  {
    category: "Vehicle",
    subcategories: ["Fuel", "Service, parts", "Car wash"],
    merchants: ["Pertamina", "Shell", "Bengkel Auto", "Auto2000", "Quick Wash"],
    minAmount: 50000,
    maxAmount: 1000000,
  },
  {
    category: "Financial Expenses",
    subcategories: ["Insurance", "Taxes"],
    merchants: ["BPJS", "Asuransi Allianz", "Kantor Pajak"],
    minAmount: 100000,
    maxAmount: 500000,
  },
];

const incomeCategories = [
  {
    category: "Income",
    subcategories: ["Sale", "Allowances", "Rental income", "Other income"],
    merchants: ["PT. Nusantara", "PT. Tech Indonesia", "Freelance Client", "Tokopedia Shop"],
    minAmount: 500000,
    maxAmount: 10000000,
  },
];

const locations = ["Jakarta", "Bandung", "Surabaya", "Bali", "Yogyakarta", "Tangerang", "Bekasi", "Depok", null, null, null];

async function main() {
  // Clear existing transactions
  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.account.deleteMany({});

  // Create accounts
  const cash = await prisma.account.create({
    data: {
      id: "cash-default",
      name: "Cash",
      type: "cash",
      currency: "IDR",
      balance: 500000,
      color: "#22c55e",
      icon: "💵",
    },
  });

  const bca = await prisma.account.create({
    data: {
      id: "bca-default",
      name: "BCA",
      type: "bank",
      currency: "IDR",
      balance: 3500000,
      color: "#3b82f6",
      icon: "🏦",
    },
  });

  const gopay = await prisma.account.create({
    data: {
      id: "gopay-default",
      name: "GoPay",
      type: "ewallet",
      currency: "IDR",
      balance: 250000,
      color: "#a855f7",
      icon: "📱",
    },
  });

  const accounts = [cash, bca, bca, bca, gopay, gopay]; // weighted toward bank

  // Generate transactions: 800 in 2024 + 500 in 2025-2026
  const transactions = [];

  // ~720 expenses, ~80 incomes for 2024
  for (let i = 0; i < 720; i++) {
    const cat = randomItem(expenseCategories);
    const sub = randomItem(cat.subcategories);
    const merchant = randomItem(cat.merchants);
    const account = randomItem(accounts);
    const amount = randomInt(cat.minAmount, cat.maxAmount);
    const roundedAmount = Math.round(amount / 500) * 500;

    transactions.push({
      type: "expense",
      amount: roundedAmount,
      currency: "IDR",
      category: cat.category,
      subcategory: sub,
      merchant,
      location: randomItem(locations),
      note: null,
      date: randomDate2024(),
      accountId: account.id,
    });
  }

  // 80 incomes for 2024
  for (let i = 0; i < 80; i++) {
    const cat = randomItem(incomeCategories);
    const sub = randomItem(cat.subcategories);
    const merchant = randomItem(cat.merchants);
    const account = randomItem([bca, bca, cash]);
    const amount = randomInt(cat.minAmount, cat.maxAmount);
    const roundedAmount = Math.round(amount / 500) * 500;

    transactions.push({
      type: "income",
      amount: roundedAmount,
      currency: "IDR",
      category: cat.category,
      subcategory: sub,
      merchant,
      location: null,
      note: null,
      date: randomDate2024(),
      accountId: account.id,
    });
  }

  // ~430 expenses for 2025-2026 (recent data so dashboard shows something)
  for (let i = 0; i < 430; i++) {
    const cat = randomItem(expenseCategories);
    const sub = randomItem(cat.subcategories);
    const merchant = randomItem(cat.merchants);
    const account = randomItem(accounts);
    const amount = randomInt(cat.minAmount, cat.maxAmount);
    const roundedAmount = Math.round(amount / 500) * 500;

    transactions.push({
      type: "expense",
      amount: roundedAmount,
      currency: "IDR",
      category: cat.category,
      subcategory: sub,
      merchant,
      location: randomItem(locations),
      note: null,
      date: randomDateRecent(),
      accountId: account.id,
    });
  }

  // 70 incomes for 2025-2026
  for (let i = 0; i < 70; i++) {
    const cat = randomItem(incomeCategories);
    const sub = randomItem(cat.subcategories);
    const merchant = randomItem(cat.merchants);
    const account = randomItem([bca, bca, cash]);
    const amount = randomInt(cat.minAmount, cat.maxAmount);
    const roundedAmount = Math.round(amount / 500) * 500;

    transactions.push({
      type: "income",
      amount: roundedAmount,
      currency: "IDR",
      category: cat.category,
      subcategory: sub,
      merchant,
      location: null,
      note: null,
      date: randomDateRecent(),
      accountId: account.id,
    });
  }

  // Insert in batches of 100
  for (let i = 0; i < transactions.length; i += 100) {
    const batch = transactions.slice(i, i + 100);
    await prisma.transaction.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + 100, transactions.length)} / ${transactions.length} transactions...`);
  }

  // Create sample budgets
  await prisma.budget.createMany({
    data: [
      {
        name: "Food Budget",
        amount: 1500000,
        currency: "IDR",
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-01-31"),
        category: "Food & Drinks",
      },
      {
        name: "Transport Budget",
        amount: 500000,
        currency: "IDR",
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-01-31"),
        category: "Transportation",
      },
    ],
  });

  console.log("Database seeded successfully with 1300 transactions (2024-2026)!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

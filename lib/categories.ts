export interface Category {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    name: "Food & Drinks",
    icon: "🍽️",
    color: "#b45252",
    subcategories: ["Bar, cafe", "Groceries", "Restaurant, fast-food"],
  },
  {
    name: "Shopping",
    icon: "🛍️",
    color: "#2d5fa6",
    subcategories: [
      "Clothes & shoes",
      "Drug-store, chemist",
      "Electronics, accessories",
      "Free time",
      "Gifts, joy",
      "Health and beauty",
      "Home, garden",
      "Jewels, accessories",
      "Kids",
    ],
  },
  {
    name: "Housing",
    icon: "🏠",
    color: "#b85c1a",
    subcategories: [
      "Energy, utilities",
      "Maintenance, repairs",
      "Mortgage",
      "Property insurance",
      "Rent",
      "Services",
    ],
  },
  {
    name: "Transportation",
    icon: "🚌",
    color: "#4a5568",
    subcategories: [
      "Business trips",
      "Long distance",
      "Public transport",
      "Taxi",
    ],
  },
  {
    name: "Vehicle",
    icon: "🚗",
    color: "#5b3fa6",
    subcategories: [
      "Fuel",
      "Leasing",
      "Parking",
      "Rentals",
      "Vehicle insurance",
      "Vehicle maintenance",
    ],
  },
  {
    name: "Life & Entertainment",
    icon: "🎭",
    color: "#1a7a42",
    subcategories: [
      "Active sport, fitness",
      "Alcohol, tobacco",
      "Books, audio, subscriptions",
      "Charity, gifts",
      "Culture, sport events",
      "Education, development",
      "Health care, doctor",
      "Hobbies",
      "Holiday, trips, hotels",
    ],
  },
  {
    name: "Communication, PC",
    icon: "💻",
    color: "#0a6fa0",
    subcategories: [
      "Internet",
      "Phone, cell phone",
      "Postal services",
      "Software, apps, games",
    ],
  },
  {
    name: "Financial Expenses",
    icon: "💰",
    color: "#0d7a56",
    subcategories: [
      "Advisory",
      "Charges, Fees",
      "Child Support",
      "Fines",
      "Insurances",
      "Loan, interests",
      "Taxes",
    ],
  },
  {
    name: "Income",
    icon: "💵",
    color: "#f59e0b",
    subcategories: [
      "Checks, coupons",
      "Child Support",
      "Dues & grants",
      "Gifts",
      "Interests, dividends",
      "Lending, renting",
      "Lottery, gambling",
      "Refunds",
      "Rental income",
      "Sale",
    ],
  },
  {
    name: "Others",
    icon: "📦",
    color: "#64748b",
    subcategories: ["Other"],
  },
];

export function getCategoryColor(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.color ?? "#64748b";
}

export function getCategoryIcon(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.icon ?? "📦";
}

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c.name !== "Income"
);
export const INCOME_CATEGORIES = CATEGORIES.filter(
  (c) => c.name === "Income"
);

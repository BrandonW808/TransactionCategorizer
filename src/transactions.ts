// transactions.ts
import readline from "readline";

export type Transaction = {
  date: string;
  description: string;
  subDescription: string;
  type: string; // e.g., "Debit" or "Credit"
  amount: number;
  balance?: number;
};

export type Categories = {
  [mainCategory: string]: {
    [subCategory: string]: string[]; // array of keywords
  };
};

export type OutputRow = (string | number)[];

/**
 * Categorizes a list of transactions based on keyword rules.
 * Returns rows structured like the output spreadsheet.
 */
export async function categorizeTransactions(
  transactions: Transaction[],
  categories: Categories
): Promise<OutputRow[]> {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

  const output: OutputRow[] = [];
  const categorized: {
    [mainCategory: string]: {
      [subCategory: string]: { desc: string; amount: number }[];
    };
  } = {};

  for (const txn of transactions) {
    const description = normalize(`${txn.subDescription ?? ""} ${txn.description ?? ""}`);
    let matched = false;

    if (txn.subDescription.toLowerCase().includes('virgin plus') && txn.amount == -153.34) {
      let mainCat = "Expenses";
      let subCat = "Living Expenses";
      if (!categorized[mainCat]) categorized[mainCat] = {};
      if (!categorized[mainCat][subCat]) categorized[mainCat][subCat] = [];
      categorized["Expenses"]["Living Expenses"].push({ desc: `Internet + TV`, amount: -60.16 });
      mainCat = "Expenses";
      subCat = "Phone Bill";
      if (!categorized[mainCat]) categorized[mainCat] = {};
      if (!categorized[mainCat][subCat]) categorized[mainCat][subCat] = [];
      categorized["Expenses"]["Phone Bill"].push({ desc: `Phone Bill`, amount: (txn.amount + 60.16) });
      matched = true;
    } else {

      for (const [mainCat, subCats] of Object.entries(categories)) {
        for (const [subCat, keywords] of Object.entries(subCats)) {
          if (keywords.some(keyword => description.includes(normalize(keyword)))) {
            if (!categorized[mainCat]) categorized[mainCat] = {};
            if (!categorized[mainCat][subCat]) categorized[mainCat][subCat] = [];
            console.log(`Subdesc: ${txn.subDescription} Amount: ${txn.amount}`);

            categorized[mainCat][subCat].push({ desc: `${txn.description} ${txn.subDescription}`, amount: txn.amount });

            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }


    if (!matched) {
      if (txn.description.includes("date=")) {
        continue;
      }
      const userInput = await promptForCategory(`${txn.subDescription} ${txn.description}`);
      if (userInput && categories.Expenses?.[userInput]) {
        const subCat = userInput;
        const mainCat = "Expenses";
        if (!categorized[mainCat]) categorized[mainCat] = {};
        if (!categorized[mainCat][subCat]) categorized[mainCat][subCat] = [];
        categorized[mainCat][subCat].push({ desc: `${txn.description} ${txn.subDescription}`, amount: txn.amount });
      } else {
        // Handle unknown user input (optional: log, skip, etc.)
        console.warn(`Unknown category input: "${userInput}". Transaction skipped.`);
      }
    }
  }

  const subcats = Object.keys(categories.Expenses);
  const headerRow1: OutputRow = ["Expenses"];
  const headerRow2: OutputRow = [""];
  for (const sub of subcats) {
    headerRow1.push(sub, "");
    headerRow2.push("Description", "Amount");
  }

  output.push(headerRow1);
  output.push(headerRow2);

  const maxRows = Math.max(...subcats.map(sub => categorized.Expenses?.[sub]?.length || 0));

  for (let i = 0; i < maxRows; i++) {
    const row: OutputRow = [""];
    for (const sub of subcats) {
      const entry = categorized.Expenses?.[sub]?.[i];
      row.push(entry?.desc ?? "", entry ? `$ ${entry.amount.toFixed(2)}` : "");
    }
    output.push(row);
  }

  // Totals row
  const totalRow: OutputRow = ["Total"];
  for (const sub of subcats) {
    const total = (categorized.Expenses?.[sub] || []).reduce((sum, entry) => sum + entry.amount, 0);
    totalRow.push("", total ? `$ ${total.toFixed(2)}` : "$ -");
  }
  output.push(totalRow);

  return output;
}

export function processSharedTransactions(
  output: OutputRow[],
  shared: { description: string; total: number; brandon: number; expense: string }[]
): OutputRow[] {
  const headerRow = output[0];
  const subcategoryIndexMap: { [subcategory: string]: number } = {};

  // Build map from subcategory name to column index
  for (let i = 1; i < headerRow.length; i += 2) {
    const subcat = headerRow[i];
    if (typeof subcat === "string") {
      subcategoryIndexMap[subcat.toLowerCase()] = i;
    }
  }

  const bodyRows = output.slice(2, -1); // Skip headers and totals

  for (const sharedTxn of shared) {
    const { description, total, brandon, expense } = sharedTxn;
    let matched = false;

    for (const row of bodyRows) {
      for (let i = 2; i < row.length; i += 2) {
        const cell = row[i];
        const amount = typeof cell === "string" ? parseFloat(cell.replace(/[^\d.-]+/g, "")) : NaN;
        if (!isNaN(amount) && Math.abs(amount - total) < 0.01) {
          row[i - 1] = description;
          row[i] = `$ ${brandon.toFixed(2)}`;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      // Try to locate a subcategory column that matches the description
      const lowerExpense = expense.toLowerCase();
      const matchedSubcat = Object.entries(subcategoryIndexMap).find(([subcat]) => subcat === lowerExpense);
      const targetIndex = matchedSubcat ? matchedSubcat[1] : 1; // default to 1 if none matched

      const newRow: OutputRow = [""];
      for (let i = 1; i < headerRow.length; i += 2) {
        if (i === targetIndex) {
          newRow.push(description, `$ ${brandon.toFixed(2)}`);
        } else {
          newRow.push("", "");
        }
      }
      output.splice(output.length - 1, 0, newRow); // Insert before totals
    }
  }

  return output;
}

export async function promptForCategory(description: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`No category found for: "${description}". Please enter a category: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

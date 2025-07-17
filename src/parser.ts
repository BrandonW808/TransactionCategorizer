import { Transaction } from "./transactions";

export function parseTransactionCSV(csvText: string): Transaction[] {
    const lines = csvText.split("\n").map(line => line.trim()).filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(val => val.trim().replace(/^"|"$/g, ""));

        const row: Record<string, string> = {};
        headers.forEach((key, index) => {
            console.log(`Value: ${values[index]}`);
            row[key] = values[index] ?? "";
        });

        console.log(`Row: ${JSON.stringify(row)}`);

        const transaction: Transaction = {
            date: row["date"],
            description: row["description"],
            subDescription: row["sub-description"],
            type: row["type of transaction"],
            amount: parseFloat(row["amount"]),
            balance: parseFloat(row["balance"]) || undefined
        };

        console.log(`Pushing: ${JSON.stringify(transaction)}`);
        transactions.push(transaction);
    }

    return transactions;
}

export function parseSharedCsv(csvText: string): {
    description: string;
    total: number;
    brandon: number;
    expense: string;
}[] {
    const lines = csvText.trim().split("\n");
    const [headerLine, ...rows] = lines;

    return rows.map(line => {
        const [date, expense, description, total, brandon] = line.split(",").map(s => s.trim());
        return {
            description,
            total: parseFloat(total),
            brandon: parseFloat(brandon),
            expense: expense.toLowerCase()
        };
    });
}
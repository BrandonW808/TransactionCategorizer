import fs from "fs";
import path from "path";
import readline from "readline";
import { parseTransactionCSV, parseSharedCsv } from "./parser";
import {
    Categories,
    categorizeTransactions,
    Transaction,
    processSharedTransactions,
    OutputRow
} from "./transactions";

async function promptForCategory(description: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`No category found for: "${description}". Please enter a category (format: Main/Sub): `, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function main() {
    const inputFile = process.argv[2];
    const sharedFile = process.argv[3];
    const now = new Date();
    const outputFile = process.argv[4] || `categorized_output_${now.toISOString()}.csv`;

    if (!inputFile) {
        console.error("Usage: ts-node src/index.ts <path-to-input.csv> <shared-expenses.csv> [output.csv]");
        process.exit(1);
    }

    const csvData = fs.readFileSync(inputFile, "utf-8");
    const transactions: Transaction[] = parseTransactionCSV(csvData);

    const categories: Categories = {
        Income: {
            Kinect: ["dataannotation", "kinect"],
            Other: ["e-transfer", "deposit", "income"]
        },
        Expenses: {
            "Living Expenses": ["rent", "hydro", "utility", "insurance", "bill", "property tax"],
            "Groceries": ["walmart", "superstore", "loblaws", "costco", "iga", "super c", "the village store", "freshmarket", "athens fresh market"],
            "Pets": ["vet", "petco", "petland"],
            "Subscriptions": ["spotify", "netflix", "crave", "subscription", "prime", "virgin plus", "disney", "github"],
            "Phone Bill": ["rogers", "bell", "fido", "koodo", "phone"],
            "Alcohol": ["liquor", "beer store", "lcbo", "fpos Saq"],
            "Non-Grocery Food": ["restaurant", "ubereats", "skipthe", "fast food", "mcdonalds", "tim hortons", "coffee", "couchetard", "convenien", "A & W", "Picton On vic social", "Picton On metro", "Kettleman'S"],
            "Misc Spending": ["service charge", "fee", "bank charge", "big al's aquarium", "value village", "amzn", "affirm canada", "physio outaouais", "amazon.ca", "sail",
                "kindle", " L'As Des Jeux ", "sessions cannabis", "interest charges", "justice quebec amendes", "dollarama", "cdkeys"],
            "Automotive": ["petro-canada", "esso", "shell", "gas", "car", "tire", "maintenance", "pioneer", "macewen"],
            "Gifts": [],
            "Dates": ["cinema", "famous players", "dinner", "flower", "midtown brewing", "currah's cafe", "karlo estates", "prince eddy"],
            "Loans": ["loan", "student", "repayment", "nslsc"],
            "Trips": ["airbnb", "flight", "air canada", "hotel", "expedia", "mecp-ontpark-int-resorill"],
            "Sailboat Work": ["marine", "boat", "chandlery"]
        }
    };

    let output: OutputRow[] = await categorizeTransactions(transactions, categories);

    if (sharedFile) {
        const sharedCsv = fs.readFileSync(sharedFile, "utf-8");
        const sharedData = parseSharedCsv(sharedCsv);
        output = processSharedTransactions(output, sharedData);
    }

    const csvContent = output.map(row =>
        row.map(cell => typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell).join(",")
    ).join("\n");

    fs.writeFileSync(path.resolve(outputFile), csvContent, "utf-8");
    console.log(`✔ CSV output written to ${outputFile}`);
    console.table(output);
}

main();
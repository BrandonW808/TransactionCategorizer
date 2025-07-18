// Switch to the transaction_categorizer database
db = db.getSiblingDB('transaction_categorizer');

// Create collections
db.createCollection('users');
db.createCollection('categoryLists');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.categoryLists.createIndex({ name: 1 }, { unique: true });

// Insert default category list
db.categoryLists.insertOne({
  name: 'Default Categories',
  isDefault: true,
  categories: {
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
      "Misc Spending": ["service charge", "fee", "bank charge", "big al's aquarium", "value village", "amzn", "affirm canada", "physio outaouais", "amazon.ca", "sail", "kindle", " L'As Des Jeux ", "sessions cannabis", "interest charges", "justice quebec amendes", "dollarama", "cdkeys"],
      "Automotive": ["petro-canada", "esso", "shell", "gas", "car", "tire", "maintenance", "pioneer", "macewen"],
      "Gifts": [],
      "Dates": ["cinema", "famous players", "dinner", "flower", "midtown brewing", "currah's cafe", "karlo estates", "prince eddy"],
      "Loans": ["loan", "student", "repayment", "nslsc"],
      "Trips": ["airbnb", "flight", "air canada", "hotel", "expedia", "mecp-ontpark-int-resorill"],
      "Sailboat Work": ["marine", "boat", "chandlery"]
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');

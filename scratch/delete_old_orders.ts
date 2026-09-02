import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteOldOrders() {
  console.log("Fetching all orders from Firestore...");
  const snap = await getDocs(collection(db, "orders"));
  console.log(`Total orders found: ${snap.size}`);

  const cutoff = new Date("2026-09-01T00:00:00+05:30").getTime();
  let deletedCount = 0;
  let keptCount = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    let orderTime = 0;

    if (data.createdAt?.toDate) {
      orderTime = data.createdAt.toDate().getTime();
    } else if (data.createdAt?.seconds) {
      orderTime = data.createdAt.seconds * 1000;
    } else if (typeof data.createdAt === "string") {
      orderTime = new Date(data.createdAt).getTime();
    } else if (typeof data.date === "string") {
      orderTime = new Date(data.date).getTime();
    }

    const orderDateStr = orderTime ? new Date(orderTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "UNKNOWN";
    const customerName = data.customer?.name || data.shippingAddress?.fullName || "Unknown";
    const amount = data.totalAmount || data.total || 0;

    console.log(`Order ${docSnap.id} | Date: ${orderDateStr} | Customer: ${customerName} | ₹${amount}`);

    if (orderTime > 0 && orderTime < cutoff) {
      console.log(`  -> Deleting order ${docSnap.id} (Created: ${orderDateStr} < 01/09/2026)...`);
      await deleteDoc(doc(db, "orders", docSnap.id));
      deletedCount++;
    } else {
      console.log(`  -> Keeping order ${docSnap.id} (Created: ${orderDateStr} >= 01/09/2026)`);
      keptCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Deletion Complete:`);
  console.log(`Deleted Orders: ${deletedCount}`);
  console.log(`Kept Orders: ${keptCount}`);
  console.log(`========================================`);
}

deleteOldOrders().catch(console.error);

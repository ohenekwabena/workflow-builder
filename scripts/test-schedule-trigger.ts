import "dotenv/config";

async function main() {
  console.log("🕐 Testing schedule trigger...\n");

  const cronSecret = process.env.CRON_SECRET || "dev-secret-12345";
  const baseUrl = "http://localhost:3000";

  try {
    // Check schedules
    console.log("1. Checking for scheduled workflows...");
    const scheduleResponse = await fetch(`${baseUrl}/api/cron/check-schedules`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    console.log("   Status:", scheduleResponse.status, scheduleResponse.statusText);

    const scheduleText = await scheduleResponse.text();
    console.log("   Raw response:", scheduleText.substring(0, 200));

    try {
      const scheduleData = JSON.parse(scheduleText);
      console.log("   Parsed:", scheduleData);
    } catch (e) {
      console.log("   Could not parse JSON");
    }

    // Process queue
    console.log("\n2. Processing queued workflows...");
    const queueResponse = await fetch(`${baseUrl}/api/cron/process-queue`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const queueData = await queueResponse.json();
    console.log("   Response:", queueData);

    console.log("\n✅ Schedule trigger test completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();

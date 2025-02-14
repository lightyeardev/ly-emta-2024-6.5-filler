// popup.js
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Popup initialized");
  const csvFile = document.getElementById("csvFile");
  const fillButton = document.getElementById("fillButton");
  const stopButton = document.getElementById("stopButton");
  const progressDiv = document.getElementById("progress");
  let isProcessing = false;
  let shouldStop = false;

  function updateProgress(current, total) {
    progressDiv.textContent = `Processing: ${current}/${total} rows`;
  }

  fillButton.addEventListener("click", async function () {
    console.log("🖱️ Fill button clicked");
    if (isProcessing) return;

    const file = csvFile.files[0];
    if (!file) {
      console.error("❌ No file selected");
      return;
    }

    try {
      isProcessing = true;
      shouldStop = false;
      fillButton.disabled = true;
      stopButton.style.display = "block";
      progressDiv.style.display = "block";

      console.log(`📁 Processing file: ${file.name}`);
      const text = await file.text();
      const rows = text.split("\n").map((row) => row.split(","));
      const dataRows = rows.slice(1);

      console.log(`📊 Found ${dataRows.length} data rows`);

      if (dataRows.length === 0) {
        console.error("❌ No valid data rows found");
        return;
      }

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("🎯 Target tab found:", tab.url);

      for (let i = 0; i < dataRows.length; i++) {
        if (shouldStop) {
          console.log("🛑 Processing stopped by user");
          break;
        }

        updateProgress(i + 1, dataRows.length);
        const row = dataRows[i];
        console.log(`\n🔄 Processing row ${i + 1} of ${dataRows.length}`);

        if (row.length >= 5) {
          const formData = {
            account: row[0].replace(/"/g, ""),
            transferDate: row[1].replace(/"/g, ""),
            paymentSum: row[3].replace(/"/g, ""),
            payoutSum: row[4].replace(/"/g, ""),
          };

          console.log("📝 Prepared form data:", formData);

          console.log("📤 Sending message to content script");
          await new Promise((resolve) => {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "fillForm", data: formData },
              (response) => {
                console.log("📥 Received response:", response);
                resolve(response);
              }
            );
          });

          if (i < dataRows.length - 1 && !shouldStop) {
            console.log("⏳ Waiting 1 second(s) before next row...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } else {
          console.error(`❌ Invalid row format at index ${i}:`, row);
        }
      }
      console.log(
        shouldStop
          ? "🛑 Processing stopped"
          : "✅ All rows processed successfully"
      );
    } catch (error) {
      console.error("❌ Error during processing:", error);
    } finally {
      isProcessing = false;
      fillButton.disabled = false;
      stopButton.style.display = "none";
      stopButton.disabled = false;
      stopButton.textContent = "Stop";
      progressDiv.style.display = "none";
      shouldStop = false;
    }
  });

  stopButton.addEventListener("click", () => {
    console.log("🛑 Stop button clicked");
    shouldStop = true;
    stopButton.disabled = true;
    stopButton.textContent = "Stopping...";
  });

  csvFile.addEventListener("change", (event) => {
    console.log("📁 File selected:", event.target.files[0]?.name);
    progressDiv.style.display = "none";
  });
});

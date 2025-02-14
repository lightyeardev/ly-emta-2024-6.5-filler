// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm") {
    console.log("🔵 Received form data:", request.data);
    const { account, transferDate, paymentSum, payoutSum } = request.data;

    const fillSequentially = async () => {
      const fields = [
        {
          name: "Account",
          selector:
            "#add_financialAssetsIncome_FINANCIAL_ASSETS_INCOME_account",
          value: account,
        },
        {
          name: "Transfer Date",
          selector:
            "#add_financialAssetsIncome_FINANCIAL_ASSETS_INCOME_transferDate",
          value: transferDate,
        },
        {
          name: "Payment Sum",
          selector:
            "#add_financialAssetsIncome_FINANCIAL_ASSETS_INCOME_paymentSum",
          value: paymentSum,
        },
        {
          name: "Payout Sum",
          selector:
            "#add_financialAssetsIncome_FINANCIAL_ASSETS_INCOME_payoutSum",
          value: payoutSum,
        },
      ];

      for (const field of fields) {
        console.log(`🔄 Filling ${field.name} with value: ${field.value}`);
        const element = document.querySelector(field.selector);

        if (!element) {
          console.error(`❌ Element not found: ${field.selector}`);
          continue;
        }

        element.value = field.value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        console.log(`✅ Filled ${field.name}`);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      console.log("⏳ Waiting before clicking save button...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const saveButton = document.querySelector(
        "#add-financial-assets-income-financial-assets-income-save-button"
      );

      if (!saveButton) {
        console.error("❌ Save button not found");
        return;
      }

      console.log("🖱️ Clicking save button");
      saveButton.click();
      console.log("✅ Form submission completed");
    };

    fillSequentially().then(() => {
      console.log("✨ Row processing completed");
      sendResponse({ success: true });
    });
    return true;
  }
});

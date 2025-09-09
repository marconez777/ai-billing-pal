export const useFeatureFlags = () => {
  return {
    stripeEnabled: false, // Will be enabled when Stripe integration is ready
    aiCategorizationEnabled: false, // Will be enabled when OpenAI integration is ready
    advancedRulesEnabled: true,
    invoiceMatchingEnabled: false, // Will be enabled when matching algorithm is implemented
    recurringTransactionsEnabled: true,
    materialisedViewsEnabled: false, // Will be enabled when performance optimization is needed
    adminFeaturesEnabled: true,
    csvImportEnabled: true,
    ofxImportEnabled: false // Future feature
  };
};
const messages: Record<string, string> = {
  invalid: "Some required information is missing or invalid.",
  "auth-error": "Authentication failed. Check your credentials and try again.",
  "admin-error": "Admin password is incorrect.",
  "photo-error": "Storefront photo upload failed.",
  "create-error": "Store onboarding could not be submitted.",
  "review-error": "Store review could not be saved.",
  "message-error": "Admin message could not be published.",
  "message-saved": "Admin message published.",
  "reward-error": "Reward could not be saved.",
  "reward-saved": "Reward saved.",
  "reward-deleted": "Reward removed from active catalog.",
  "reward-delete-error": "Reward could not be removed.",
  "redeem-success": "Reward redemption submitted.",
  "redeem-error": "Reward redemption failed.",
  "reward-not-found": "Reward was not found.",
  "not-enough-points": "You do not have enough points for this reward.",
  "out-of-stock": "This reward is out of stock.",
  "redemption-error": "Reward redemption status could not be updated.",
  "redemption-updated": "Reward redemption status updated.",
  "password-required": "This store account has no password yet. Please register again or contact Back Office.",
  "password-reset": "Store password has been reset.",
  "password-reset-error": "Store password could not be reset.",
  "line-summary-sent": "LINE dashboard summary sent.",
  "line-summary-error": "LINE summary could not be sent. Check LINE environment variables in Vercel.",
  "store-not-found": "Store phone number was not found.",
  duplicate: "This QR/barcode already exists in the same tier.",
  "not-approved": "This store is not approved yet, so scans are blocked.",
  "scan-error": "Scan could not be registered.",
  success: "Scan registered successfully.",
  "store-submitted": "Store submitted for approval.",
  "review-saved": "Store status updated."
};

export function MessageBanner({ message }: { message?: string }) {
  if (!message || !messages[message]) return null;

  const isSuccess = message === "success" || message === "store-submitted" || message === "review-saved" || message === "message-saved" || message === "reward-saved" || message === "reward-deleted" || message === "redeem-success" || message === "redemption-updated" || message === "password-reset" || message === "line-summary-sent";

  return (
    <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
      isSuccess
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-ruby-900/15 bg-ruby-50 text-ruby-900"
    }`}>
      {messages[message]}
    </div>
  );
}

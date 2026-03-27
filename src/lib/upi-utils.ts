/**
 * Generates a standard UPI intent URI for mobile redirection.
 * Scheme: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
 */
export function generateUpiIntent(
  upiId: string,
  name: string,
  amount: number,
  note: string = "SurakshaPay_Payout"
): string {
  if (!upiId || upiId === 'NOT_SET') return "";

  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toString(),
    cu: "INR",
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Validates the format of a UPI ID.
 * Format: [username]@[bank_handle]
 */
export function validateUpiId(upiId: string): boolean {
  if (!upiId) return false;
  // Regex: characters allowed in username followed by @ and bank handle
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/;
  return upiRegex.test(upiId);
}

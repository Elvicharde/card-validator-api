export function luhnCheck(cardNumber: string): boolean {
  // Remove all non-digit characters from the card number
  const sanitizedCardNumber = cardNumber.replace(/\D/g, "");

  // Check if the sanitized card number is empty or has less than 2 digits
  if (sanitizedCardNumber.length < 2) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Iterate over the card number digits from right to left

  for (let i = sanitizedCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedCardNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

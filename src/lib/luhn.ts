export function isLuhnValid(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Iterate over the card number digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number(cardNumber[i]);

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

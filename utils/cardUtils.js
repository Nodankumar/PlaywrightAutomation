/**
 * generateLuhnNumber(length = 16)
 *
 * Creates a random numeric string of the requested length that satisfies the
 * Luhn check (mod 10 checksum) used by many card numbers. Steps:
 * 1. Populate an array with length-1 random digits (these are the payload).
 * 2. Compute the Luhn checksum by iterating the digits from right to left,
 *    doubling every second digit (from the right). If doubling produces a
 *    value > 9, subtract 9 (equivalent to summing the digits).
 * 3. Sum all transformed digits and compute the final check digit so that
 *    (sum + checkDigit) % 10 == 0. Append that check digit to produce a
 *    valid Luhn number and return it as a string.
 */
export function generateLuhnNumber(length = 16) {
  // generate first length-1 digits randomly
  const digits = [];
  for (let i = 0; i < length - 1; i++) digits.push(Math.floor(Math.random() * 10));
  // calculate check digit
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = digits[digits.length - 1 - i];
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  digits.push(checkDigit);
  return digits.join('');
}


/**
 * generateCVV(length = 3)
 *
 * Returns a string of random numeric digits of the specified length (default 3).
 * Implementation: builds the CVV by appending length random digits (0-9) to a
 * string and returns the result. Example output: "482".
 */
export function generateCVV(length = 3) {
  let cvv = '';
  for (let i = 0; i < length; i++) cvv += Math.floor(Math.random() * 10);
  return cvv;
}

/**
 * generateExpiry()
 *
 * Returns a string representing a random card expiry date in MM/YY format.
 * - Month: random between 01 and 12 (zero-padded).
 * - Year: current year plus 1..5 years, then truncated to two digits.
 * Example output: "07/29".
 */
export function generateExpiry() {
  // Generate a random month (01-12)
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  
  // Generate a random year (current year + 1 to 5 years in the future)
  const currentYear = new Date().getFullYear();
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1).slice(-2);
  
  return `${month}/${year}`;
}

/**
 * generateCardName()
 *
 * Returns a plausible cardholder name in the common "FIRST LAST" format,
 * in uppercase as typically printed on cards. Uses small lists of sample
 * first and last names and picks randomly.
 */
export function generateCardName() {
  const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Sam', 'Cameron', 'Dylan'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Clark', 'Wright'];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`.toUpperCase();
}




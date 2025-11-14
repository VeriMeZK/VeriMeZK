// MRZ parsing utilities
import type { MRZData } from '@/types';

export function parseMRZ(mrzText: string): MRZData | null {
  const lines = mrzText.split('\n').filter((line) => line.trim().length > 0);
  
  if (lines.length < 2) return null;

  try {
    // Parse TD3 format (passport) - 3 lines
    if (lines.length >= 3) {
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2];

      const documentType = line1.substring(0, 1);
      const countryCode = line1.substring(2, 5);
      const name = line1.substring(5).replace(/</g, ' ').trim();
      const passportNumber = line2.substring(0, 9).replace(/</g, '');
      const nationality = line2.substring(10, 13);
      const dob = line2.substring(13, 19);
      const gender = line2.substring(20, 21);
      const expiryDate = line2.substring(21, 27);
      const personalNumber = line3.substring(0, 14).replace(/</g, '');

      // Parse DOB: YYMMDD -> Date
      const year = parseInt('20' + dob.substring(0, 2));
      const month = parseInt(dob.substring(2, 4)) - 1;
      const day = parseInt(dob.substring(4, 6));

      // Parse expiry: YYMMDD -> Date
      const expYear = parseInt('20' + expiryDate.substring(0, 2));
      const expMonth = parseInt(expiryDate.substring(2, 4)) - 1;
      const expDay = parseInt(expiryDate.substring(4, 6));

      return {
        documentType,
        countryCode,
        name,
        passportNumber,
        nationality,
        dob: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        gender,
        expiryDate: `${expYear}-${String(expMonth + 1).padStart(2, '0')}-${String(expDay).padStart(2, '0')}`,
        personalNumber: personalNumber || undefined,
      };
    }
  } catch (error) {
    console.error('MRZ parsing error:', error);
    return null;
  }

  return null;
}


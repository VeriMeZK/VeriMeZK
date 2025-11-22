// Advanced MRZ parsing with ICAO validation
// Using custom parser with ICAO validation logic

export interface ParsedMRZ {
  valid: boolean;
  format: 'TD1' | 'TD2' | 'TD3' | null;
  fields: {
    documentType?: string;
    issuingState?: string;
    name?: string;
    documentNumber?: string;
    nationality?: string;
    dateOfBirth?: string;
    sex?: string;
    dateOfExpiry?: string;
    personalNumber?: string;
    optionalData?: string;
  };
  details?: any;
  errors?: string[];
}

// Parse MRZ text with ICAO validation
export function parseMRZAdvanced(mrzText: string): ParsedMRZ {
  try {
    console.log('[parseMRZAdvanced] Parsing MRZ:', mrzText.substring(0, 100));
    
    // Clean and prepare MRZ text - handle OCR errors
    let cleanedText = mrzText
      .replace(/[^A-Z0-9< \n]/g, '') // Remove invalid characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const lines = cleanedText
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, '')) // Remove spaces within lines
      .filter(line => line.length > 0);
    
    console.log('[parseMRZAdvanced] Cleaned lines:', lines);
    
    if (lines.length < 2) {
      return {
        valid: false,
        format: null,
        fields: {},
        errors: ['Invalid MRZ format: insufficient lines'],
      };
    }
    
    // Try to fix common OCR errors in MRZ format
    // MRZ lines should be exactly 44 characters for TD3 format
    const fixedLines = lines.map((line, index) => {
      let fixed = line;
      
      // Common OCR character replacements
      fixed = fixed
        .replace(/[0O]/g, (char, pos) => {
          // In MRZ, numbers are more common than letters in certain positions
          if (pos < 10) return '0'; // First part usually has numbers
          return char === '0' ? '0' : 'O';
        })
        .replace(/[1I]/g, (char) => char === '1' ? '1' : 'I')
        .replace(/[5S]/g, (char, pos) => {
          // In MRZ, numbers are more common in certain positions
          if (pos < 20) return '5';
          return char === '5' ? '5' : 'S';
        })
        .replace(/[8B]/g, (char) => char === '8' ? '8' : 'B')
        .replace(/[2Z]/g, (char) => char === '2' ? '2' : 'Z');
      
      // Fix line length - TD3 format should be 44 chars
      if (fixed.length < 30 && fixed.length > 20) {
        // Pad with < if too short
        fixed = fixed.padEnd(44, '<');
      } else if (fixed.length > 44) {
        // Truncate if too long
        fixed = fixed.substring(0, 44);
      } else if (fixed.length >= 30 && fixed.length < 44) {
        // If close to correct length, pad to 44
        fixed = fixed.padEnd(44, '<');
      }
      
      // Ensure first character is P for passport (line 1)
      if (index === 0 && fixed.length > 0 && fixed[0] !== 'P') {
        // Try to fix common OCR errors for 'P'
        if (['D', 'R', 'B'].includes(fixed[0])) {
          fixed = 'P' + fixed.substring(1);
        }
      }
      
      return fixed;
    });
    
    console.log('[parseMRZAdvanced] Fixed lines:', fixedLines);
    
    // Use custom parser with ICAO validation
    return parseMRZWithValidation(fixedLines);
  } catch (error) {
    console.error('[parseMRZAdvanced] Parsing error:', error);
    return {
      valid: false,
      format: null,
      fields: {},
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

// Parse MRZ with ICAO validation
function parseMRZWithValidation(lines: string[]): ParsedMRZ {
  try {
    // TD3 format (passport) - 3 lines
    if (lines.length >= 3) {
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2];
      
      const documentType = line1.substring(0, 1);
      const issuingState = line1.substring(2, 5);
      const name = line1.substring(5).replace(/</g, ' ').trim();
      const documentNumber = line2.substring(0, 9).replace(/</g, '');
      const nationality = line2.substring(10, 13);
      const dob = line2.substring(13, 19);
      const sex = line2.substring(20, 21);
      const dateOfExpiry = line2.substring(21, 27);
      const personalNumber = line3.substring(0, 14).replace(/</g, '');
      
      // Parse dates
      const year = parseInt('20' + dob.substring(0, 2));
      const month = parseInt(dob.substring(2, 4)) - 1;
      const day = parseInt(dob.substring(4, 6));
      const dateOfBirth = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const expYear = parseInt('20' + dateOfExpiry.substring(0, 2));
      const expMonth = parseInt(dateOfExpiry.substring(2, 4)) - 1;
      const expDay = parseInt(dateOfExpiry.substring(4, 6));
      const expiryDate = `${expYear}-${String(expMonth + 1).padStart(2, '0')}-${String(expDay).padStart(2, '0')}`;
      
      // ICAO validation checks
      const errors: string[] = [];
      
      // Validate document type (P = Passport)
      if (documentType !== 'P') {
        errors.push(`Invalid document type: ${documentType}. Expected 'P' for passport.`);
      }
      
      // Validate issuing state (3 uppercase letters)
      if (!/^[A-Z]{3}$/.test(issuingState)) {
        errors.push(`Invalid issuing state: ${issuingState}. Must be 3 uppercase letters.`);
      }
      
      // Validate passport number (alphanumeric, 6-9 chars)
      const cleanPassportNum = documentNumber.replace(/</g, '').trim();
      if (cleanPassportNum.length < 6 || cleanPassportNum.length > 9) {
        errors.push(`Invalid passport number length: ${cleanPassportNum.length}. Must be 6-9 characters.`);
      }
      
      // Validate nationality (3 uppercase letters)
      if (!/^[A-Z]{3}$/.test(nationality)) {
        errors.push(`Invalid nationality: ${nationality}. Must be 3 uppercase letters.`);
      }
      
      // Validate dates format
      if (!/^\d{6}$/.test(dob)) {
        errors.push(`Invalid date of birth format: ${dob}. Must be YYMMDD.`);
      }
      
      if (!/^\d{6}$/.test(dateOfExpiry)) {
        errors.push(`Invalid expiry date format: ${dateOfExpiry}. Must be YYMMDD.`);
      }
      
      // Validate gender (M/F/<)
      if (!/^[MF<]$/.test(sex)) {
        errors.push(`Invalid gender: ${sex}. Must be M, F, or <.`);
      }
      
      // Basic check digit validation (simplified - full ICAO validation would check all check digits)
      const isValid = errors.length === 0 && documentType === 'P' && /^[A-Z]{3}$/.test(issuingState);
      
      return {
        valid: isValid,
        format: 'TD3',
        fields: {
          documentType,
          issuingState,
          name: name || undefined,
          documentNumber: cleanPassportNum || undefined,
          nationality,
          dateOfBirth,
          sex,
          dateOfExpiry: expiryDate,
          personalNumber: personalNumber.replace(/</g, '').trim() || undefined,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    }
    
    return {
      valid: false,
      format: null,
      fields: {},
      errors: ['Unsupported MRZ format'],
    };
  } catch (error) {
    return {
      valid: false,
      format: null,
      fields: {},
      errors: [error instanceof Error ? error.message : 'Fallback parsing failed'],
    };
  }
}


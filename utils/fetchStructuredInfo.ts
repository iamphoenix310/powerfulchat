// In @/utils/fetchStructuredInfo.ts

interface AiJsonResponseWrapper<DataType> {
  [key: string]: DataType;
}

export const fetchStructuredInfo = async <T>(
  celebrityName: string,
  expectedJsonKey: string,
  promptForAI: string
): Promise<T | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://visitpowerful.com'}/api/generateCelebInfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: celebrityName, infoType: promptForAI }),
    });

    if (!response.ok) {
      console.error(`[fetchStructuredInfo] HTTP error for "${expectedJsonKey}" (${celebrityName}): ${response.status}`);
      return null;
    }

    const apiResult = await response.json();
    let originalText = apiResult.text?.trim();

    if (!originalText) {
      console.warn(`[fetchStructuredInfo] No text response from AI for "${expectedJsonKey}" (${celebrityName})`);
      return null;
    }

    let dataToParse = originalText;

    // Remove markdown code fences if present
    if (dataToParse.startsWith("```json")) {
      dataToParse = dataToParse.substring(7).trim();
    } else if (dataToParse.startsWith("```")) {
      dataToParse = dataToParse.substring(3).trim();
    }
    if (dataToParse.endsWith("```")) {
      dataToParse = dataToParse.substring(0, dataToParse.length - 3).trim();
    }

    // Attempt 1: Parse directly
    try {
      const parsedData: AiJsonResponseWrapper<T> = JSON.parse(dataToParse);
      if (expectedJsonKey in parsedData) {
        const value = parsedData[expectedJsonKey];
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          console.warn(`[fetchStructuredInfo] Empty or null value for "${expectedJsonKey}" (${celebrityName})`);
        }
        return value ?? null;
      }
    } catch (e1) {
      // Attempt 2: Double-parsed string literal
      try {
        let potentiallyWrappedString = dataToParse;

        if (potentiallyWrappedString.startsWith('"') && potentiallyWrappedString.endsWith('"')) {
          potentiallyWrappedString = JSON.parse(potentiallyWrappedString);
        }

        const parsedDataAttempt2: AiJsonResponseWrapper<T> = JSON.parse(potentiallyWrappedString);
        if (expectedJsonKey in parsedDataAttempt2) {
          return parsedDataAttempt2[expectedJsonKey];
        }
      } catch (e2) {
        // Attempt 3: Special fix for height formatting issues
        if (expectedJsonKey === 'height' && typeof dataToParse === 'string' && dataToParse.includes('"height"')) {
          try {
            const fixedHeightString = dataToParse.replace(
              /(["']height["']\s*:\s*["']\s*\d+'\s*\d+)\s*(")\s*(\([^)]*\)\s*["']\s*[},])/g,
              '$1\\\\"$3'
            );
            const parsedDataAttempt3: AiJsonResponseWrapper<T> = JSON.parse(fixedHeightString);
            if (expectedJsonKey in parsedDataAttempt3) {
              return parsedDataAttempt3[expectedJsonKey];
            }
          } catch (e3) {
            // Height-specific fix also failed
          }
        }

        // ✅ Final Fallback: Return raw string if usable
        if (typeof dataToParse === 'string' && dataToParse.length > 1) {
          console.warn(`[fetchStructuredInfo] Using raw string fallback for "${expectedJsonKey}" (${celebrityName}): "${dataToParse}"`);
          return dataToParse as unknown as T;
        }

        // All failed
        console.error(`[fetchStructuredInfo] All parsing attempts FAILED for "${expectedJsonKey}" (${celebrityName}). Final string was:`, dataToParse);
        return null;
      }
    }

    // If JSON parsing succeeded but key was not found
    console.warn(`[fetchStructuredInfo] Key "${expectedJsonKey}" not found in AI response for ${celebrityName}.`);
    return null;

  } catch (error) {
    console.error(`[fetchStructuredInfo] Unexpected outer error for "${expectedJsonKey}" (${celebrityName}):`, error);
    return null;
  }
};

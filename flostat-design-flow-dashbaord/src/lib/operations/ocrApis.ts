const OCR_UPLOAD_URL = import.meta.env.VITE_OCR_UPLOAD_URL || 'https://x4p8fv9g1g.execute-api.ap-south-1.amazonaws.com/prod/upload';
const OCR_EXTRACT_URL = import.meta.env.VITE_OCR_EXTRACT_URL || 'https://x4p8fv9g1g.execute-api.ap-south-1.amazonaws.com/prod/extract';

export interface OCRResponse {
    success: boolean;
    data?: {
        text?: string;
        extractedData?: Array<{
            label: string;
            value: string;
            confidence?: number;
        }>;
        rawText?: string;
    };
    message?: string;
    error?: string;
}

interface UploadResponse {
    success: boolean;
    s3Key?: string;
    key?: string;
    message?: string;
    error?: string;
}

/**
 * Convert file to PNG and return base64
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                // Convert to PNG base64
                const pngDataUrl = canvas.toDataURL('image/png');
                const base64 = pngDataUrl.split(',')[1];
                resolve(base64);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function uploadFileToS3(
    file: File,
    authToken?: string | null
): Promise<string> {
    try {
        const base64Data = await fileToBase64(file);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const requestBody = {
            imageData: base64Data,
            fileName: file.name.replace(/\.[^/.]+$/, '') + '.png',
            fileType: 'image/png',
            fileExtension: 'png',
        };

        const response = await fetch(OCR_UPLOAD_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`File upload failed: ${response.status} - ${errorText}`);
        }

        const result: UploadResponse = await response.json();

        if (!result.success) {
            throw new Error(result.error || result.message || 'Upload failed');
        }

        const s3Key = result.s3Key || result.key;
        if (!s3Key) {
            throw new Error('No S3 key returned from upload');
        }

        return s3Key;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

async function extractTextFromS3(
    s3Key: string,
    authToken?: string | null
): Promise<OCRResponse> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const requestBody = {
            s3Key: s3Key,
        };

        const response = await fetch(OCR_EXTRACT_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OCR extraction failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Extraction Error:', error);
        throw error;
    }
}

export async function uploadFileForOCR(
    file: File,
    authToken?: string | null
): Promise<OCRResponse> {
    try {
        const s3Key = await uploadFileToS3(file, authToken);
        const result = await extractTextFromS3(s3Key, authToken);
        return result;
    } catch (error) {
        console.error('OCR API Error:', error);
        throw error;
    }
}

export function parseOCRResponse(response: OCRResponse) {
    console.log('parseOCRResponse - Full response:', JSON.stringify(response, null, 2));

    const extractedItems: Array<{
        id: string;
        label: string;
        value: string;
        confidence: number;
    }> = [];

    let rawText = '';

    if (response.success) {
        const responseAny = response as any;

        // Lambda format with 'readings' and 'fullText' arrays
        if (responseAny.readings && Array.isArray(responseAny.readings)) {
            responseAny.readings.forEach((reading: any, index: number) => {
                extractedItems.push({
                    id: `reading-${index}`,
                    label: reading.originalText || `Reading ${index + 1}`,
                    value: reading.value || '',
                    confidence: reading.confidence === 'high' ? 95 : reading.confidence === 'medium' ? 75 : 50,
                });
            });
        }

        if (responseAny.fullText && Array.isArray(responseAny.fullText)) {
            rawText = responseAny.fullText.join('\n');
        }

        // Fallback: response.data format
        if (!rawText && response.data) {
            rawText = response.data.rawText || response.data.text || '';

            if (response.data.extractedData && Array.isArray(response.data.extractedData)) {
                response.data.extractedData.forEach((item, index) => {
                    extractedItems.push({
                        id: `item-${index}`,
                        label: item.label || `Field ${index + 1}`,
                        value: item.value || '',
                        confidence: item.confidence || 0,
                    });
                });
            }
        }

        // Direct text fields
        if (!rawText && responseAny.text) {
            rawText = responseAny.text;
        }

        if (!rawText && responseAny.extractedText) {
            rawText = responseAny.extractedText;
        }

        console.log('Parsed rawText:', rawText);

        // Parse raw text into items if no structured data
        if (extractedItems.length === 0 && rawText) {
            const lines = rawText.split('\n').filter(line => line.trim());
            lines.forEach((line, index) => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    extractedItems.push({
                        id: `item-${index}`,
                        label: parts[0].trim(),
                        value: parts.slice(1).join(':').trim(),
                        confidence: 95,
                    });
                } else {
                    extractedItems.push({
                        id: `item-${index}`,
                        label: `Line ${index + 1}`,
                        value: line.trim(),
                        confidence: 90,
                    });
                }
            });
        }
    }

    console.log('Final extractedItems:', extractedItems);
    console.log('Final rawText:', rawText);

    return { extractedItems, rawText };
}

import { NextResponse } from 'next/server';

interface ResourceMethod {
  resourcesName?: string;
  method?: string;
  description?: string;
  [key: string]: any;
}

interface Resources {
  [key: string]: ResourceMethod;
}

interface TranslationContent {
  description?: string;
  resources?: Resources;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Get the original request structure to maintain it in the response
    const originalDescription = body.content?.description || '';
    const originalResources = (body.content?.resources || {}) as Resources;

    const response = await fetch('https://rag-endpoints.onrender.com/market/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();    
    if (!data.translation) {
      return NextResponse.json({ error: 'No translation in response' }, { status: 500 });
    }
    
    // Parse the translation string
    try {
      let translationStr = data.translation.trim();
      let parsedResult: {
        description: string;
        resources: Resources;
      } = {
        description: originalDescription,
        resources: {} as Resources
      };
      
      // Check for markdown code blocks with JSON content
      const markdownMatch = translationStr.match(/```(?:json|plaintext)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch) {
        // Extract content from markdown code block
        const extractedContent = markdownMatch[1].trim();
        
        try {
          // Try to clean up and parse the JSON content
          // First, fix any malformed JSON with extra spaces in property names
          let cleanedJson = extractedContent
            .replace(/"\s*resourcesName\s*":\s*"/, '"resourcesName":"') // Fix resourcesName with spaces
            .replace(/"\s*resourcesN\s*Name\s*":\s*"/, '"resourcesName":"') // Fix resourcesName with spaces
            .replace(/"\s*method\s*":\s*"/, '"method":"') // Fix method with spaces
            .replace(/"\s*description\s*":\s*"/, '"description":"'); // Fix description with spaces          
          // Try to parse the cleaned JSON
          const parsedJson = JSON.parse(cleanedJson);
          
          // Update the result with parsed content
          if (parsedJson.description) {
            parsedResult.description = parsedJson.description;
          }
          
          // Handle resources if present
          if (parsedJson.resources) {
            // Map resources to maintain original structure but update descriptions
            Object.keys(originalResources).forEach(key => {
              if (parsedJson.resources[key]) {
                // Make sure resourceId from the original request is preserved
                const resourceId = originalResources[key].resourceId;
                
                parsedResult.resources[key] = {
                  ...originalResources[key],
                  description: parsedJson.resources[key].description || originalResources[key].description,
                  // Explicitly preserve resourceId
                  resourceId: resourceId
                };
              } else {
                parsedResult.resources[key] = originalResources[key];
              }
            });
          }
          
          return NextResponse.json(parsedResult);
        } catch (jsonParseError) {
          console.error('Failed to parse JSON from markdown code block:', jsonParseError);
          // If parsing fails, continue with the extracted content for further processing
          translationStr = extractedContent;
        }
      }
      
      // Remove outer quotes if present
      if (translationStr.startsWith('"') && translationStr.endsWith('"')) {
        translationStr = translationStr.substring(1, translationStr.length - 1);
      }
      
      // Check for language='Thai' content={...} format
      const languageContentMatch = translationStr.match(/language=['"](.+?)['"](\s+|\s*,\s*)content=({.*})/i);
      // Check for Content={...} format without language prefix
      const contentOnlyMatch = translationStr.match(/^Content=({.*})/i);
      // Check for Content: {...} format with colon
      const contentColonMatch = translationStr.match(/^Content:\s*({.*})/i);
      
      // Process Content: {...} format with colon
      if (contentColonMatch) {
        try {
          // Extract and clean up the content part
          let contentStr = contentColonMatch[1]
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/"([^"]+)":/g, '"$1":') // Ensure keys are properly quoted
            .replace(/:\s*"([^"]+)"(,|\})/g, ': "$1"$2') // Ensure values are properly quoted
            .replace(/description\s*':/g, '"description":') // Fix malformed description key
            .replace(/คำอธิบาย/g, 'description') // Replace Thai keys with English
            .replace(/ทรัพยากร/g, 'resources')
            .replace(/ชื่อทรัพยากร/g, 'resourcesName')
            .replace(/วิธีการ/g, 'method');
          
          // Try to parse the content
          const parsedContent = JSON.parse(contentStr) as TranslationContent;
          
          // Only update descriptions, keep original structure
          parsedResult.description = parsedContent.description || originalDescription;
          
          // Process resources
          const translatedResources = parsedContent.resources || {};
          
          // Create a new resources object with the same keys as the original
          Object.keys(originalResources).forEach(key => {
            // If we have a translation for this resource, use it, otherwise keep original
            if (translatedResources[key]) {
              parsedResult.resources[key] = {
                ...originalResources[key],
                // Only update the description
                description: translatedResources[key].description || originalResources[key].description
              };
            } else {
              parsedResult.resources[key] = originalResources[key];
            }
          });
          
          return NextResponse.json(parsedResult);
        } catch (parseError) {
          console.error('Failed to parse Content: format:', parseError);
          // Continue to other parsing methods
        }
      }
      // Process language+content format
      else if (languageContentMatch) {
        try {
          // Extract and clean up the content part
          let contentStr = languageContentMatch[3]
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/"([^"]+)":/g, '"$1":') // Ensure keys are properly quoted
            .replace(/:\s*"([^"]+)"(,|\})/g, ': "$1"$2') // Ensure values are properly quoted
            .replace(/คำอธิบาย/g, 'description') // Replace Thai keys with English
            .replace(/ทรัพยากร/g, 'resources')
            .replace(/ชื่อทรัพยากร/g, 'resourcesName')
            .replace(/วิธีการ/g, 'method');
          
          // Try to parse the content
          const parsedContent = JSON.parse(contentStr) as TranslationContent;
          
          // Only update descriptions, keep original structure
          parsedResult.description = parsedContent.description || originalDescription;
          
          // Process resources
          const translatedResources = parsedContent.resources || {};
          
          // Create a new resources object with the same keys as the original
          Object.keys(originalResources).forEach(key => {
            // If we have a translation for this resource, use it, otherwise keep original
            if (translatedResources[key]) {
              parsedResult.resources[key] = {
                ...originalResources[key],
                // Only update the description
                description: translatedResources[key].description || originalResources[key].description
              };
            } else {
              parsedResult.resources[key] = originalResources[key];
            }
          });
          
          return NextResponse.json(parsedResult);
        } catch (parseError) {
          console.error('Failed to parse language+content match:', parseError);
          // Continue to other parsing methods
        }
      }
      // Process Content={...} format without language prefix
      else if (contentOnlyMatch) {
        try {
          // Extract and clean up the content part
          let contentStr = contentOnlyMatch[1]
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/"([^"]+)":/g, '"$1":') // Ensure keys are properly quoted
            .replace(/:\s*"([^"]+)"(,|\})/g, ': "$1"$2') // Ensure values are properly quoted
            .replace(/คำอธิบาย/g, 'description') // Replace Thai keys with English
            .replace(/ทรัพยากร/g, 'resources')
            .replace(/ชื่อทรัพยากร/g, 'resourcesName')
            .replace(/วิธีการ/g, 'method');
          
          // Try to parse the content
          const parsedContent = JSON.parse(contentStr) as TranslationContent;
          
          // Only update descriptions, keep original structure
          parsedResult.description = parsedContent.description || originalDescription;
          
          // Process resources
          const translatedResources = parsedContent.resources || {};
          
          // Create a new resources object with the same keys as the original
          Object.keys(originalResources).forEach(key => {
            // If we have a translation for this resource, use it, otherwise keep original
            if (translatedResources[key]) {
              parsedResult.resources[key] = {
                ...originalResources[key],
                // Only update the description
                description: translatedResources[key].description || originalResources[key].description
              };
            } else {
              parsedResult.resources[key] = originalResources[key];
            }
          });
          
          return NextResponse.json(parsedResult);
        } catch (parseError) {
          console.error('Failed to parse content-only match:', parseError);
          // Continue to other parsing methods
        }
      }
      
      // Try direct JSON parsing
      try {
        // Clean up the JSON string first
        let cleanedJson = translationStr
          .replace(/"\s*resourcesName\s*":\s*"/, '"resourcesName":"') // Fix resourcesName with spaces
          .replace(/"\s*resourcesN\s*Name\s*":\s*"/, '"resourcesName":"') // Fix resourcesName with spaces
          .replace(/"\s*method\s*":\s*"/, '"method":"') // Fix method with spaces
          .replace(/"\s*description\s*":\s*"/, '"description":"'); // Fix description with spaces
        
        const parsedContent = JSON.parse(cleanedJson) as TranslationContent;
        
        // Only update descriptions, keep original structure
        parsedResult.description = parsedContent.description || originalDescription;
        
        // Process resources
        const translatedResources = parsedContent.resources || {};
        
        Object.keys(originalResources).forEach(key => {
          if (translatedResources[key]) {
            // Make sure resourceId from the original request is preserved
            const resourceId = originalResources[key].resourceId;
            
            parsedResult.resources[key] = {
              ...originalResources[key],
              description: translatedResources[key].description || originalResources[key].description,
              // Explicitly preserve resourceId
              resourceId: resourceId
            };
          } else {
            parsedResult.resources[key] = originalResources[key];
          }
        });
        
        return NextResponse.json(parsedResult);
      } catch (directParseError) {
        // If the response contains a simple translated string for a single resource
        if (Object.keys(originalResources).length === 1) {
          const resourceKey = Object.keys(originalResources)[0];
          
          // Extract just the translated text if it's a simple string response
          const simpleTranslationMatch = translationStr.match(/into Thai is: "([^"]+)"/);
          if (simpleTranslationMatch) {
            const translatedDescription = simpleTranslationMatch[1];
            
            parsedResult.resources[resourceKey] = {
              ...originalResources[resourceKey],
              description: translatedDescription
            };
            
            return NextResponse.json(parsedResult);
          }
        }
        
        // Try to extract descriptions from plain text response
        // For responses like: "ในการเชื่อมต่อ API ของ Cloudinary คุณสามารถทำตามขั้นตอนดังนี้:\n\n- **อัปโหลดรูปภาพไปยัง Cloudinary**: ใช้เส้นทาง `/upload`..."
        try {
          // Set the description if it looks like a description
          if (translationStr.length < 100 && !translationStr.includes('**')) {
            parsedResult.description = translationStr;
          }
          
          // Try to extract resource descriptions from bullet points
          const bulletMatches = translationStr.matchAll(/\*\*([^*]+)\*\*:\s*([^\n]+)/g);
          let matchCount = 0;
          
          for (const match of bulletMatches) {
            const description = match[1].trim();
            matchCount++;
            
            // Try to find a matching resource by comparing descriptions
            Object.keys(originalResources).forEach((key, index) => {
              if (index === matchCount - 1) { // Match by position if descriptions don't match
                parsedResult.resources[key] = {
                  ...originalResources[key],
                  description: description
                };
              }
            });
          }
          
          if (matchCount > 0) {
            return NextResponse.json(parsedResult);
          }
        } catch (plainTextError) {
          console.error('Failed to extract from plain text:', plainTextError);
        }
        
        // If all else fails, return the original content structure with the translation as description
        console.error('Failed to parse translation, using fallback:', directParseError);
        return NextResponse.json({
          description: originalDescription,
          resources: originalResources
        });
      }
    } catch (parseError) {
      console.error('Failed to parse translation:', parseError);
      console.error('Raw translation string:', data.translation);
      
      // Return original content if parsing fails
      return NextResponse.json({ 
        description: originalDescription,
        resources: originalResources
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}

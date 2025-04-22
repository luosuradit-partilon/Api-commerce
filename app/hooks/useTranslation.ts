import { useCallback, useState } from 'react';
import useLanguage from './useLanguage';

interface ResourceMethod {
  resourcesName: string;
  method: string;
  description: string;
  resourceId?: string; // Optional resourceId for mapping back to methods
}

interface TranslationRequest {
  language: string;
  content: {
    description: string;
    resources: {
      [key: string]: ResourceMethod;
    };
  };
}

interface TranslationResponse {
  translation: string;
}

const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    description: string;
    resources: any[];
    methods: any[];
  }>({ description: '', resources: [], methods: [] });

  // This function handles translating both content description and method descriptions in one request
  const translateContent = useCallback(async (
    description: string,
    resources?: Array<{ resourcesName: string; method: string; description: string; resourceId?: string; }>
  ) => {
    if (language === 'English') {
      return { description, resources, methods: resources };
    }
    
    setIsTranslating(true);

    try {
      const resourcesObj: { [key: string]: ResourceMethod } = {};
      
      // Filter out resources with blank resourcesName before sending to API
      let filteredResources = resources?.filter(resource => 
        resource.resourcesName && resource.resourcesName.trim() !== ''
      );
      
      // If all resources were filtered out (all had blank names), keep at least one resource
      if (resources?.length && (!filteredResources || filteredResources.length === 0)) {
        // Use the first resource as a fallback
        filteredResources = [resources[0]];
      }
      
      // Create new object with filtered resources
      filteredResources?.forEach((resource, index) => {
        resourcesObj[String(index + 1).padStart(2, '0')] = {
          resourcesName: resource.resourcesName,
          method: resource.method,
          description: resource.description,
          resourceId: resource.resourceId // Preserve resourceId for mapping back
        };
      });

      const requestBody: TranslationRequest = {
        language,
        content: {
          description,
          resources: resourcesObj
        }
      };

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const translatedContent = await response.json();
      
      // Create the result object with translated content
      // Map the translated resources back to the original structure with resourceIds
      const translatedResources = translatedContent.resources || {};
      
      // Create an array of translated methods with resourceIds preserved
      const translatedMethods = Object.entries(translatedResources).map(([key, resource]) => {
        const typedResource = resource as ResourceMethod;
        return {
          resourcesName: typedResource.resourcesName || '',
          method: typedResource.method || '',
          description: typedResource.description || '',
          // Ensure resourceId is preserved from the original request
          resourceId: typedResource.resourceId
        };
      });
      
      const result = {
        description: translatedContent.description,
        resources: Object.values(translatedResources),
        methods: translatedMethods
      };
      
      // Save the last translation result
      setLastTranslation(result);
      setIsTranslating(false);
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      return { description, resources, methods: resources }; // Return original content on error
    }
  }, [language]);

  return { 
    translateContent,
    isTranslating,
    lastTranslation
  };
};

export default useTranslation;

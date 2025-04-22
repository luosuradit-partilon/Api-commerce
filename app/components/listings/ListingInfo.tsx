"use client";

import useCountries from "@/app/hooks/useCountries";
import { SafeMethod, SafeResource, SafeUser } from "@/app/types";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import dynamic from "next/dynamic";
import ListingResources from "./ListingResources";
import useTranslation from "@/app/hooks/useTranslation";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("../Map"), { ssr: false });

interface ListingInfoProps {
   user: SafeUser;
   description: string;
   guestCount: number;
   roomCount: number;
   bathroomCount: number;
   category:
      | {
           icon: IconType;
           label: string;
           description: string;
        }
      | undefined;

   locationValue: string;
   resources?: SafeResource[];
   methods?: SafeMethod[] | null;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
   user,
   description,
   guestCount,
   roomCount,
   bathroomCount,
   category,
   locationValue,
   resources,
   methods,
}) => {
   const { getByValue } = useCountries();
   const { translateContent, isTranslating, lastTranslation } = useTranslation();
   const [translatedDescription, setTranslatedDescription] = useState(description);
   const [translatedResources, setTranslatedResources] = useState(resources);
   const [translatedMethods, setTranslatedMethods] = useState(methods);

   useEffect(() => {
     const translate = async () => {
       // Create a combined array of resources with method descriptions
       const resourcesWithMethods: Array<{
         resourcesName: string;
         method: string;
         description: string;
         resourceId?: string;
       }> = [];
       
       if (resources && methods) {
         // Map methods to their resources for translation
         methods.forEach(method => {
           const resource = resources.find(r => r.id === method.resourceId);
           if (resource) {
             resourcesWithMethods.push({
               resourcesName: resource.resourceName || '',
               method: method.type,
               description: method.description,
               resourceId: method.resourceId // Keep track of resourceId for mapping back
             });
           }
         });
       }
       
       // Make a single translation request with both content and methods
       const translated = await translateContent(description, resourcesWithMethods);
       
       setTranslatedDescription(translated.description);
       
       // Handle translated resources
       if (resources) {
         // Just pass the resources as they are, no need to modify them
         setTranslatedResources(resources);
       }
       
       // Handle translated methods
       if (methods) {
         // Map the translated method descriptions back to the original methods
         const translatedMethodsArray = translated.methods || [];
         
         const updatedMethods = methods.map(method => {
           // Find the corresponding translated method by resourceId
           const translatedMethod = translatedMethodsArray.find((m: any) => 
             m.resourceId === method.resourceId
           );
           
           return {
             ...method,
             description: translatedMethod?.description || method.description
           };
         });
         
         setTranslatedMethods(updatedMethods);
       }
     };
     
     translate();
   }, [description, resources, methods, translateContent]);

   const coordinates = getByValue(locationValue)?.latlng;
   return (

      <div className="col-span-4 flex flex-col gap-8">
         <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold flex flex-row items-center gap-2">
               <div>Published by {user?.name}</div>
               <Avatar src={user?.image} />
            </div>
            <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
               <div>{guestCount} guests.</div>
               <div>{roomCount} rooms.</div>
               <div>{bathroomCount} bathrooms.</div>
            </div>
         </div>
         <hr />
         {category && (
            <ListingCategory
               icon={category.icon}
               label={category.label}
               description={category.description}
            />
         )}
         <hr />
         <div className="text-lg font-light text-neutral-500 ">{translatedDescription}</div>
         <hr />
         <ListingResources 
            resources={translatedResources} 
            methods={translatedMethods} 
            isTranslating={isTranslating} 
         />
      </div>
   );
};

export default ListingInfo;

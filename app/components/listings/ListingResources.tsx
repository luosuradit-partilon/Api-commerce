"use client";

import { SafeResource, SafeMethod } from "@/app/types";
import useTranslation from "@/app/hooks/useTranslation";
import { useEffect, useState } from "react";

interface ListingResourcesProps {
    resources?: SafeResource[];
    methods?: SafeMethod[] | null;
    isTranslating?: boolean;
}

const ListingResources: React.FC<ListingResourcesProps> = ({ resources, methods, isTranslating }) => {
    // We no longer need to call translateContent here since it's handled in the parent component
    // Just use the methods that are passed down, which are already translated
    
    // Add debugging logs to see what's being passed to the component
    useEffect(() => {
    }, [resources, methods]);
    return (
        <div>
            {isTranslating ? (
                <div className="text-center py-4 text-neutral-500">Translating content...</div>
            ) : resources?.length ? (
                resources.map((resource) => (
                    <div key={resource.id} className="mb-4">
                        <h3 className="text-lg font-semibold">{resource.resourceName}</h3>
                        <ul className="list-disc list-inside mt-2">
                            {methods
                                ?.filter((method) => {
                                    const matches = method.resourceId === resource.id;
                                    return matches;
                                })
                                .map((method) => {
                                    return (
                                        <li key={method.id}>
                                            <strong>{method.type}:</strong> {method.description || 'No description available'}
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-neutral-500">No resources available</div>
            )}
        </div>
    );
};

export default ListingResources;

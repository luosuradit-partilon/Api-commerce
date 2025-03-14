"use client";

import { SafeResource, SafeMethod } from "@/app/types";

interface ListingResourcesProps {
    resources?: SafeResource[];
    methods?: SafeMethod[];
}

const ListingResources: React.FC<ListingResourcesProps> = ({ resources, methods }) => {
    return (
        <div>
            {resources?.map((resource) => (
                <div key={resource.id} className="mb-4">
                    <h3 className="text-lg font-semibold">{resource.resourceName}</h3>
                    <ul className="list-disc list-inside mt-2">
                        {methods
                            ?.filter((method) => method.resourceId === resource.id)
                            .map((method) => (
                                <li key={method.id}>
                                    <strong>{method.type}:</strong> {method.description}
                                </li>
                            ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ListingResources;

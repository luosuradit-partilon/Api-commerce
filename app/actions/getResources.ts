import prisma from "@/app/libs/prismadb";
import { SafeResource, SafeListing } from "@/app/types";

export interface IResourceParams {
   listingId?: string;
}

export default async function getResources(params: IResourceParams): Promise<SafeResource[]> {
   try {
      const { listingId } = params;
      let query: any = {};

      if (listingId) {
         query.listingId = listingId;
      }

      const resources = await prisma.resource.findMany({
         where: query,
         include: {
            listing: true,
         },
      });

      const safeResources = resources.map((resource) => ({
         ...resource,
         listing: {
            ...resource.listing,
            createdAt: resource.listing.createdAt.toDateString(),
         } as SafeListing,
      }));

      return safeResources;
   } catch (error: any) {
      throw new Error(error);
   }
}

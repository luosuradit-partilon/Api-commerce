import prisma from "@/app/libs/prismadb";

export interface IResourceParams {
   listingId?: string;
}

export default async function getResources(params: IResourceParams) {
   try {
      const { listingId } = params;
      let query: any = {};

      if (listingId) {
         query.listingId = listingId;
      }

      const resources = await prisma.resource.findMany({
         where: query,
      });
      const safeResources = resources.map((resource) => ({
         ...resource,
      }));
      return safeResources;
   } catch (error: any) {
      throw new Error(error);
   }
}

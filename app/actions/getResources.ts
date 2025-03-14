import prisma from "@/app/libs/prismadb";

export interface IResourceParams {
   listingId?: string;
   // resourceName?: string;
}

export default async function getResources(params: IResourceParams) {
   try {
      const {
         listingId,
         // resourceName,
      } = params;
      let query: any = {};

      if (listingId) {
         query.listingId = listingId;
      }
      // if (resourceName) {
      //    query.resourceName = resourceName;
      // }

      const Resources = await prisma.resource.findMany({
         where: query,
      });
      const safeResources = Resources.map((Resource) => ({
         ...Resource,
      }));
      return safeResources;
   } catch (error: any) {
      throw new Error(error);
   }
}

import prisma from "@/app/libs/prismadb";

export interface IMethodParams {
   resourceId?: string;
   // type?: string;
}

export default async function getMethods(params: IMethodParams) {
   try {
      const {
         resourceId,
         // type,
      } = params;
      let query: any = {};

      if (resourceId) {
         query.resourceId = resourceId;
      }
      // if (type) {
      //    query.type = type;
      // }

      const Methods = await prisma.method.findMany({
         where: query,
      });
      const safeMethods = Methods.map((Method) => ({
         ...Method,
      }));

      return safeMethods;
   } catch (error: any) {
      throw new Error(error);
   }
}

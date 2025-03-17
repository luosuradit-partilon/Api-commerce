import prisma from "@/app/libs/prismadb";
import { SafeMethod, SafeResource } from "../types";

export interface IMethodParams {
   resourceId?: string;
}

export default async function getMethods(params: IMethodParams): Promise<SafeMethod[]> {
   try {
      const { resourceId } = params;
      let query: any = {};

      if (resourceId) {
         query.resourceId = resourceId;
      }

      const methods = await prisma.method.findMany({
         where: query,
         include: {
            resource: true,
         },
      });

      const safeMethods = methods.map((method) => ({
         ...method,
         resource: {
            ...method.resource,
         } as SafeResource,
      }));

      return safeMethods;
   } catch (error: any) {
      throw new Error(error);
   }
}

import prisma from "@/app/libs/prismadb";
import { SafeListing } from "../types"; // Ensure SafeListing type is imported

export interface IListingParams {
   userId?: string;
   guestCount?: number;
   roomCount?: number;
   bathroomCount?: number;
   startDate?: string;
   endDate?: string;
   locationValue?: string;
   category?: string;
}

export default async function getListings(params: IListingParams): Promise<SafeListing[]> { // Add return type
   try {
      const {
         userId,
         roomCount,
         guestCount,
         bathroomCount,
         startDate,
         endDate,
         locationValue,
         category,
      } = params;
      let query: any = {};

      if (userId) {
         query.userId = userId;
      }
      if (category) {
         query.category = category;
      }

      if (roomCount) {
         query.roomCount = {
            gte: +roomCount,
         };
      }
      if (guestCount) {
         query.guestCount = {
            gte: +guestCount,
         };
      }

      if (bathroomCount) {
         query.bathroomCount = {
            gte: +bathroomCount,
         };
      }
      if (locationValue) {
         query.locationValue = locationValue;
      }

      if (startDate && endDate) {
         query.NOT = {
            reservations: {
               some: {
                  OR: [
                     {
                        endDate: { gte: startDate },
                        startDate: { lte: startDate },
                     },
                     {
                        startDate: { lte: endDate },
                        endDate: { gte: endDate },
                     },
                  ],
               },
            },
         };
      }

      const listings = await prisma.listing.findMany({
         where: query,
         orderBy: { createdAt: "desc" },
      });
      const safeListings: SafeListing[] = listings.map((listing) => ({
         ...listing,
         createdAt: listing.createdAt.toISOString(),
      }));

      return safeListings;
   } catch (error: any) {
      throw new Error(error);
   }
}

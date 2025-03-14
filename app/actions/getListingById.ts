import prisma from "@/app/libs/prismadb";
import { SafeListing } from "@/app/types";

const getListingById = async (params: { listingId?: string }): Promise<SafeListing | null> => {
  const { listingId } = params;
  if (!listingId) {
    return null;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { user: true },
  });

  if (!listing) {
    return null;
  }

  return {
    ...listing,
    createdAt: listing.createdAt.toISOString(),
    user: {
      ...listing.user,
      createdAt: listing.user.createdAt.toISOString(),
      updatedAt: listing.user.updatedAt.toISOString(),
      emailVerified: listing.user.emailVerified?.toISOString() || null,
    },
  };
};

export default getListingById;

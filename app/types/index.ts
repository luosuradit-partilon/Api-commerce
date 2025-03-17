import { Listing, Reservation, User, Resource, Method } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListing;
};

export type SafeUser = Omit<User, "createdAt" | "updatedAt" | "emailVerified"> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export type SafeResource = Omit<Resource, "resourceName" | "listing"> & {
  resourceName: string;
  listing: SafeListing; 
};

export type SafeMethod = Omit<Method, "resource"> & {
  resource: SafeResource;
};
import { Listing, Reservation, User, Resource, Method } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt" | "user"> & {
  createdAt: string;
  user: SafeUser;
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

export type SafeResource = Omit<Resource, "methods"> & {
  resourcesName: string;
  methods: SafeMethod[];
};

export type SafeMethod = Omit<Method, ""> & {
   type: string;
   description: string;
};

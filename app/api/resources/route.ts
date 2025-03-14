import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
   const { resourceName, listingId } = await request.json();

   if (!listingId || typeof listingId !== "string") {
      throw new Error("Invalid Id");
   }

   const resources = await prisma.resource.create({
      data: {
        resourceName,
        listingId,
      },
   });

   return NextResponse.json(resources);
}

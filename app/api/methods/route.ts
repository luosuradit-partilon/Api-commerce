import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
   const { type, description, resourceId } = await request.json();

   if (!resourceId || typeof resourceId !== "string") {
      throw new Error("Invalid Id");
   }

   const methods = await prisma.method.create({
      data: {
         type,
         description,
         resourceId,
      },
   });

   return NextResponse.json(methods);
}

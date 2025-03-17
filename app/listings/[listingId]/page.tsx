import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservation";
import getResources from "@/app/actions/getResources";
import getMethods from "@/app/actions/getMethods";
interface IParams {
   listingId?: string;
   resourceId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {
   const listing = await getListingById(params);
   const reservations = await getReservations(params);
   const currentUser = await getCurrentUser();
   const resources = await getResources(params);
   const methods = await getMethods(params);

   if (!listing) {
      return (
         <ClientOnly>
            <EmptyState />
         </ClientOnly>
      );
   }

   return (
      <ClientOnly>
         <ListingClient listing={listing} currentUser={currentUser} reservations={reservations} resources={resources} methods={methods}/>
      </ClientOnly>
   );
};

export default ListingPage;

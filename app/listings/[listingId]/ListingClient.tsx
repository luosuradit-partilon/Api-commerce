/**
 * React functional component that renders a listing page.
 *
 * @component
 * @example
 * const listing = {
 *   // listing data
 * };
 *
 * const currentUser = {
 *   // current user data
 * };
 *
 * const reservations = [
 *   // list of reservations
 * ];
 *
 * <ListingClient listing={listing} currentUser={currentUser} reservations={reservations} />
 *
 * @param {Object} listing - An object containing the details of the listing.
 * @param {Object} currentUser - An object representing the currently logged-in user.
 * @param {Array} reservations - An array of objects representing existing reservations for the listing.
 *
 * @returns {JSX.Element} - The rendered listing page with the listing details, date range picker, and reservation button.
 */
"use client";
import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import { categories } from "@/app/components/navbar/Categories";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeMethod, SafeReservation, SafeResource, SafeUser } from "@/app/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-hot-toast";

const initialDateRange = {
   startDate: new Date(),
   endDate: new Date(),
   key: "selection",
};

interface ListingClientProps {
   reservations?: SafeReservation[];
   resources?: SafeResource[];
   listing: SafeListing & {
      user: SafeUser;
   };
   currentUser?: SafeUser | null;
   methods?: SafeMethod[] | null;
}

const ListingClient: React.FunctionComponent<ListingClientProps> = ({
   listing,
   resources = [],
   methods = [],
   currentUser,
   reservations = [],
}) => {
   const loginModal = useLoginModal();
   const router = useRouter();

   const disabledDates = useMemo(() => {
      let dates: Date[] = [];
      reservations.forEach((reservation) => {
         const range = eachDayOfInterval({
            start: new Date(reservation.startDate),
            end: new Date(reservation.endDate),
         });

         dates = [...dates, ...range];
      });
      return dates;
   }, [reservations]);

   const [isLoading, setIsLoading] = useState(false);
   const [totalPrice, setTotalPrice] = useState(listing.price);
   const [dateRange, setDateRange] = useState<Range>(initialDateRange);

   const onCreateReservation = useCallback(() => {
      if (!currentUser) {
         return loginModal.onOpen();
      }

      setIsLoading(true);

      axios
         .post("/api/reservations", {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            listingId: listing?.id,
         })
         .then(() => {
            toast.success("Listing Reseerved");
            setDateRange(initialDateRange);
            // Redirect to  /trips
            router.push("/trips");
            router.refresh();
         })
         .catch(() => {
            toast.error("Something went wrong");
         })
         .finally(() => {
            setIsLoading(false);
         });
   }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

   useEffect(() => {
      if (dateRange.startDate && dateRange.endDate) {
         const dayCount = differenceInCalendarDays(dateRange.endDate, dateRange.startDate);

         if (dayCount && listing.price) {
            setTotalPrice(dayCount * listing.price);
         } else {
            setTotalPrice(listing.price);
         }
      }
   }, [dateRange, listing.price]);

   const category = useMemo(() => {
      return categories.find((item) => item.label === listing.category);
   }, [listing.category]);
   return (
      <Container>
         <div className="max-w-screen-lg mx-auto">
            <div className="flex flex-col gap-6">
               <ListingHead
                  title={listing.title}
                  imageSrc={listing.imageSrc}
                  locationValue={listing.locationValue}
                  id={listing.id}
                  currentUser={currentUser}
               />
               <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                  <ListingInfo
                     user={listing.user}
                     category={category}
                     description={listing.description}
                     roomCount={listing.roomCount}
                     guestCount={listing.guestCount}
                     bathroomCount={listing.bathroomCount}
                     locationValue={listing.locationValue}
                     resources={resources}
                     methods={methods}
                     
                  />
                  <div className="order-first  mb-10 md:order-last md:col-span-3">
                     <ListingReservation
                        price={listing.price}
                        totalPrice={totalPrice}
                        onChangeDate={(value) => setDateRange(value)}
                        dateRange={dateRange}
                        onSubmit={onCreateReservation}
                        disabled={isLoading}
                        disabledDates={disabledDates}
                     />
                  </div>
               </div>
            </div>
         </div>
      </Container>
   );
};

export default ListingClient;

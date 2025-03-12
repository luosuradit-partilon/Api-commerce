'use client'

import { useState } from "react";
import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";
import Heading from "../Heading";
import Image from "next/image";
import HeartButton from "../HeartButton";

interface ListingHeadProps {
   title: string;
   imageSrc: string[];
   locationValue: string;
   id: string;
   currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({
   title,
   imageSrc,
   locationValue,
   id,
   currentUser,
}) => {
   const { getByValue } = useCountries();
   const location = getByValue(locationValue);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   const nextImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageSrc.length);
   };

   const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageSrc.length) % imageSrc.length);
   };

   return (
      <>
         <Heading title={title} subtitle={`${location?.region}, ${location?.label}`} />
         <div id="default-carousel" className="relative w-full h-[60vh] overflow-hidden rounded-xl" data-carousel="slide">
            <div className="relative h-full overflow-hidden">
               {imageSrc.map((src, index) => (
                  <div
                     key={index}
                     className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                     data-carousel-item
                  >
                     <Image alt={title} src={src} fill className="object-cover w-full h-full" />
                  </div>
               ))}
            </div>
            <div className="absolute top-5 right-5 z-40">
               <HeartButton listingId={id} currentUser={currentUser} />
            </div>
            {imageSrc.length > 1 && (
               <>
                  <button onClick={prevImage} className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
                     <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                        <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
                        </svg>
                        <span className="sr-only">Previous</span>
                     </span>
                  </button>
                  <button onClick={nextImage} className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
                     <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white group-focus:outline-none">
                        <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                           <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        <span className="sr-only">Next</span>
                     </span>
                  </button>
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                     {imageSrc.map((_, index) => (
                        <button
                           key={index}
                           className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                           onClick={() => {
                              setCurrentImageIndex(index);
                           }}
                           aria-label={`Go to slide ${index + 1}`}
                           data-carousel-slide-to={index}
                        />
                     ))}
                  </div>
               </>
            )}
         </div>
      </>
   );
};

export default ListingHead;
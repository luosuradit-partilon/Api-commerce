"use client";

import Container from "../Container";
import { FaUmbrellaBeach } from "@react-icons/all-files/fa/FaUmbrellaBeach";
import { GiForestCamp } from "@react-icons/all-files/gi/GiForestCamp";
import { CiBitcoin } from "react-icons/ci";
import { PiCreditCard, PiInfinityLight } from "react-icons/pi";
import { IoCloudOutline } from "react-icons/io5";
import { TbDatabaseCog } from "react-icons/tb";
import { IoHardwareChipOutline } from "react-icons/io5";
import CategoryBox from "../CategoryBox";
import { PiBrainLight } from "react-icons/pi";
import { PiShoppingCart } from "react-icons/pi";


import { usePathname, useSearchParams } from "next/navigation";

export const categories = [
   {
      label: "Finance",
      icon: PiCreditCard,
      description: "This API is for for payment gateways, invoicing, and financial analytics.",
   },
   {
      label: "E-Commerce",
      icon: PiShoppingCart,
      description: "This API is for product catalogs, inventory management, order processing, shipping, and customer reviews.",
   },
   {
      label: "AI/ML",
      icon: PiBrainLight,
      description: "This API is for integrate AI and machine learning into your system.",
   },
   {
      label: "IoT",
      icon: IoHardwareChipOutline,
      description: "This API is for IoT device management, sensor data, and hardware integration.",
   },
   {
      label: "Data",
      icon: TbDatabaseCog,
      description: "This API is for performing etl, data warehousing, and data analysis.",
   },
   {
      label: "Cloud",
      icon: IoCloudOutline,
      description: "This API is for cloud storage, serverless computing, container orchestration, and monitoring.",
   },
   {
      label: "DevOps",
      icon: PiInfinityLight,
      description: "This API is for continuous integration, deployment, and monitoring.",
   },
   {
      label: "Crypto",
      icon: CiBitcoin,
      description: "This API accepts crypto payments.",
   },
   {
      label: "Beach",
      icon: FaUmbrellaBeach,
      description: "This API is close to the beach",
   },
   {
      label: "Camping",
      icon: GiForestCamp,
      description: "This API has camping activities",
   },
];

const Categories = () => {
   const params = useSearchParams();
   const category = params?.get("category");
   const pathName = usePathname();

   const isMainPage = pathName === "/";

   if (!isMainPage) {
      return null;
   }

   return (
      <Container>
         <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
            {categories.map((item) => (
               <CategoryBox
                  key={item.label}
                  label={item.label}
                  selected={category === item.label}
                  icon={item.icon}
               />
            ))}
         </div>
      </Container>
   );
};
export default Categories;

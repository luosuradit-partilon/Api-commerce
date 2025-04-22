"use client";

import Container from "../Container";
import Categories from "./Categories";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import { SafeUser } from "@/app/types";
import PaymentButton from "../PaymentButton";
import LanguageSelector from "./LanguageSelector";

interface NavbarProps {
   currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
   return (
      <div className="fixed w-full bg-white z-10 shadow-sm">
         <div className="py-4 border-b-[1px]">
            <Container>
               <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                  <Logo />
                  <div className="flex items-center justify-center flex-1">
                     <Search />
                  </div>
                  <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <UserMenu currentUser={currentUser} />
                    <PaymentButton />
                  </div>
               </div>
            </Container>
         </div>
         <Categories />
      </div>
   );
};
export default Navbar;

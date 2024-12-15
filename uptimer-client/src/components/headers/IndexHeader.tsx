"use client";

import Link from "next/link";
import React, { FC, ReactElement, useState } from "react";
import clsx from "clsx";

import { FaTv } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

const IndexHeader: FC = (): ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="relative z-[120] w-full border-b bg-white shadow-2xl shadow-gray-600/5 backdrop-blur dark:shadow-none">
      <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
        <div className="relative py-4 flex items-center justify-between gap-6">
          {/* Logo Section */}
          <Link href="/" className="relative z-10 flex items-center gap-2 cursor-pointer text-green-500">
            <FaTv className="w-10" />
            <h3 className="text-2xl font-bold text-green-500">Uptimer</h3>
          </Link>

          {/* Hamburger Menu */}
          <button onClick={toggleMenu} className="lg:hidden z-20 relative block p-2 text-green-500 focus:outline-none">
            <RxHamburgerMenu className="w-6 h-6" />
          </button>

          {/* Navigation Menu */}
          <div
            className={clsx(
              "absolute top-full right-0 mt-2 lg:mt-0 lg:static lg:flex lg:w-auto lg:space-x-6 transition-transform duration-300 ease-in-out",
              isMenuOpen ? "flex flex-col w-full bg-white p-4 shadow-lg" : "hidden lg:flex"
            )}
          >
            <ul className="flex flex-col lg:flex-row gap-4 text-base font-medium text-center lg:text-right">
              <li>
                <Link
                  href="/login"
                  className="block w-full py-2 px-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/create-account"
                  className="block w-full py-2 px-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400"
                >
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexHeader;

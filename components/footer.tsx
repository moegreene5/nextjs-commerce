"use client";

import Link from "next/link";
import { BsClockFill } from "react-icons/bs";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { PiTiktokLogoBold } from "react-icons/pi";
import Logo from "./ui/logo";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-white text-black px-page border-t border-t-accent">
      <div className="border-b border-gray-200 py-16 flex flex-wrap xl:justify-between gap-16">
        <div className="place-self-center">
          <Logo />
          <p className="text-xs md:text-sm mt-4 font-albertSans max-w-100 xli:max-w-[280px] text-balance text-gray-600">
            This is a sample e-commerce website footer component. Replace this
            text with a brief description of your business or brand.
          </p>
        </div>
        <div>
          <p className="mb-6 md:text-2xl text-base x:text-lg text-black">
            Information
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans text-gray-600">
            <li className="transition-transform duration-300 hover:scale-105 hover:text-black">
              <Link href="/about">About Us</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105 hover:text-black">
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 md:text-2xl text-base x:text-lg text-black">
            Account
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans text-gray-600">
            <li className="transition-transform duration-300 hover:scale-105 hover:text-black">
              <Link href="/account">My Account</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105 hover:text-black">
              <Link href="/cart">Cart</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105 hover:text-black">
              <Link href="/checkout">Checkout</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 md:text-2xl text-base x:text-lg text-black">
            Reach Us
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans text-gray-600">
            <li className="flex items-center gap-2 md:gap-3.5 transition-colors duration-300 hover:text-black cursor-pointer">
              <MdEmail className="text-base" />
              <a href="mailto:info@example.com">info@example.com</a>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5 transition-colors duration-300 hover:text-black cursor-pointer">
              <FaPhone className="text-base" />
              <a href="tel:+1234567890">+1 234 567 890</a>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5">
              <FaLocationDot className="text-base" />
              <p>your company location</p>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5">
              <BsClockFill className="text-base" />
              <p>Mon - Fri / 9:00 AM - 5:00 PM</p>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 md:text-2xl text-base x:text-lg text-black">
            Legal
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans text-gray-600">
            <li className="hover:text-black transition-colors duration-300 cursor-pointer">
              <p>Terms</p>
            </li>
            <li className="hover:text-black transition-colors duration-300 cursor-pointer">
              <p>Privacy</p>
            </li>
          </ul>
        </div>
      </div>
      <div className="py-8 flex items-center justify-between gap-8 flex-wrap">
        <p className="text-xs md:text-sm font-albertSans text-gray-500">
          © {CURRENT_YEAR} company.com. All rights reserved
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors duration-300">
            <FaFacebook className="text-base text-black" />
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors duration-300">
            <FaInstagram className="text-base text-black" />
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors duration-300">
            <PiTiktokLogoBold className="text-base text-black" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

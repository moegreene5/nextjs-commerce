"use client";

import Link from "next/link";
import { BsClockFill } from "react-icons/bs";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { PiTiktokLogoBold } from "react-icons/pi";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-[#fafafa] px-pSmall  x75:px-pMobile md:px-pMain  lg:px-[8%]">
      <div className="border-b border-grey3 py-16  flex flex-wrap xl:justify-between gap-16">
        <div className="place-self-center">
          <svg
            width="150"
            height="60"
            viewBox="0 0 150 60"
            className="mb-2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="150" height="60" rx="8" fill="#111" />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#fafafa"
              fontSize="14"
              fontFamily="sans-serif"
            >
              LOGO
            </text>
          </svg>
          <p className="text-xs md:text-sm mt-4 font-albertSans max-w-100 xli:max-w-[280px] text-balance">
            This is a sample e-commerce website footer component. Replace this
            text with a brief description of your business or brand.
          </p>
        </div>
        <div>
          <p className="mb-6 font-playfairDisplay md:text-2xl text-base x:text-lg">
            Information
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans">
            <li className="transition-transform duration-300 hover:scale-105">
              <Link href="/about">About Us</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105">
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 font-playfairDisplay md:text-2xl text-base x:text-lg">
            Account
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans">
            <li className="transition-transform duration-300 hover:scale-105">
              <Link href="/account">My Account</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105">
              <Link href="/cart">Cart</Link>
            </li>
            <li className="transition-transform duration-300 hover:scale-105">
              <Link href="/checkout">Checkout</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 font-playfairDisplay md:text-2xl text-base x:text-lg">
            Reach Us
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans">
            <li className="flex items-center gap-2 md:gap-3.5 transition-colors duration-300 hover:text-grey3 cursor-pointer">
              <MdEmail className="text-base" />
              <a href="mailto:info@example.com">info@example.com</a>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5 transition-colors duration-300 hover:text-grey3 cursor-pointer">
              <FaPhone className="text-base" />
              <a href="tel:+1234567890">+1 234 567 890</a>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5">
              <FaLocationDot className="text-base" />
              <p>
                B21 Ondo Plaza BBA,
                <br />
                Tradefair complex Lagos Nigeria.
              </p>
            </li>
            <li className="flex items-center gap-2 md:gap-3.5">
              <BsClockFill className="text-base" />
              <p>Mon - Fri / 9:00 AM - 5:00 PM </p>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-6 font-playfairDisplay md:text-2xl text-base x:text-lg">
            Legal
          </p>
          <ul className="flex flex-col gap-6 md:text-sm text-xs font-albertSans">
            <li className="">
              <p>Terms</p>
            </li>
            <li className="">
              <p>Privacy</p>
            </li>
          </ul>
        </div>
      </div>
      <div className="py-8 flex items-center justify-between gap-8 flex-wrap">
        <p className="text-xs md:text-sm font-albertSans text-[#fafafa]">
          © {CURRENT_YEAR} company.com. All rights reserved
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-10 rounded-full bg-whit  border-2 border-grey2 flex items-center justify-center">
            <FaFacebook className="text-base text-white" />
          </div>
          <div className="h-10 w-10 rounded-full bg-instagram-logo border-2 border-grey2 flex items-center justify-center">
            <FaInstagram className="text-base text-white" />
          </div>
          <div className="h-10 w-10 rounded-full bg-bridalBlack border-2 border-grey2 flex items-center justify-center">
            <PiTiktokLogoBold className="text-base text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

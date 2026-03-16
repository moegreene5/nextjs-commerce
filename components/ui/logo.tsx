import Link from "next/link";

export default function Logo() {
  return (
    <span className="text-2xl italic font-bold">
      <Link href="/">Your logo</Link>
    </span>
  );
}

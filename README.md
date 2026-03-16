# Next.js 16 Commerce

A responsive and interactive e-commerce application built with Next.js 16 App Router, Firebase, Cloudinary, shadcn/ui, and TailwindCSS, utilizing `use cache` for performance optimization.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Raleway and Geologica, custom Google Fonts.

## Firebase Setup

You need a Firebase project with **Firestore** and **Authentication** enabled. Get your credentials from Firebase Console → Project Settings → Service Accounts → Generate new private key.

Create a `.env.local` file in the root of the project, refer to `.env.example`.

```env
# Firebase Admin SDK — Project Settings → Service Accounts → Generate new private key
PROJECT_ID=
PRIVATE_KEY=""
CLIENT_EMAIL=""
STORAGE_BUCKET=

# Resend — resend.com/api-keys
RESEND_API_KEY=

# Redis — your Redis provider dashboard (Upstash, Railway, etc.)
REDIS_HOST=
REDIS_PORT=
REDIS_USERNAME=
REDIS_PASSWORD=

# Cloudinary — cloudinary.com/console
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

# App
NEXT_PUBLIC_SITE_URL=
```

> **Note:** The `PRIVATE_KEY` value must preserve literal `\n` characters as-is in `.env.local`. The app handles the replacement automatically.

This project uses **Cloudinary** for image uploads and storage.

> Firebase Storage is supported but requires the **Blaze (pay-as-you-go)** plan to use with the Admin SDK. To switch, update the storage utility and swap the relevant upload Server Actions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add all `.env.local` variables to your Vercel project's environment variables before deploying.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

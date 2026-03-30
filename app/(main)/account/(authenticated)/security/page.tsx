import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { SignOutAllDevices } from "@/features/auth/components/sign-out-devices";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ChangePasswordForm />

      <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 p-8">
        <div>
          <h2 className="mb-1 text-[13px] uppercase tracking-[0.2em] text-black">
            Two-Factor Authentication
          </h2>
          <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            Add an extra layer of security.
          </p>
        </div>
        <button className="h-11 border border-black px-6 text-[11px] uppercase tracking-[0.18em] text-black transition-colors duration-200 hover:bg-black hover:text-white">
          Enable 2FA
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 p-8">
        <div>
          <h2 className="mb-1 text-[13px] uppercase tracking-[0.2em] text-black">
            Active Sessions
          </h2>
          <p className="max-w-sm text-[11px] uppercase leading-relaxed tracking-[0.15em] text-neutral-400">
            Signs you out from all other devices. You will remain signed in on
            this device.
          </p>
        </div>
        <SignOutAllDevices />
      </div>
    </div>
  );
}

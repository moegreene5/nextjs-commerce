"use client";

import { Button } from "@/components/ui/button";
import { Profile } from "@/entities/user";
import { useMemo, useState } from "react";
import { EditUserProfile } from "./edit-user-profile";

export type Views = "view" | "edit";

const AccountInformation = ({ user }: { user: Profile | null }) => {
  const [view, setView] = useState<Views>("view");

  const renderView = useMemo(() => {
    switch (view) {
      case "edit":
        return <EditProfile key="edit" user={user} setView={setView} />;

      default:
        return <ViewInformation key="view" user={user} setView={setView} />;
    }
  }, [view, user]);

  return (
    <>
      <p className="text-sm mb-12 md:mb-16">
        Welcome <span className="capitalize">{user?.name.firstName}</span>. Here
        you can keep track of your recent activity, request returns and
        exchanges as well as view and edit your account.
      </p>
      {renderView}
    </>
  );
};

const ViewInformation = ({
  setView,
  user,
}: {
  setView: React.Dispatch<React.SetStateAction<Views>>;
  user: Profile | null;
}) => {
  const handleEdit = () => setView("edit");

  return (
    <div>
      <div className="flex mb-4 gap-4 flex-wrap justify-between text-sm">
        <h3 className="uppercase">Your Personal Information</h3>
        <div className="flex gap-1 items-center">
          <Button variant={"ghost"} onClick={handleEdit}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 bg-accent w-full p-4 md:p-6 rounded-xl text-sm gap-8 gap-x-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            <InfoField
              label="Name"
              value={`${user?.name.firstName} ${user?.name.lastName}`}
              capitalize
            />
            <InfoField label="Username" value={user?.userName} capitalize />
          </div>
          <InfoField label="Phone" value={user?.phoneNumber || "--"} />
          <InfoField label="Email" value={user?.email} />
        </div>
      </div>
    </div>
  );
};

const InfoField = ({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value?: string | null;
  capitalize?: boolean;
}) => (
  <div>
    <h6 className="uppercase mb-1.5">{label}</h6>
    <p className={capitalize ? "capitalize" : ""}>{value}</p>
  </div>
);

const EditProfile = ({
  setView,
  user,
}: {
  setView: React.Dispatch<React.SetStateAction<Views>>;
  user: Profile | null;
}) => (
  <div className="text-sm">
    <h3 className="uppercase mb-4">Edit Your Personal Information</h3>
    <EditUserProfile profile={user} setView={setView} />
  </div>
);

export default AccountInformation;

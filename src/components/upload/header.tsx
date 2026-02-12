import { buttonStyle } from "@/styles/forms";

export const AdminHeader = ({ signOut }: { signOut: () => void }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl">Admin Upload</h1>
      <button className={buttonStyle} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
};

import { logoutAction } from "@/lib/auth/actions";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export default function LogoutButton({
  className,
  label = "Logout",
}: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
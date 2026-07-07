import { AuthProvider } from "@/lib/workspace-context";
import DashboardLayout from "./dashboard-layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}

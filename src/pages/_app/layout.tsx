import { createFileRoute, Outlet } from "@tanstack/react-router";

import { GitGraph, LayoutDashboardIcon, Play } from "lucide-react";
import { Sidebar, SidebarItem } from "../../shared/components/layout/Sidebar";

export const Route = createFileRoute("/_app")({
  component: LayoutDashboard,
});

const itemsNav = [
  {
    to: "/",
    title: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    to: "/flow-builder",
    title: "Flow Builder",
    icon: GitGraph,
  },
  {
    to: "/Simulator",
    title: "Simulator",
    icon: Play,
  },
];

function LayoutDashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-start text-text-primary">
      <Sidebar>
        {itemsNav.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            title={item.title}
            Icon={item.icon}
          />
        ))}
      </Sidebar>

      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 relative overflow-hidden bg-bg-end/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

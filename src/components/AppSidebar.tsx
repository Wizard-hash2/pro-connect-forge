import { useState } from "react";
import { 
  Briefcase, 
  Users, 
  Search, 
  MessageSquare, 
  Settings,
  User,
  PlusCircle,
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const clientItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Post Job", url: "/post-job", icon: PlusCircle },
  { title: "Find Freelancers", url: "/find-freelancers", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageSquare, badge: 3 },
];

const freelancerItems = [
  { title: "Dashboard", url: "/freelancer", icon: BarChart3 },
  { title: "Browse Jobs", url: "/browse-jobs", icon: Search },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Applications", url: "/applications", icon: Briefcase },
  { title: "Messages", url: "/messages", icon: MessageSquare, badge: 2 },
];

interface AppSidebarProps {
  userType: "client" | "freelancer";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const items = userType === "client" ? clientItems : freelancerItems;
  
  const isActive = (path: string) => {
    if (path === "/" && userType === "freelancer") {
      return currentPath === "/freelancer";
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500 shadow-none transition-colors duration-150"
      : "hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 focus:ring-2 focus:ring-blue-400";

  return (
    <Sidebar
      className="w-64 transition-all duration-300 bg-card/50 border-r border-border/50 text-blue-600"
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 transition-colors duration-150" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-700 font-semibold">
            {userType === "client" ? "Client Tools" : "Freelancer Tools"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto bg-blue-500 text-white font-bold">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
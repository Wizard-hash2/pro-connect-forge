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
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Post Job", url: "/post-job", icon: PlusCircle },
  { title: "Find Freelancers", url: "/find-freelancers", icon: Search },
  { title: "My Projects", url: "/projects", icon: Briefcase },
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
  onUserTypeChange: (type: "client" | "freelancer") => void;
}

export function AppSidebar({ userType, onUserTypeChange }: AppSidebarProps) {
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
      ? "bg-gradient-primary text-primary-foreground font-medium shadow-soft" 
      : "hover:bg-accent transition-smooth";

  return (
    <Sidebar
      className="w-64 transition-all duration-300 bg-gradient-secondary border-r border-border/50"
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end hover:bg-accent transition-smooth" />

      <SidebarContent>
        {/* User Type Switcher */}
        <div className="p-4 border-b border-border/50">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Switch Mode</p>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => onUserTypeChange("client")}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-smooth ${
                  userType === "client" 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "hover:bg-accent"
                }`}
              >
                Client
              </button>
              <button
                onClick={() => onUserTypeChange("freelancer")}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-smooth ${
                  userType === "freelancer" 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "hover:bg-accent"
                }`}
              >
                Freelancer
              </button>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-medium">
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
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground">
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
                    <Settings className="mr-2 h-4 w-4" />
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
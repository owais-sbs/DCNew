import { useSidebar } from "../contexts/SidebarContext";
import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const { isExpanded } = useSidebar();
  
  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'pl-[250px]' : 'pl-[90px]'} pt-4`}>
      {children}
    </div>
  );
}

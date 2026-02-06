import { useSidebar } from "../contexts/SidebarContext";
import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
  isStudentPortal?: boolean;
}

export default function ContentWrapper({ children, isStudentPortal }: ContentWrapperProps) {
  const { isExpanded } = useSidebar();

  if (isStudentPortal) {
    return (
      <main className="transition-all duration-300 px-4 pt-4 pb-20 md:pb-4 md:pl-[325px] min-h-screen bg-gray-50/80">
        {children}
      </main>
    );
  }

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'pl-[325px]' : 'pl-[117px]'} pt-4`}>
      {children}
    </div>
  );
}

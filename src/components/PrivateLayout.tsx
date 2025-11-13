import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ContentWrapper from "./ContentWrapper";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <>
      <Sidebar />
      <Header />
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </>
  );
}

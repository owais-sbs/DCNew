import Sidebar from "./Sidebar";
import Header from "./Header";
import ContentWrapper from "./ContentWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
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

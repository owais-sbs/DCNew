import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar"
import Header from "../Header"
import ContentWrapper from "../ContentWrapper"

export default function StudentPortalLayout() {
  return (
    <>
      <Sidebar />
      <Header />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  )
}


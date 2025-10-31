import { Outlet } from "react-router-dom"
import Navigation from "./components/Navigation"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div>
      <Navigation />
      <Outlet /> 
      <Footer/>
    </div>
  )
}

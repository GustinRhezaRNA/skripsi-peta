import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import "./style.css";
import HomePage from "./pages/Home/page"
import MapPage from "./pages/Map/page"
import AdminPage from "./pages/Admin/page"
import AboutPage from "./pages/About/page"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "map", element: <MapPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)

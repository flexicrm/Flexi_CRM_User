import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import Login from "../../pages/login/Login";
import Otp from "../../pages/login/Otp";
import Register from "../../pages/login/Register";
import { HomeLayout_route } from "../HomeLayout_route";

export const Main_Route =createBrowserRouter([
   
    {path:"/",
    Component:App,
    children:[
        ...HomeLayout_route,
    ]
    },
    {
        path:"login",
        Component:Login,
    },
    {
        path:"register",
        Component:Register,
    },
    {
        path:"otp",
        Component:Otp,
    }
]);

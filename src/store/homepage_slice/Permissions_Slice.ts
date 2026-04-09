import { createSlice } from "@reduxjs/toolkit";
import { Reusable_Service } from "../../service/Reusable_Service/Reusable_Service";

export const  Permissions_getall = async () => {
    return Reusable_Service().get(`/roleandpermission/${localStorage.getItem("subdomain")}/all-roles-permissions`)
}
export const  Create_Permissions_Edit = async (id : number, payload: any) => {
    return Reusable_Service().put(`/roleandpermission/update/${localStorage.getItem("subdomain")}/${id}`, payload)
}
export const  Create_Permissions_Delete = async (id : string) => {
    return Reusable_Service().delete(`/roleandpermission/${localStorage.getItem("subdomain")}/${id}/`)
}

export const  Create_Permissions_Create = async (payload: any) => {
    return Reusable_Service().post(`/roleandpermission/${localStorage.getItem("subdomain")}`, payload)
}


const intialState = {
    permissions: [
        { module: "Dashboard", view: false },
  { module: "Estimates", create: false, view: false, edit: false, delete: false },
  { module: "Expenses", create: false, view: false, edit: false, delete: false },
  { module: "Invoice", create: false, view: false, edit: false, delete: false },
  { module: "Leads", create: false, view: false, edit: false, delete: false },
  { module: "Order", create: false, view: false, edit: false, delete: false },
  { module: "Payments", create: false, view: false, edit: false, delete: false },
  { module: "Profile", create: false, view: false, edit: false, delete: false },
  { module: "Project", create: false, view: false, edit: false, delete: false },
  { module: "Proposals", create: false, view: false, edit: false, delete: false },
  { module: "Quotations", create: false, view: false, edit: false, delete: false },
  { module: "Report", create: false, view: false, edit: false, delete: false },
  { module: "RolesPermissions", create: false, view: false, edit: false, delete: false },
  { module: "Sales", create: false, view: false, edit: false, delete: false },
  { module: "Setup", create: false, view: false, edit: false, delete: false },
  { module: "Task", create: false, view: false, edit: false, delete: false },
  { module: "User", create: false, view: false, edit: false, delete: false },
  { module: "Utilities", create: false, view: false, edit: false, delete: false },
  { module: "setting", create: false, view: false, edit: false, delete: false },
  { module: "subscriptions", create: false, view: false, edit: false, delete: false },
    ]
}

const Permissions_Slice = createSlice({
    name:"roles_and_permissions",
    initialState:intialState,
    reducers:{
        updatePermissions:(state, action)=>{
            state.permissions = action.payload;
        }
    }
})

export const {updatePermissions} = Permissions_Slice.actions;
export default Permissions_Slice.reducer;
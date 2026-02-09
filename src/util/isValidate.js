import { redirect } from "react-router-dom";
import { AUTH_KEY } from "../config/constants";

export function isValidate(){

    const isAuth = sessionStorage.getItem(AUTH_KEY.USERNAME);
    if(!isAuth)
        return redirect('/login');

    return null;

}
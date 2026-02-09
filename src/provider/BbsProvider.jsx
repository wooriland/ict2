import React, { useReducer } from "react";
import bbsReducer from "../reducer/bbsReducer";

const initialState={
    bbses:[],
    totalSize:0,
    nowPage:1,
};

export const BbsContext = React.createContext(null);
export default function BbsProvider({children}){


    const [paging,dispatch] = useReducer(bbsReducer,initialState);

    return <>
        <BbsContext.Provider value={{paging,dispatch}}>
            {children}
        </BbsContext.Provider>
    
    </>
}
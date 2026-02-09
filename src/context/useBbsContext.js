import { useContext } from "react";
import { BbsContext } from "../provider/BbsProvider";


//BbsProvider컴포넌트의 자식에서는 useContext(BbsContext객체) 대신
//아래 커스텀 훅 함수를 호출 한다.즉,useBbsContext() 호출
export const useBbsContext=()=>{

    // 이 커스텀 훅 함수는 BbsProvider컴포넌트의 하위 컴포넌트에서만
    // 호출해야 한다.
    // 하위가 아닌 다른 컴포넌트에서 호출할 경우 context는 null이다
    const context = useContext(BbsContext);
    if(!context) 
        throw new Error('useBbsContext()커스텀 흑 함수는 BbsProvider하위 컴포넌트서만 호출해야만 합니다');
    
    return context;

};
import { BBS } from "../config/constants";

const bbsReducer = (state,action)=>{
    switch(action.type){
        case BBS.ALL:
            return {...state,bbses:action.bbses};
        case BBS.WRITE:
            //등록하면 1페이지로 가기
            return {...state,nowPage:1,totalSize:state.totalSize+1};
        case BBS.DELETE:
            return {...state,totalSize:state.totalSize-1};
        case BBS.TOTALSIZE:
            return {...state,totalSize:action.totalSize};
        case BBS.NOWPAGE:
            return {...state,nowPage:action.nowPage};
        default:
            throw new Error(`존재하지 않는 액션 요청:${action.type}`);

    }



};
export default bbsReducer;


/*
<< CRUD >>
CREATE : 스프레드 연산자
UPDATE:배열의 map()함수 와 스프레드 연산자
DELETE:배열의 filter()함수
*/

import axios from "axios";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { URL } from "../../config/constants";
import BbsProvider from "../../provider/BbsProvider";


//<<페이징 구현하기>>
//React Pagination Component.
//https://www.npmjs.com/package/rc-pagination
//1.npm i rc-pagination
//2.main.jsx에 import 'rc-pagination/assets/index.css';추가
//3.config/constants.js에 페이징 관련 데이타 추가
/* 
페이징 UI 표시:<Pagination total={글 총수} current={현재 페이지} pageSize={페이지당 보여줄 글 수}/>
페이징 UI 표시는 되나 페이지 번호 클릭시 이벤트 처리가 안된다

페이지 번호 클릭시 이벤트 처리를 위해서는 
onChange={(current)=>console.log(current)}
여기서 current는 클릭한 페이지 번호 이다 
즉 인자로 전달이 된다

가운데 정렬:className="d-flex justify-content-center" 추가
(디폴트가 왼쪽에 페이징 표시)
*/	

export default function Bbs(){

    /*
    페이징시 보여줄 글 수 만큼 가져오기
    https://github.com/typicode/json-server
    JSON-SERVER에 게시글 요청시 _page=페이지 번호&_per_page=한 페이지에 보여줄 글수 파라미터 추가
        
    {
        "first": 1,
        "prev": 2,
        "next": null,
        "last": 3,
        "pages": 3,
        "items": 11,
        "data": [{},{},...]
     }형태로 반환한다
     즉 글 목록을 가져올때는 "data"키로 접근 해야 한다
     

    Notable differences with v0.17
    id is always a string and will be generated for you if missing
    use _per_page with _page instead of _limit for pagination
    use Chrome's Network tab > throtling to delay requests instead of --delay CLI optio
    */

  
    return <>
        {/* 게시판 공통 레이아웃 */}
        <div className="p-5 bg-warning text-white rounded">
            <h1>게시판</h1>
            <p>회원제 게시판으로 회원만 이용가능합니다</p>
        </div>
        <BbsProvider>
            <Outlet/>
        </BbsProvider>
        
    </>
}
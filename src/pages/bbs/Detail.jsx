import { Link, useLocation, useNavigate,  useOutletContext,  useParams } from "react-router-dom";
import { AUTH_KEY, BBS, URL } from "../../config/constants";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUsersContext } from "../../context/useUsersContext";
import { useBbsContext } from "../../context/useBbsContext";

export default function Detail(){

    const navigate= useNavigate();

    /*
    //※URL파라미터의 게시글 아이디를 받아서 백엔드 서버로 
    //  GET /bbs/게시글아이디 요청해도 된다
    const {id}=useParams();
    console.log('게시글 아이디:',id);*/

    const {state}= useLocation();  
    console.log('(Detail.jsx)상세보기 글:',state);

    //아이디 대신 이름 출력용
    //☞삭제시 글 총수 변경을 위한 setTotalSize함수 추가
    const {usersInfo} = useUsersContext();
    const {users} = usersInfo;
    const {dispatch} = useBbsContext();
    console.log('(Detail.jsx)users:',users);
    const name =users.length!==0 ? users.filter(user=>user.username===state.username)[0].name:null;


    //<게시글 삭제 처리>
    const handleDelete=e=>{
       
        if(window.confirm('정말로 삭제할래?')){
            //백엔드 서버로 삭제 처리 요청          
             
            axios
            .delete(`${URL.BBS}/${state.id}`)
            .then(res=>{
                navigate('/bbs');
                //☞페이징을 위한 총 글수 변경
                dispatch({type:BBS.DELETE});
            
            })
            .catch(err=>console.log(err));
        }

    };
    
    return <>
         
        <table className="table table-bordered mt-3">
            <tbody>
                <tr>
                    <th className="w-25 text-center bg-dark text-white">번호</th>
                    <td>{state.id}</td>
                </tr>
                <tr>
                    <th className="w-25 text-center bg-dark text-white">글쓴이</th>
                    <td>{name}</td>
                </tr>
                <tr>
                    <th className="w-25 text-center bg-dark text-white">작성일</th>
                    <td>{state.postDate}</td>
                </tr>
                <tr>
                    <th className="w-25 text-center bg-dark text-white">제목</th>
                    <td>{state.title}</td>
                </tr>
                <tr>
                    <th className="w-25 text-center bg-dark text-white">조회수</th>
                    <td>{state.views}</td>
                </tr>
                <tr>
                    <th className="text-center bg-dark text-white" colSpan="2">내용</th>
                </tr>
                <tr>
                    {/*
                        ※https://reactjs.org/docs/dom-elements.html
                        XSS공격을 막기 위해 자바스트립트 코드로 '\n'을 '<br/>'문자열로
                        변경시 태그가 아닌 문자열("<br/>")로 렌더링
                    */}
                    {/*<td colSpan="2">{state.content.replace('\n','<br/>')}</td>*/}
                    {/* \n으로 split한 배열에 map을 적용해서 콜백함수에서 내용들을 JSX로 리턴*/}
                    <td colSpan="2">{state.content && state.content.split('\n').map((line,index)=><React.Fragment key={index}>{line}<br/></React.Fragment>)}</td>
                </tr>
            </tbody>
        </table>
        <div className="text-center">
           
            
            {/*본인 글이 아닌 경우 수정/삭제 버튼 숨기자 */}
            {
            sessionStorage.getItem(AUTH_KEY.USERNAME)===state.username?
                <>  
                    {/* 수정 폼으로 조회한 게시글 전달({state:state}):수정 폼에서는 useLocation()훅으로 받는다 */}
                    <button className="btn btn-success" onClick={()=>navigate(`/bbs/form/${state.id}`,{state:state})}>수정</button>
                    <button className="btn btn-success mx-2" onClick={handleDelete}>삭제</button>
                </>  
                :
                undefined
            }
            
            {/* naviget()함수로 페이지 전환 */}
            <button className="btn btn-success" onClick={()=>navigate('/bbs')}>목록(button)</button>
            {/* Link컴포넌트로 페이지 전환 */}
            <Link to="/bbs" className="btn btn-warning ms-2">목록(Link)</Link>
        </div>
    
    </>
}
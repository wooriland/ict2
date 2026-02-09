import { useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom"
import { AUTH_KEY, BBS, URL } from "../../config/constants";
import axios from "axios";
import { useBbsContext } from "../../context/useBbsContext";

export default function InputForm(){

    const navigate=useNavigate();

    const titleRef= useRef();
    const contentRef = useRef();

    //<<유효성 체크 메시지 출력을 위한 State>>
    const [titleMessage,setTitleMessage] = useState('');
    const [contentMessage,setContentMessage] = useState('');

    //☞페이징 관련 코드(글 등록시 총 글수 변경을 위한 세터 받기)
    const {dispatch} = useBbsContext();

    //<<게시글 등록 버튼 이벤트 처리용>>
    const handleCreate=e=>{
        e.preventDefault();//제출 기능 막기
        
        const titleNode=titleRef.current;
        const contentNode= contentRef.current;

        if(titleNode.value.trim()===''){
            setTitleMessage('제목을 입력하세요');
            titleNode.focus();
            return;
        }
        if(contentNode.value.trim()===''){
            setContentMessage('내용을 입력하세요');
            contentNode.focus();
            return;
        }
        
        //<<데이타 등록 하기>>      
        //※JSON-SERVER는 id를 if missing, 자동으로 랜덤하게 생성해 준다.
        //단,문자열이라 정렬시 문제가 된다(문자열을 순차적으로 비교한다) 
        const username= sessionStorage.getItem(AUTH_KEY.USERNAME);
        const postDate= new Date().toLocaleString(); 
        //백엔드 서버로 등록 처리 요청
        axios
            .post(URL.BBS,{title:titleNode.value.trim(),content:contentNode.value.trim(),username,postDate,views:0})
            .then(res=>{
                console.log('게시글 등록시 백엔드 서버에서 받은 데이타:',res.data);
                //☞페이징을 위한 총 글 수정
                dispatch({type:BBS.WRITE});                
                //등록후 목록으로 이동
                navigate('/bbs');
            })
            .catch(err=>console.log('글 등록 실패:',err));

    };



    return <>
        
        <form>
            <div className="mb-3 mt-3">
                <label htmlFor="title" className="form-label">제목</label>
                <input ref={titleRef} type="text" className="form-control" id="title" placeholder="제목을 입력하세요" name="title"/>
                {/* 제목 유효성 체크 메시지 표시용 SPAN컴포넌트*/}
                <span style={{color:'#FF0000'}}>{titleMessage}</span>
            </div>
            <div className="mb-3">
                <label htmlFor="content" className="form-label">내용</label>
                {/* ※JSX에서는 textarea의 컨텐츠를 value속성으로 설정 */}
                <textarea ref={contentRef} className="form-control" rows="5" id="content" name="content" placeholder="내용을 입력하세요"></textarea>
                {/* 내용 유효성 체크 메시지 표시용 SPAN컴포넌트*/}
                <span style={{color:'#FF0000'}}>{contentMessage}</span>
            </div>
            <button type="submit" className="btn btn-primary" onClick={handleCreate}>등록</button>
        </form>
    
    </>
}
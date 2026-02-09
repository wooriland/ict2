import axios from "axios";
import { useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { URL } from "../../config/constants";

export default function UpdateForm(){


	const navigate = useNavigate();
	/*
    //※URL파라미터의 게시글 아이디를 받아서 백엔드 서버로 
    //  GET /bbs/게시글아이디 요청해서 작성한 내용을 뿌려줘도 된다
    const {id}=useParams();
    console.log('게시글 아이디:',id);*/
	const {state} = useLocation();
	console.log('수정 폼의 내용:',state);


	//<<입력 폼에서는 확인 버튼 클릭시 유효성 검사>>
	//<<수정 폼에서는 입력시마다 체크해서 "실시간" 유효성 검사>>
	// 수정 폼임으로 초기값이 null혹은 ''이 아닌 기존 작성값으로 초기화
	const [inputs,setInputs]= useState({title:state.title,content:state.content});
	const {title,content} = inputs;//구조분해

	//실시간 유효성 메시지 출력을 위한 SPAN요소 제어용
	const spanTitleRef= useRef();
	const spanContentRef= useRef();

	//<입력 요소의 체인지 이벤트 처리>
	const handleChange=e=>{
		const {name,value} = e.target;
		//각 입력 요소에 따른 실시간 유효성 메시지 출력
		if(name.toUpperCase()==='TITLE'){
			if(value.trim().length===0)
				spanTitleRef.current.textContent='제목을 입력하세요';
			else//제목을 입력하고 있다면
				spanTitleRef.current.textContent='';
		}
		else{//내용
			if(value.trim().length===0)
				spanContentRef.current.textContent='내용을 입력하세요';
			else //내용을 입력하고 있다면
				spanContentRef.current.textContent='';

		}
		//입력요소의 스테이트 변경(그래야 변경하는 텍스트가 적용된다)
		setInputs(prev=>({...prev,[name]:value}));

	};
	//<수정 이벤트 처리>
	//백엔드 서버로 수정 요청
	
	const handleUpdate=e=>{
		e.preventDefault();
		//각 입력 요소에 값 입력 여부 체크 후 수정 처리
		const isTitleInput=title.trim().length!==0;
		const isContentInput=content.trim().length!==0;
		if(!isTitleInput){
			spanTitleRef.current.textContent='제목은 반드시....';
			spanTitleRef.current.focus();
			return;
		}
		if(!isContentInput){
			spanContentRef.current.textContent='내용은 반드시....';
			spanContentRef.current.focus();
			return;
		}

		//수정 후 상세보기로 이동
		//수정시 반드시 모든 필드를 전달하자
		axios
			.put(`${URL.BBS}/${state.id}`,{...state,title,content})
			.then(res=>navigate(`/bbs/${state.id}`,{state:{...state,title,content}}))
			.catch(err=>console.log(err));

	};

    return <>
        
        <form>
			<div className="mb-3 mt-3">
				<label htmlFor="title" className="form-label">제목</label>
				{/*
				※value={state.title} 코드로 입력 내용 뿌려주면
				읽기 전용이 된다 
				즉, 쓰기가 가능하려면 입력값을 State로 관리해야 한다
				*/}
				<input value={title} onChange={handleChange}  type="text" className="form-control" id="title" placeholder="제목을 입력하세요" name="title" />
				{/* 유효성 체크 메시지 표시용 SPAN컴포넌트*/}
				<span ref={spanTitleRef} style={{color:'#FF0000'}}></span>
			</div>
			<div className="mb-3">
				<label htmlFor="content" className="form-label">내용</label>
				{/* JSX에서는 textarea의 컨텐츠를 value속성으로 설정 */}
				<textarea value={content} onChange={handleChange} className="form-control" rows="5" id="content" name="content" placeholder="내용을 입력하세요"></textarea>
				 {/* 유효성 체크 메시지 표시용 SPAN컴포넌트*/}
				 <span ref={spanContentRef} style={{color:'#FF0000'}}></span>
			</div>
			<button type="submit" className="btn btn-primary" onClick={handleUpdate}>수정</button>
        </form>    
    
    </>
}
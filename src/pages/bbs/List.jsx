import { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom"
import { BBS, BBS_PAGING, URL } from "../../config/constants";
import axios from "axios";
import Loading from "../../components/Loading";
import Failure from "../../components/Failure";
import Pagination from "rc-pagination";
import { useBbsContext } from "../../context/useBbsContext";
import { useUsersContext } from "../../context/useUsersContext";




export default function List(){

    const navigate = useNavigate();
   
    //<옵션 사항> 로딩 화면 및 에러 화면용 State
    //※로딩 화면은 데이타가 많거나 비동기 요청이 여러 개인 경우 주로 사용
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    const {usersInfo}=useUsersContext();
    const {users}= usersInfo;

    const {paging,dispatch} = useBbsContext();
    const {bbses,totalSize,nowPage}= paging;
   

    
    
    
    useEffect(()=>{

        const fetchBbses=async ()=>{
            try{
                //<<☞페이징을 위한 요청 URL수정 >>
                const res=await axios.get(`${URL.BBS}?_sort=-postDate&_page=${nowPage}&_per_page=${BBS_PAGING.PAGESIZE}`); //-는 내림차순
                console.log('전체 게시글 목록(List.jsx):',res); //res는{status: 200, statusText: 'OK',data:{"first": 1,"prev": 2,..."data": [{},{},...]}} 
              
                dispatch({type:BBS.ALL,bbses:res.data.data}) 
                //<옵션 사항>데이타를 받으면 로딩화면  숨기기 
                setLoading(false);
                
            }
            catch(err){
                //<옵션 사항>에러나도 로딩화면  숨기기 
                setLoading(false);
                console.log(err);
                setError(err);
                
            }

        };   
        fetchBbses();           

    },[nowPage]);//<<☞마운트될때(1페이지) 및 nowPage가 바뀔때마다 다시 글 페치>>
    
    
    //총 게시글 수정
    useEffect(()=>{
        axios
            .get(URL.BBS)
            .then(res=>{
                console.log('총 게시글 수:',res.data.length);
                //총 게시글 수 변경
                dispatch({type:BBS.TOTALSIZE,totalSize:res.data.length});
            })
            .catch(e=>console.log(e));

    },[]);


    //<옵션 사항>로딩화면 보여주기
    if(loading) return <Loading/>
     //<옵션 사항>실패화면 보여주기]
    if(error) return <Failure message={error.message}/>

    //<<☞ 페이징 아이콘의 풍선도움말 변경(중국어->한국어) >>
    //https://github.com/react-component/pagination/blob/master/src/locale/ko_KR.ts
    //에서  아래 내용을 복사한다
    //적용은 <Pagination />컴포넌트에 locale={ko_kr} 속성 추가한다
  

    const ko_kr={
        // Options
        items_per_page: '/ 페이지',
        jump_to: '이동하기',
        jump_to_confirm: '확인하다',
        page: '페이지',

        // Pagination
        prev_page: '이전 페이지',
        next_page: '다음 페이지',
        prev_5: '이전 5 페이지',
        next_5: '다음 5 페이지',
        prev_3: '이전 3 페이지',
        next_3: '다음 3 페이지',
        page_size: '페이지 크기',
    };

    //<<☞ BLOCKPAGE적용 >>
    // <Pagination/>컴포넌트의 itemRender속성을 설정한다.
    // 속성값은 3개의 인자를 받은 함수이다
    // current	: 현재 렌더링 중인 페이지 번호 (예: 1, 2, 3, ...)
    // type	: JSX 요소 타입 ("page", "prev", "next", "jump-prev", "jump-next")
    // element: 기본적으로 생성되는 페이징과 관련된 React 요소 (JSX)
    //          즉,아래 함수에서 element를 반환하면 페이징 버튼 UI들이 보인다
    // 현재 페이지 그룹 범위(startPage ~ endPage) 안에 있는 페이지만 보이게 설정
    // 이전(prev) / 다음(next) 버튼은 유지하여 그룹 이동 가능하게 설정

    

    // 아래가 기본 함수 형태이다
    // const itemRender=(current,type,element)=>{
    //      return element;
    // }


    const startPage = Math.floor((nowPage-1)/BBS_PAGING.BLOCKPAGE) * BBS_PAGING.BLOCKPAGE+1;//페이지 블락의 시작 페이지 번호
    const endPage = startPage+(BBS_PAGING.BLOCKPAGE-1);//페이지 블락의 끝 페이지 번호
    
    // BLOCKPAGE적용되도록 위 기본 함수를 오버 라이딩
    const itemRender=(current,type,element)=>{
        //※글이 없어도 기본적으로 1 페이지 아이콘이 보인다
        //<글이 없는 경우 페이징 UI가 안보이게 수정하기>
        if(totalSize==0) return null;

        //=>1 페이지만 표시해 보기
        /***** 
        if(type==='page' && current !==1) return null;
        return element;
        ******/
        //☞BLOCKPAGE수만큼 페이지 번호 보여주기
        if(type==='page'){
            //현재 페이지가 페이지 불락안에 있는 경우
            //다른 페이지번호는 안보여주고
            //현재 페이지번호가 속한 페이지 블락의 번호들만 보여준다
            if(current >=startPage && current <=endPage){
                //현재 페이지 강조표시
                if(current===nowPage)
                    return <span className="rc-pagination-item-link rc-pagination-item-active" style={{color:'red',fontWeight:'bold'}}>{current}</span>;;
                return element;

            }
            //현재 페이지번호가 있는 페이지 블락이 아닌 나머지 페이지번호들은 안보이게
            return null;

        }
        //...버튼(페이지 번호가 많을때 보이는 버튼:'jump-prev' | 'jump-next') 제외하고
        //이전('rpev') 및 다음('next')버튼 만 보이기
        if(type==='next' || type==='prev')
            return element;
    };
    
    return <>       
        
        <div className="text-end my-2">
            <button className="btn btn-danger" onClick={()=>navigate('/bbs/form')}>글 등록</button>
        </div>
        <table className="table table-hover text-center">
            <thead className="table-dark">
                
                <tr>
                    <th className="col-1">번호</th>
                    <th>제목</th>
                    <th className="col-2">글쓴이</th>
                    <th className="col-2">작성일</th>
                    <th className="col-1">조회수</th>
                </tr>
            </thead>
            <tbody>
                {
                    bbses.length===0?
                    <tr>
                        <td colSpan="5">등록된 글이 없습니다</td>
                    </tr>
                    :
                    bbses.map(bbs=><tr key={bbs.id}>                            
                                <td>{bbs.id}</td>
                                {/* Link의 state속성으로 bbs를 넘기고 받는 쪽에서는 useLocation()훅으로 받는다*/}
                                <td className="text-start"><Link to={bbs.id} state={bbs}>{bbs.title}</Link></td>
                                <td>{users.length!==0?users.filter(user=>user.username===bbs.username)[0].name:null}</td>
                                
                                <td>{bbs.postDate.substring(0,10)}</td>
                                <td>{bbs.views}</td>
                            </tr>   
                        

                    )
                    
                }             
            </tbody>
        </table>
        {/* 페이징용 컴포넌트 추가 */}       
        <Pagination className="d-flex justify-content-center" 
            total={totalSize} 
            pageSize={BBS_PAGING.PAGESIZE} 
            current={nowPage}             
            locale={ko_kr}
            itemRender={itemRender}
            onChange={current=>{console.log('클릭한 페이지번호:',current);dispatch({type:BBS.NOWPAGE,nowPage:current});}}
            />
    </>
}
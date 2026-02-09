import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
    //https://reactrouter.com/api/hooks/useRouteError
    const error = useRouteError();
    console.log('error:%O',error)
    return <>
        
        <div className='container' >
            <Link to="/" className="btn btn-danger">
                Home으로 이동
            </Link>
            <div className="mt-4 p-5 bg-dark text-danger rounded" >
                <h1>오류가 발생했습니다 <small>{error.message}</small></h1>
                <p>관리자에게 문의 하세요<br/><i className="fa-solid fa-phone"></i> 연락처는 010-1234-5678입니다</p>
            </div>
        </div>
        

    </>
}


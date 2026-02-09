//라우팅되는 컴포넌트가 아님.즉 페이지 컴포넌트가 아님
//<에러 발생시 에러 내용 보여주는 컴포넌트>
export default function Failure({message}){

    return <>
        <div className="alert alert-danger">
            <h1 className="display-2">에러! <small className="text-dark">{message}</small></h1>
        </div>
    </>
}
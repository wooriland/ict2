import loading from '../assets/css/Loading.module.css'

//라우팅되는 컴포넌트가 아님.즉 페이지 컴포넌트가 아님
//<로딩 화면>
export default function Loading(){

    return <>
        <div className='d-flex justify-content-center my-5'>
            <div className={loading.spinner}></div>
        </div>
    </>
}
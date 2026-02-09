
import { useParams } from "react-router-dom"

export default function Profile({user}){
    //<<< 리액트 라우터 돔의 URL파라미터를 읽어오는 훅 함수:useParams()>>
    const params = useParams();   

    return <>
        
        <div className="my-3 p-5 bg-dark text-white rounded">
            <h1>{user.name}의 상세 정보</h1>
            
        </div>
        <table className="table" data-bs-theme="dark">
            
            <tbody>
                <tr>
                    <th>아이디</th>
                    <td className="bg-info">{user.username}</td>                    
                </tr>
                <tr>
                    <th>프로필</th>
                    <td className="bg-info">{user.profile}</td>                   
                </tr>                
            </tbody>
        </table>   
    
    </>
}
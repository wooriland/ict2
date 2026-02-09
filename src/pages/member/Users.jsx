import { useOutletContext, useParams } from "react-router-dom";
import User from "./User";
import Profile from "./Profile";
import { useUsersContext } from "../../context/useUsersContext";



export default function Users(){


    const {usersInfo}=useUsersContext();
    console.log('(Users.jsx)usersInfo:',usersInfo);
    const {users} = usersInfo;

    const params=useParams(); //URL 파라미터   
    const user = params.username ? users.filter(user=>user.username===params.username)[0]: null;
       

    return <>
        <div className="p-5 bg-warning text-white rounded">
            <h1>전체 회원</h1>            
        </div>  
        {/*/users/kim 요청 URL 의 URL 파라미터(kim)의 아이디와 일치하는 회원이 있는 경우 */} 
        {user && <Profile user={user}/>}
        <div className="row mt-5">             
            {users.map(user=><div key={user.id} className="col-sm-4 my-2"><User user={user} /></div>)}
        </div>
    </>
}
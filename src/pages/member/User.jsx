import { Link, useOutletContext } from "react-router-dom";
//assests폴더에 있는 이미지 import
import userImages from "../../assets/userImages";
import { useUsersContext } from "../../context/useUsersContext";
import { USERS } from "../../config/constants";

export default function User({user}){

    const {dispatch} = useUsersContext();
   
    return <>
        
        <div className="card">
            <img className="card-img-top" src={userImages[user.avatar]} alt="Card image"/>
            <div className="card-body">
                <h4 className="card-title">{user.name}</h4>
                <p className="card-text">{user.profile}</p>
                
                <Link to={`${user.username}`} onClick={()=>window.scrollTo(0,0)} className="btn btn-primary">프로필 보기</Link>
                <img src={userImages.heart} onClick={()=>dispatch({type:USERS.LIKES,username:user.username})} style={{width:'25px',height:'25px',marginLeft:'10px',marginRight:'5px'}}/>
                {user.likes}
            </div>
        </div>
    </>
}
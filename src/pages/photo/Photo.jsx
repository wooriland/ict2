import axios from "axios";
import { useEffect, useState } from "react"
import { URL } from "../../config/constants";
import Loading from "../../components/Loading";
import { useInView } from "react-intersection-observer";

export default function Photo(){
    
    
    //<<페치한 사진 데이타 저장용 State>>
    const [photos,setPhotos]= useState([])
    //<<페치중 일때 로딩 화면 보여주기 위한 State(옵션)>>
    const [loading,setLoading] = useState(true);
    /*
    //<<<무한 스크롤링 미 적용시>>>
    useEffect(()=>{

        const fetchPhotos = async () =>{
            try{
                const res = await axios.get(URL.PHOTOS);
                console.log(res.data);

                ///URL.PHOTO인 https://jsonplaceholder.typicode.com/photos에서
                //5000개의 데이타를 받아서
                //via.placeholder.com->placehold.co로 변환하고 끝에 png를 붙여준다
                //https://via.placeholder.com이 주소는 24년말경에 사용 불가
                //예:
                //https://via.placeholder.com/600/771796 형태의 주소를
                //https://placehold.co/600/771796/png로 변환
                const placehold= res.data.map(photo=>({...photo,thumbnailUrl:photo.thumbnailUrl.replace('via.placeholder.com','placehold.co')+'/png'}));
                console.log('변환 후:',placehold);
                //1)네트웍에서 페치한 데이타로 State인 Photos변경
                setPhotos(prev=>[...placehold]);
                //2)로딩 화면 숨기기(데이타 가져오기 완료-옵션)
                setLoading(false);

            }
            catch(e){
                setLoading(false);
                console.log(e);
            }

        };
        fetchPhotos();
    },[]);
    */

    //<<무한 스크롤 구현>>
    //https://github.com/thebuilder/react-intersection-observer
    //npm install react-intersection-observer

    //useInView훅 함수은 배열을 반환 한다
    //ref : 모니터링 하고자 하는 DOM요소에 할당할 ref객체.
    //      ※가져온 아이템의 마지막 요소(스크롤을 내려야 보이는 요소)에 할당한다
    //inView : ref를 할당한 요소(마지막 요소)가 보이면 true,안보이면 false값을 갖는 변수로 
    //         자동으로 변한다  

    const [ref,inView] = useInView();
    //50개씩 가져오기 위해 albumId를 State로 관리
    const [albumId,setAlbumId] = useState(1);
    console.log('inView:%s,albumId:%s',inView,albumId);

    //albumId가 변할때마다 다시 데이타를 페치하는 useEffect()
    useEffect(()=>{
        const fetchPhotos = async () =>{
            try{
                const res = await axios.get(`${URL.PHOTOS}?albumId=${albumId}`);
                console.log(res.data);
                const placehold= res.data.map(photo=>({...photo,thumbnailUrl:photo.thumbnailUrl.replace('via.placeholder.com','placehold.co')+'/png'}));                
                
                //1)네트웍에서 페치한 데이타로 State인 Photos변경
                setPhotos(prev=>[...prev,...placehold]);
                //2)로딩 화면 숨기기(데이타 가져오기 완료-옵션)
                setLoading(false);

            }
            catch(e){
                setLoading(false);
                console.log(e);
            }

        };
        fetchPhotos();

    },[albumId]);

    //inView가 변할때 albumId변경을 위한 useEffect()
    useEffect(()=>{
        if(inView){
            setAlbumId(prev=>prev+1);
            setLoading(true);
        }
    },[inView]);

    return <>

         <div  className="p-5 bg-warning text-white rounded mb-2">
            <h1>
                사진 목록
            </h1>
        </div>
        

        {/* 무한 스크롤링 미 적용시 */}
        {/*
            {   
                photos.map(photo=>(
                    <div key={photo.id} className="card mt-2" >
                        <div className="card-header bg-warning"> {photo.title} <span className="badge bg-dark">{photo.id}</span></div>
                        <div className="card-body">
                            <img src={photo.thumbnailUrl} className="img-thumbnail" alt={photo.thumbnailUrl}/>
                        </div>
                        <div className="card-footer bg-danger" style={{cursor:'pointer'}} >{photo.url}</div>
                    </div>
                ))            
            }
        */}


                  
        {/* 무한 스크롤링 적용시 */}
        {/* 마지막 DOM요소에 ref를 바인딩 한다
            마지막 요소가 보이면 inView는 true,
            안보이면 inView는 false다     */}

        {

            photos.map((photo,index)=>photos.length-1 !== index ?
            
                (
                    <div key={photo.id} className="card mt-2" >
                        <div className="card-header bg-warning"> {photo.title} <span className="badge bg-dark">{photo.id}</span></div>
                        <div className="card-body">
                            <img src={photo.thumbnailUrl} className="img-thumbnail" alt={photo.thumbnailUrl}/>
                        </div>
                        <div className="card-footer bg-danger" style={{cursor:'pointer'}} >{photo.url}</div>
                    </div>

                )
                :
                (
                    
                    
                    <div key={photo.id} className="card mt-2" ref={ref}>
                        <div className="card-header bg-warning"> {photo.title} <span className="badge bg-dark">{photo.id}</span></div>
                        <div className="card-body">
                            <img src={photo.thumbnailUrl} className="img-thumbnail" alt={photo.thumbnailUrl}/>
                        </div>
                        <div className="card-footer bg-danger" style={{cursor:'pointer'}} >{photo.url}</div>
                    </div>

                )
            )

        }
        {loading && <Loading/>}
    
    </>
}
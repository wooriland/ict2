import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.jsx'
import 'rc-pagination/assets/index.css';

/* 
    1)<BrowserRouter> 컴포넌트 대신 RouterProvider 컴포넌트 렌더링
    2)router.jsx에서 createBrowerRouter()함수로 라우팅 정보를 갖고 있는 BrowerRouter객체 가져오기
    3)RouterProvider 컴포넌트의 router속성에 BrowerRouter객체를 지정   
  
*/
createRoot(document.getElementById('root')).render(
 <RouterProvider router={router}/>,
)

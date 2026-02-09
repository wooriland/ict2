export const URL={USERS:'http://localhost:3002/users',BBS:'http://localhost:3002/bbs',PHOTOS:'https://jsonplaceholder.typicode.com/photos'};
export const AUTH_KEY ={USERNAME:'username',PASSWORD:'password'};
export const BBS_PAGING={PAGESIZE:2,BLOCKPAGE:3};

//리듀서 사용시 action의 type정의
//예 : ALL-모든 사용자 목록 요청,LOGIN:로그인 요청
//     WRITE-게시글 등록 요청,TOTALSIZE-총 글수 수정 요청,NOWPAGE-현재 페이지 수정 요청
export const USERS={ALL:'all',LOGIN:'login',LOGOUT:'logout',LIKES:'likes'};
export const BBS ={ALL:'all',WRITE:'write',DELETE:'delete',TOTALSIZE:'totalsize',NOWPAGE:'nowpage'}
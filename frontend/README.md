# socket chat app

### 1. 실행

```
// front (localhost:3090)
npm run dev

// back
npm run dev
```

---

### 2. Code Splitting

```
npm i @loadable/component

npm i @types/loadable__component
```

```js
import loadable from '@loadable/component';

const Login = loadable(() => import('@pages/login/login'));
const Signup = loadable(() => import('@pages/signup/signup'));
```

---

### 3. Login

- get / post 의 config에 withCredentials를 포함해야 백엔드와 프론트엔드간에 쿠키가 전달 될 수 있다.

```js
axios.get(url, { withCredentials: true });

axios.post(
  '/api/users/login',
  { email, password },
  {
    withCredentials: true,
  },
);
```

---

### 4. SWR

```
npm i swr
```

- swr은 (보통 get 요청 후) 받아온 데이터를 저장한다.

```js
// useSWR: 주소를 fetcher에 전달한다.
// data: fetcher에서 return된 것을 받아온다. (data가 존재하지 않으면 로딩중)
// revalidate: 원할 때 요청을 다시 보내서 데이터를 가져온다.
// mutate: 요청을 보내지 않고 data를 수정할 수 있다.

const { data: userData, error, revalidate, mutate } = useSWR('/api/users', fetcher);

revalidate();
mutate(newData);
```

- 같은 주소에서 다른 fetcher로 각각의 data를 저정하고 싶은 경우, 주소 끝에 "#..." 을 붙이면 된다.

---

### Route

- route를 중첩할 경우, 이전 route의 주소를 포함해야한다.
- ':' 을 통해 주소에 parameter를 전달할 수 있다.

```js
// app.tsx
<Route path="/workspace/:workspace" component={WorkSpace} />

// workspace.tsx
<Switch>
  <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
  <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
</Switch>
```

- 주소의 parameters를 가져올 수 있다.

```js
const params = useParams<{ workspace?: string }>();
const { workspace } = params;
```

---

### Modal

- 화면 전체를 가리키는 부모 태그에 close function, 모달창을 가리키는 자식 태그에 stop propagation function을 두면  
  모달창 밖을 클릭 했을 때 모달창이 닫히도록 할 수 있다.

```js
const Modal = ({ show, children, onCloseModal }: Props) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) {
    return null;
  }
  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
};
```

---

### NavLink

- 해당 Link의 주소와 현재 주소가 같은 경우 특정 class를 부여할 수 있다.

```js
<NavLink activeClassName="selected" to={`/workspace/${workspace}/channel/${channel.name}`}></NavLink>
```

---

### Socket

```
// v2
npm i socket.io-client@2
```

```js
// socket connect
const socket = io.connect(url);

// 서버로 data 보내기
// event: 이벤트 이름
// args: 전달할 data
socket.emit(event, args);

// 서버로부터 data 받기
// event: 이벤트 이름
// fn: data를 받아 처리하는 함수 ((data) = {})
socket.on(event, fn);

// on 과 짝지어서 사용.
socket.off(event);

// socket disconnect
socket.disconnect();
```

- 특정 집단 안에서만 data를 주고받을 경우, connect 할 때 url을 설정하여 범위를 지정해주어야한다.

```js
// useSocket
const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace && sockets[workspace]) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });
    console.info('create socket', workspace, sockets[workspace]);
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;

// 사용
const [socket, disconnect] = useSocket(workspace);

useEffect(() => {
  socket?.on('event', (data) => {
    //...
  });
  return () => {
    socket?.off('event');
  };
}, [socket]);
```

---

### Scrollbar

```
npm i react-custom-scrollbars
```

```ts
const scrollbarRef = useRef<Scrollbars>(null);

<Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
  // ...
</Scrollbars>;

// scroll 될 때 실행되는 메서드
const onScroll = useCallback(
  (values) => {
    if (values.scrollTop === 0 && !isReachingEnd) {
      console.log('가장 위');
      setSize((prevSize) => prevSize + 1).then(() => {
        const current = (ref as MutableRefObject<Scrollbars>)?.current;
        if (current) {
          current.scrollTop(current.getScrollHeight() - values.scrollHeight);
        }
      });
    }
  },
  [ref, isReachingEnd, setSize],
);

scrollbarRef.current?.scrollTop(current.getScrollHeight() - values.scrollHeight);
scrollbarRef.current?.scrollToBottom();
```

---

### ForwardRef

- ref를 상위 컴포넌트에서 만들어 자식 컴포넌트로 전달해주고 싶을 때 사용한다.

```js
// direct-message.tsx
const scrollbarRef = useRef<Scrollbars>(null);

<ChatList chatSections={chatSections} setSize={setSize} isReachingEnd={isReachingEnd} ref={scrollbarRef}/>

// chat-list.tsx
const ChatList = forwardRef<Props, Scrollbars>((ref, { chatSections, setSize, isReachingEnd }) => {
   //...
});

export default ChatList;

```

### UseSWRInfinite

```js
// setSize : index(page 수)를 바꿔준다.
const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
  (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
  fetcher,
);

setSize((prevSize) => prevSize + 1).then(() => {
  //...
});
```

- index에 따른 data를 받아온다.

```
// index = 0
[{ id: 1 }, { id: 2 }]

// index = 1
[[{ id: 3 }, { id: 4 }], [{ id: 1 }, { id: 2 }]];
```

- 2차원 배열의 형태로 data가 누적되므로 적절히 가공하여 준다.

```js
chatData.flat();
```

- data를 다 받아왔는지 확인하는 절차가 필수적이다.

```js
// isEmpty: 가져온 data의 수가 0이면 true.
// isReachingEnd: 가져온 data의 수가 한번에 가져오는 data의 수보다 작은 경우를 true.
const isEmpty = chatData?.[0]?.length === 0;
const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
```

---

### Optimistic UI

- 사용성을 높이기 위해, 먼저 눈에 보이는 data를 변경한 뒤 서버에 요청을 보내 수정한다.

```js
const savedChat = chat;

mutateChat((prevChatData) => {
  prevChatData?.[0].unshift({
    id: (chatData[0][0]?.id || 0) + 1,
    content: savedChat,
    SenderId: myData.id,
    Sender: myData,
    ReceiverId: userData.id,
    Receiver: userData,
    createdAt: new Date(),
  });
  return prevChatData;
}, false);

axios
  .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
    content: chat,
  })
  .then(() => {
    revalidate();
  })
  .catch(console.error);
```

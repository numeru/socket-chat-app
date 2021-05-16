# socket chap app

### 1. 실행

```
// localhost:3090
npm run dev
```

### 2. Code Splitting

```
npm i @loadable/component

npm i @types/loadable__component
```

```
import loadable from '@loadable/component';

const Login = loadable(() => import('@pages/login/login'));
const Signup = loadable(() => import('@pages/signup/signup'));
```

### 3. login

- get / post 의 config에 withCredentials를 포함해야 백엔드와 프론트엔드간에 쿠기가 전달 될 수 있다.

```ts
axios.get(url, { withCredentials: true });

axios.post(
  '/api/users/login',
  { email, password },
  {
    withCredentials: true,
  },
);
```

### 4. swr

```
npm i swr
```

- swr은 보통 get 요청 후 받아온 데이터를 저장.

```ts
// useSWR: 주소를 fetcher에 전달한다.
// data: fetcher에서 return된 것을 받아온다. (data가 존재하지 않으면 로딩중)
// revalidate: 원할 때 fetcher를 실행할 수 있다.

const { data: userData, error, revalidate } = useSWR('/api/users', fetcher);

revalidate();
```

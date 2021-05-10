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

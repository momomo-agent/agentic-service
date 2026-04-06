# Design: 完善 src/ui/client/ Admin路由

## Files to Modify
- `src/ui/client/src/main.js` — add vue-router with /admin route

## Approach
Admin UI is a separate Vite app at `src/ui/admin/`. The client app at `src/ui/client/` needs a router entry that redirects `/admin` to the admin app (served by the server at `/admin`).

Since admin is a separate app served by the backend, the client only needs to add a navigation link or redirect. The simplest approach: add vue-router to client with two routes.

## Router Config
```javascript
// src/ui/client/src/router.js (new file)
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: App },
    { path: '/admin', beforeEnter() { window.location.href = '/admin'; } }
  ]
});
```

## main.js Change
```javascript
import router from './router.js';
app.use(router);
```

## Alternative (if admin is same-origin iframe/redirect)
Server already serves `/admin` from `src/ui/admin/dist`. Client just needs a link — no router needed. In that case, add `<a href="/admin">` to App.vue nav.

## Preferred: Server-side routing
Check `src/server/api.js` — if it already serves `/admin` statically, client only needs a nav link. No router required.

## Test Cases
1. `GET /admin` → returns admin HTML (server-side, already handled by api.js)
2. Client App.vue has link to `/admin`

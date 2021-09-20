# Fetch Lifecycle

Wrap fetch with lifecycle hooks, before, success, error, after.

```js
const fetchLifecycle = new FetchLifecycle(
  "https://jsonplaceholder.typicode.com",
  { headers: { "Content-Type": "application/json" } },
  {
    before: [
      function (req, res, error) {
        console.log("before", req);
      },
    ],
    success: [
      async function (req, res) {
        console.log("success", req);
      },
    ],
    error: [
      (req, res, error) => {
        console.log("error", req, res, error);
      },
    ],
    after: [
      (req, res, error) => {
        console.log("after");
      },
    ],
  }
);
```

```js
const lifecycle = await fetchLifecycle.request("/todos/1"); //(url[, options]) same as fetch
// lifecycle = {req,res,error}
```

```js
fetchLifecycle.success([
  async function (req, res) {
    this.data = await res.json();
  },
]);
const lifecycle = await fetchLifecycle.request("/todos/1"); //(url[, options]) same as fetch
// lifecycle = {req,res,error,data}
```

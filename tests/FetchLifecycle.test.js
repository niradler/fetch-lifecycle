const FetchLifecycle = require("../FetchLifecycle.js");

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

test("get todo, and convert to json object", async () => {
  fetchLifecycle.success([
    async function (req, res) {
      this.data = await res.json();
    },
  ]);
  await fetchLifecycle
    .request("/todos/1")
    .then((res) => {
      expect(res.data).toEqual({
        userId: 1,
        id: 1,
        title: "delectus aut autem",
        completed: false,
      });
    })
    .catch((error) => {
      console.log({ error });
      expect(error).toBe(undefined);
    });
});

test("get todo, throw on error", async () => {
  fetchLifecycle.error([
    async function (req, res, error) {
      throw error;
    },
  ]);
  await fetchLifecycle.request("/xxx/1").catch((error) => {
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not Found");
  });
});

const http = require("http");
const Route = require("./Route");

const PORT = 3000;

const routes = [
  new Route("/hello/:name", (req, res, params) => {
    res.write(`heellloooo ${params.name}`);
    res.end();
  }),
  new Route("/goodbye/:who", (req, res) => {
    res.write("hello");
    res.end();
  }),
  new Route("/hello", (req, res) => {
    res.write("hello");
    res.end();
  }),
  new Route("/hey", (req, res) => {
    res.write("hello");
    res.end();
  }),
  new Route("/", (_req, res) => {
    res.write("super secret route");
    res.end();
  }),
];
const route = new Route("/");
route.children = routes;

/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleIncomingRequest = (req, res) => {
  route.entertain(req, res);
};

const app = http.createServer(handleIncomingRequest);

app.listen(PORT, () => {
  console.debug(`server started at http://localhost:${PORT}`);
});

const http = require("http");
const Route = require("./Route");

const PORT = 3004;

const route = new Route("/", undefined, [
  new Route("/greet", undefined, [
    new Route("/:name", (_req, res, params) => {
      res.write(`greetings ${params.name}`);
      res.end();
    }),
    new Route("/", (_req, res) => {
      res.write("greetings!");
      res.end();
    }),
  ]),
  new Route("/", (req, res) => {
    res.write("root route");
    res.end();
  }),
]);
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

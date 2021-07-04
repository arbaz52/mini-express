const http = require("http");
const Route = require("./Route");

const PORT = 3004;

const route = new Route(
  "/",
  (req, res) => {
    res.write("Fallback route");
    res.end();
  },
  [
    new Route("/notes", undefined, [
      new Route("/:id", (req, res, params) => {
        console.debug(params);
        res.write(`fetching note ID: ${params.id}`);
        res.end();
      }),
      new Route("/", (req, res) => {
        res.write("fetching notes...");
        res.end();
      }),
    ]),
  ]
);
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

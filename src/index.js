const http = require("http");
const Route = require("./Route");

const PORT = 3000;

const routes = [
  new Route("/hello/:name"),
  new Route("/goodbye/:who"),
  new Route("/hello"),
  new Route("/hey"),
  new Route("/"),
];
/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleIncomingRequest = (req, res) => {
  for (let route of routes) {
    if (route.patternMatchesUrl(req.url)) {
      console.debug(
        `params for ${route.routePattern} are: `,
        route.extractParams(req.url)
      );
    }
  }
  res.write(`You requested: ${req.url}`);
  res.end();
};

const app = http.createServer(handleIncomingRequest);

app.listen(PORT, () => {
  console.debug(`server started at http://localhost:${PORT}`);
});

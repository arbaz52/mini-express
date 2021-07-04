const http = require("http");
const Route = require("./Route");

const PORT = 3004;

const route = new Route(
  "/",
  (req, res) => {
    res.write("fallback route");
    res.end();
  },
  [
    new Route(
      "/employees",
      (req, res) => {
        res.write("fetching employees");
        res.end();
      },
      [
        new Route(
          "/:employeeId",
          (req, res, params) => {
            res.write(`fetching employee:${params.employeeId} details`);
            res.end();
          },
          [
            new Route(
              "/leaves",
              (req, res, params) => {
                res.write(`fetching leaves of employee: ${params.employeeId}`);
                res.end();
              },
              [
                new Route("/:leaveId", (req, res, params) => {
                  res.write(
                    `fetching leave: ${params.leaveId} of employee: ${params.employeeId}`
                  );
                  res.end();
                }),
              ]
            ),
          ]
        ),
      ]
    ),
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

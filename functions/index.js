// prettier-ignore
const { sendRemixResponse, createRemixHeaders } = require("@remix-run/express/dist/server");
// prettier-ignore
const { Request: NodeRequest, createRequestHandler, installGlobals } = require("@remix-run/node");
const { onRequest } = require("firebase-functions/v2/https");

installGlobals();

const serve = async (req, res) => {
  let origin = `${req.protocol}://${req.get("host")}`;
  let url = new URL(req.url, origin);

  let controller = new AbortController();

  req.on("close", () => {
    controller.abort();
  });

  let init = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.rawBody;
  }

  let handleRequest = createRequestHandler(require("./remix"));

  const remixRequest = new NodeRequest(url.href, init);
  const remixResponse = await handleRequest(remixRequest);
  await sendRemixResponse(res, remixResponse);
};

exports.remix = onRequest(serve);

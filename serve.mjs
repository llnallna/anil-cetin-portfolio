import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
]);

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad request");
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }).end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const resolvedPath = fileStat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const body = await readFile(resolvedPath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(resolvedPath).toLowerCase()) ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Content-Length": body.length,
    }).end(body);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    console.error(`Failed to serve ${pathname}:`, error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Internal server error");
  }
});

server.on("error", (error) => {
  console.error(`Unable to start the preview server on port ${port}:`, error);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Portfolio preview listening at http://localhost:${port}`);
});

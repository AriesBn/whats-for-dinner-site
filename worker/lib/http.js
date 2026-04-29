import { HttpError, isHttpError } from "./errors.js";

export function json(data, init = {}) {
  return Response.json(data, {
    headers: {
      "cache-control": "no-store",
    },
    ...init,
  });
}

export function ok(data, status = 200) {
  return json(data, { status });
}

export function notFound() {
  return json(
    {
      error: {
        code: "not_found",
        message: "Route not found.",
      },
    },
    { status: 404 },
  );
}

export async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new HttpError(
      415,
      "unsupported_media_type",
      "Expected application/json request body.",
    );
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "invalid_json", "Request body is not valid JSON.");
  }
}

export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (isHttpError(error)) {
        return json(
          {
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          { status: error.status },
        );
      }

      console.error("Unhandled worker error", error);
      return json(
        {
          error: {
            code: "internal_error",
            message: "Unexpected server error.",
          },
        },
        { status: 500 },
      );
    }
  };
}

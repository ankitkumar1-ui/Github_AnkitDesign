// Tiny helpers for writing strict-mode JSON Schemas (every field required, no extras).

export const str = (description) => ({ type: "string", ...(description && { description }) });
export const hex = (description = "Hex colour, e.g. #F4C2C2") => str(description);
export const num = (description) => ({ type: "number", ...(description && { description }) });
export const int = (values, description) => ({ type: "integer", ...(values && { enum: values }), ...(description && { description }) });
export const bool = (description) => ({ type: "boolean", ...(description && { description }) });
export const oneOf = (values, description) => ({ type: "string", enum: values, ...(description && { description }) });
export const arr = (items, description) => ({ type: "array", items, ...(description && { description }) });
export const obj = (properties, description) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
  ...(description && { description }),
});

// A string restricted to `values`, or null. With no values, only null is allowed.
export const enumOrNull = (values, description) => ({
  ...(values.length ? { anyOf: [{ type: "string", enum: values }, { type: "null" }] } : { type: "null" }),
  ...(description && { description }),
});

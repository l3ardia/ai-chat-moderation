/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/message/send": {
    /** @description Retrieve and store the message, moderate the message and send back the response */
    post: operations["squareupAuthorize"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    General: {
      data?: {
        [key: string]: unknown;
      };
      message?: string;
      [key: string]: unknown;
    };
    Insert: {
      data?: {
        id?: string;
        [key: string]: unknown;
      };
      message?: string;
      [key: string]: unknown;
    };
  };
  responses: {
    /** @description The general response */
    GeneralResponse: {
      content: {
        "application/json": components["schemas"]["General"];
      };
    };
    /** @description The general insert response */
    InsertResponse: {
      content: {
        "application/json": components["schemas"]["Insert"];
      };
    };
    /** @description The request body is invalid */
    BadRequest: {
      content: {
        "application/json": components["schemas"]["General"];
      };
    };
    /** @description The record could not be found */
    NotFound: {
      content: {
        "application/json": components["schemas"]["General"];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /** @description Retrieve and store the message, moderate the message and send back the response */
  squareupAuthorize: {
    requestBody: {
      content: {
        "application/json": {
          messages: string[];
        };
      };
    };
    responses: {
      /** @description Success response */
      200: {
        content: {
          "application/json": {
            success?: boolean;
            violations?: ({
                part?: string;
                level?: string;
                flag?: string;
                description?: string | null;
              })[];
          };
        };
      };
      400: components["responses"]["BadRequest"];
    };
  };
}

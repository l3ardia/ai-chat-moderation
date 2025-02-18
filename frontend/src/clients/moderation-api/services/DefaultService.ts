/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve and store the message, moderate the message and send back the response
     * @param requestBody
     * @returns any Success response
     * @throws ApiError
     */
    public sendMessage(
        requestBody: {
            messages: Array<string>;
        },
    ): CancelablePromise<{
        success?: boolean;
        violations?: Array<{
            part?: string;
            level?: string;
            flag?: string;
            description?: string | null;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/message/send',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `The request body is invalid`,
            },
        });
    }
}

export interface ManiFestInsertAPI {
    path: string;
    token: string;
    template: string;
    createController?: string;
}

export type ManifestFile = {
    path: string;
    token: string;
    template: string;
    createController?: string;
}

export type InsertAPIInputs = Record<string, InsertAPIInputsVariableTypes> & {
    LOGIN_STATUS: string;
    HTTP_METHOD: string;
    CONTROLLER_CLASS: string;
    API_PATH: string;
    API_DESCRIPTION?: string;
    RESPONSE_TYPE?: string;
    REQUEST_TYPE?: string;
};

type InsertAPIInputsVariableTypes = string | LoginStatus | HTTPMethods;
export type LoginStatus = 'logged_in' | 'logged_out';
export type HTTPMethods = 'get' | 'post' | 'put' | 'delete';
const valid_login_status:(LoginStatus| string)[] = ['logged_in', 'logged_out'];
const valid_http_method:(HTTPMethods | string)[] = ['get', 'post', 'put', 'delete'];

export type InsertAPIVariables = InsertAPIInputs & {
    LOGIN_STATUS: LoginStatus;
    HTTP_METHOD: HTTPMethods;
    CONTROLLER_METHOD: string;
    REQUEST_TYPE_AS_JSDOC: string;
    REQUEST_TYPE_AS_TS: string;
} & InsertAPIInputs;

export const validate_login_status = (LOGIN_STATUS: string): LoginStatus => {
    if (!valid_login_status.includes(LOGIN_STATUS)) {
        throw new Error(`Invalid LOGIN_STATUS: expecting one of ${valid_login_status.join(', ')} but got ${LOGIN_STATUS}`);
    };
    return LOGIN_STATUS as LoginStatus;
}

export const validate_http_method = (HTTP_METHOD: string): HTTPMethods => {
    if (!valid_http_method.includes(HTTP_METHOD)) {
        throw new Error(`Invalid HTTP_METHOD: expecting one of ${valid_http_method.join(', ')} but got ${HTTP_METHOD}`);
    };
    return HTTP_METHOD as HTTPMethods;
}

export const get_insert_api_variables = (variables: InsertAPIInputs): InsertAPIVariables => {
    const { API_DESCRIPTION, API_PATH, RESPONSE_TYPE, REQUEST_TYPE } = variables;
    const LOGIN_STATUS: LoginStatus = validate_login_status(variables.LOGIN_STATUS);
    const HTTP_METHOD: HTTPMethods = validate_http_method(variables.HTTP_METHOD);
    const CONTROLLER_METHOD = ['api', ...API_PATH.split('/'), HTTP_METHOD.toLowerCase() ].join('_').toLowerCase();

    return {
        ...variables,
        LOGIN_STATUS,
        HTTP_METHOD,
        API_DESCRIPTION: (API_DESCRIPTION) ? API_DESCRIPTION : `@todo - add description for ${CONTROLLER_METHOD}`,
        CONTROLLER_METHOD,
        REQUEST_TYPE_AS_JSDOC: (REQUEST_TYPE) ? `with ${REQUEST_TYPE}` : '',
        REQUEST_TYPE_AS_TS: (REQUEST_TYPE) ? ` & { data: ${REQUEST_TYPE} }` : '',
        RESPONSE_TYPE: (RESPONSE_TYPE) ? RESPONSE_TYPE : 'any',
    };
}

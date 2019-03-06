'use strict'

function formatError(error) {
    return {
        success: false,
        error: error.message,
    }
}

function formatSuccess(obj, message) {
    if (!message && (typeof obj === 'string')) {
        message = obj;
        obj = undefined;
    }
    const resp = { success: true, };
    if (obj) {
        Object.assign(resp, { data: obj });
    }
    if (message) {
        Object.assign(resp, { message });
    }
    return resp;
}

module.exports = {
    formatError,
    formatSuccess,
};
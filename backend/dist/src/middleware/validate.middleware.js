"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
function validate(schema) {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body ?? req.body;
            req.query = parsed.query ?? req.query;
            req.params = parsed.params ?? req.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map((err) => ({
                        field: err.path.join('.').replace(/^(body|query|params)\.?/, ''),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(400).json({
                success: false,
                error: 'Malformed request',
            });
            return;
        }
    };
}

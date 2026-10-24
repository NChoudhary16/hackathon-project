"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commodities_controller_1 = require("./commodities.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.GODOWN_MANAGER, client_1.Role.QUALITY_INSPECTOR, client_1.Role.DISPATCH_OFFICER), commodities_controller_1.CommoditiesController.list);
exports.default = router;

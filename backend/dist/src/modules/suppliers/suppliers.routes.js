"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const suppliers_controller_1 = require("./suppliers.controller");
const router = (0, express_1.Router)();
router.get('/', suppliers_controller_1.SuppliersController.list);
exports.default = router;

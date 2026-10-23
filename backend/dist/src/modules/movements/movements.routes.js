"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movements_controller_1 = require("./movements.controller");
const router = (0, express_1.Router)();
router.get('/', movements_controller_1.MovementsController.list);
exports.default = router;

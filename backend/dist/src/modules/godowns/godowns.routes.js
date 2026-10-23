"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const godowns_controller_1 = require("./godowns.controller");
const router = (0, express_1.Router)();
router.get('/', godowns_controller_1.GodownsController.list);
router.get('/:id', godowns_controller_1.GodownsController.getById);
exports.default = router;

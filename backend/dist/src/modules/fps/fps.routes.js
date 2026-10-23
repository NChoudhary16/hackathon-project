"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fps_controller_1 = require("./fps.controller");
const router = (0, express_1.Router)();
router.get('/', fps_controller_1.FPSController.list);
exports.default = router;

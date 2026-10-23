"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commodities_controller_1 = require("./commodities.controller");
const router = (0, express_1.Router)();
router.get('/', commodities_controller_1.CommoditiesController.list);
exports.default = router;

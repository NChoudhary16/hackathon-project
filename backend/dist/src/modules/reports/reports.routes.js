"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const router = (0, express_1.Router)();
router.get('/ageing', reports_controller_1.ReportsController.getAgeingReport);
router.get('/fifo-compliance', reports_controller_1.ReportsController.getComplianceReport);
exports.default = router;

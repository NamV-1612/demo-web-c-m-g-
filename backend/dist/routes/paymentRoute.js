"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
router.post('/session', paymentController_1.createPaymentSession);
router.get('/session/:id', paymentController_1.getPaymentStatus);
router.post('/session/:id/confirm', paymentController_1.confirmPayment);
exports.default = router;

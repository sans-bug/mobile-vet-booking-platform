"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// AI Bot does not strictly require auth, but can use it
router.post('/bot', chat_controller_1.handleAIChatbot);
router.use(auth_middleware_1.protect);
router.get('/contacts', chat_controller_1.getChatContacts);
router.get('/messages/:userId', chat_controller_1.getMessages);
router.post('/messages', chat_controller_1.sendMessage);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
let notificationSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    unread: { type: Boolean, required: true },
});
notificationSchema.plugin(mongoose_paginate_1.default);
const notification = mongoose_1.default.model("notification", notificationSchema);
exports.default = notification;

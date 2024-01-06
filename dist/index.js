"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const notification_model_1 = __importDefault(require("./notification.model"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const memoryStore = new session.MemoryStore();
const kcConfig = {
    clientId: 'flyware-client',
    bearerOnly: true,
    serverUrl: 'http://localhost:8080',
    realm: 'Flyware-Realm',
    publicClient: true
};
const keycloak = new Keycloak({ store: memoryStore }, kcConfig);
const app = (0, express_1.default)();
app.use(cors());
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));
app.use(keycloak.middleware());
const PORT = process.env.PORT || 3003;
const eurekaHelper = require('./eureka-helper');
eurekaHelper.registerWithEureka('notification-server', PORT);
app.use(body_parser_1.default.json());
const uri = "mongodb://127.0.0.1:27017/Flyware";
mongoose_1.default.connect(uri, (err) => {
    if (err)
        console.log(err);
    else
        console.log("Mongo Database connected successfully");
});
app.post('/notification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, message } = req.body;
    const existingNotification = yield notification_model_1.default.findOne({ userId, message });
    if (existingNotification) {
        return res.status(400).json({ error: 'Notification already exists' });
    }
    const newNotification = new notification_model_1.default({
        userId,
        message,
        unread: true
    });
    newNotification.save((err, savedNotification) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Une erreur est survenue lors de l\'enregistrement du notification.' });
        }
        res.status(201).json(savedNotification);
    });
}));
app.put('/notification/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const updatedNotifications = yield notification_model_1.default.updateMany({ userId: userId }, { unread: false });
        res.status(201).json({ message: 'Notifications updated successfully', updatedNotifications });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
}));
app.listen(PORT, () => {
    console.log("notification-server on 3003");
});
app.get('/Notification/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield notification_model_1.default.find({ userId: req.params.id }).sort({ unread: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notification' });
    }
}));
app.get('/unreadNotification/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notification_model_1.default.find({ userId: req.params.id, unread: true }).count();
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notification' });
    }
}));
app.get("/", (req, resp) => {
    resp.send("MCHA YACINE MCHA");
});

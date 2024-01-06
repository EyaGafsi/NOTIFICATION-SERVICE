import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "./notification.model";
import bodyParser from "body-parser";

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
const app = express();
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
app.use(bodyParser.json());

const uri = "mongodb://127.0.0.1:27017/Flyware";
mongoose.connect(uri, (err) => {
  if (err) console.log(err);
  else console.log("Mongo Database connected successfully");
});

app.post('/notification', async (req:any, res:any) => {
  const {userId,message } = req.body;
  const existingNotification = await Notification.findOne({ userId, message });

  if (existingNotification) {
    return res.status(400).json({ error: 'Notification already exists' });
  }

  const newNotification = new Notification({
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
});


app.put('/notification/:id', async (req: any, res: any) => {
  try {
    const userId = req.params.id;

    const updatedNotifications = await Notification.updateMany(
      { userId: userId },
      { unread: false }
    );

    res.status(201).json({ message: 'Notifications updated successfully', updatedNotifications });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

app.listen(PORT, () => {
  console.log("notification-server on 3003");
});




app.get('/Notification/:id', async (req:any, res:any) => {
  try {
    const notifications = await Notification.find({ userId: req.params.id }).sort({ unread: -1 });
    res.json(notifications);
} catch (error) {
    res.status(500).json({ message: 'Error fetching notification' });
}
});

app.get('/unreadNotification/:id', async (req:any, res:any) => {
  try {
    const notification = await Notification.find({userId:req.params.id,unread:true}).count();
    res.json(notification);
} catch (error) {
    res.status(500).json({ message: 'Error fetching notification' });
}
});

app.get("/", (req, resp) => {
  resp.send("MCHA YACINE MCHA");
});

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";

interface NotificationModel extends Document {
  userId: string;
  message: string;
  unread: boolean;
}

let notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  unread: { type: Boolean, required: true },
});

notificationSchema.plugin(mongoosePaginate);


const notification = mongoose.model<NotificationModel>("notification", notificationSchema);

export default notification;

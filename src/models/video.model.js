import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudeinary url
      require: [true, "Video File is required"],
    },
    thumbnail: {
      type: String, //cloudeinary url
      require: [true, "Thumbnail File is required"],
    },
    title: {
      type: String,
      require: [true, "Title is required"],
    },
    description: {
      type: String,
      require: [true, "description is required"],
    },
    duration: {
      type: Number, //cloudeinary url
      require: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

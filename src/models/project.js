const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "The project name is required!"]
    },
    description: {
      type: String,
      required: [true, "The project description is required!"]
    },
    members: {
      type: [String],
      required: [true, "At least one project member is required!"]
    },
    thumbnail: {
      type: String,
      required: [true, "The project thumbnail is required!"]
    },
    articles: {
      type: [Schema.Types.ObjectId],
      required: false
    }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
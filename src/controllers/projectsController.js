const mongoose = require("mongoose");
const dbURI = require("../../config.json").dbUri;
const Project = require("../models/project");
const fs = require("fs");
const sharp = require("sharp");

const thumbnailPath = __dirname + "/../../uploads/";
const allowedExts = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const saveThumbnail = (data, file) => {
  let thumbnailName = Date.now() + ".webp";

  if (allowedExts.includes(file.mimetype)) {
    if (file.mimetype != "image/webp")
      sharp(file.buffer).webp().toFile(thumbnailPath + thumbnailName);
    else
      sharp(file.buffer).toFile(thumbnailPath + thumbnailName);

    Object.assign(data, { thumbnail: thumbnailName });
  }
}

const MESSAGES = {
  CAST_ERROR: "The id sent is in the wrong format!",
  DELETE_SUCCESSFUL: "The project has been deleted!",
  NEGATIVE_PAGE: "Page number must be greater than zero!",
  NEGATIVE_STEP: "Step must be greater or equal than zero!",
  NOT_FOUND: "The researched project wasn't found",
  IMAGE_FORMAT: "The file sent is in the wrong format.",
  EMPTY_PATCH: "Can't patch an empty request!",
  DEFAULT_ERROR: "Something went wrong!\nTry again later."
}

mongoose.connect(dbURI)
  .then(() => console.log("DB connected!"))
  .catch((error) => console.log(error));

const controller = {
  deleteProject: (req, res) => {
    let id = req.params.id;

    Project.findById(id, { thumbnail: true })
      .then((result) => {
        if (result)
          Project.deleteOne({ _id: id }, (error) => {
            if (error)
              res.status(500).json(MESSAGES.DEFAULT_ERROR);
            else {
              res.status(200).json(MESSAGES.DELETE_SUCCESSFUL);
              fs.unlinkSync(thumbnailPath + result.thumbnail);
            }
          })
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(MESSAGES.CAST_ERROR);
        else
          res.status(500).json(MESSAGES.DEFAULT_ERROR);
      });
  },
  getProjects: (req, res) => {
    let page = parseInt(req.query.page, 10);
    let step = parseInt(req.query.step, 10);

    if (page <= 0) {
      res.status(400).json(MESSAGES.NEGATIVE_PAGE);
      return;
    }

    if (step < 0) {
      res.status(400).json(MESSAGES.NEGATIVE_STEP);
      return;
    } else if (step == 0) {
      res.status(200).json([]);
      return;
    }

    let skip = (page - 1) * step;

    Project.find().skip(skip).limit(step)
      .then((result) => res.status(200).json(result))
      .catch(() => res.status(500).json(MESSAGES.DEFAULT_ERROR));
  },
  getProjectById: (req, res) => {
    let id = req.params.id;

    Project.findById(id)
      .then((result) => {
        if (result)
          res.status(200).json(result);
        else
          res.status(404).json(MESSAGES.NOT_FOUND);
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(MESSAGES.CAST_ERROR);
        else
          res.status(500).json(MESSAGES.DEFAULT_ERROR);
      });
  },
  postProject: (req, res) => {
    let file = req.file;
    let data = req.body;

    if (typeof file != "undefined" && file != null)
      saveThumbnail(data, file);
    else {
      res.status(400).json(MESSAGES.IMAGE_FORMAT);
      return;
    }

    let project = new Project(data);

    project.save()
      .then(() => res.status(201).json(project._id))
      .catch((error) => {
        let errorMessage = error.message;
        errorMessage = errorMessage.substr(errorMessage.lastIndexOf(':') + 2);

        if (error.name == "ValidationError")
          res.status(422).json(errorMessage);
        else
          res.status(500).json(MESSAGES.DEFAULT_ERROR);
      });
  },
  patchProject: (req, res) => {
    let file = req.file;
    let data = req.body;
    let patchThumbnail = true;

    if (typeof file === "undefined" || file === null) {
      patchThumbnail = false;

      if (typeof data === "undefined" || data === null) {
        res.status(400).json(MESSAGES.EMPTY_PATCH);
        return;
      }
    }

    let id = req.params.id;
    let oldThumbnail = Project.findById(id, { thumbnail: true })
      .then(result => thumbnailPath + result.thumbnail)
      .catch(error => {
        if (error.name == "CastError")
          res.status(400).json(MESSAGES.CAST_ERROR);
        else
          res.status(500).json(MESSAGES.DEFAULT_ERROR);

        return false;
      });

    if (patchThumbnail)
      saveThumbnail(data, file);

    Project.findOneAndUpdate({ _id: id }, data)
      .then(result => {
        if (patchThumbnail) {
          if (oldThumbnail === false)
            return;

          fs.unlinkSync(oldThumbnail);
          saveThumbnail(data, file);
        }

        res.status(200).json(result);
      })
      .catch(error => {
        if (error.name == "CastError")
          res.status(400).json(MESSAGES.CAST_ERROR);
        else
          res.status(500).json(MESSAGES.DEFAULT_ERROR);
      });
  }
};

module.exports = controller;
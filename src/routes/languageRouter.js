import express from "express";

import * as languageController from "../controllers/languageController";

export const languageRouter = express.Router();

/**
 * @api {get} /language List all languages
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
languageRouter.get('/', function (req, res) {
    languageController.getAllLanguages(req, res);
});

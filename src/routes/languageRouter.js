import express from "express";
import ISO6391 from "iso-639-1";

import {LANGUAGES} from "../constants";

export const languageRouter = express.Router();

/**
 * @api {get} /language List all languages
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
languageRouter.get('/', function (req, res) {
    LANGUAGES.forEach(element => element.name = ISO6391.getName(element.language));
    res.status(200).send(LANGUAGES);
});
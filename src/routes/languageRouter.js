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
    let result = [];
    result.forEach(function (element) {
        element.name = ISO6391.getName(element.language);
        element.nativeName = ISO6391.getNativeName(element.language);
        if (element.name !== '') result.push(element);
    });
    res.status(200).send(result);
});

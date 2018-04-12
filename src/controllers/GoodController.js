import {entityModel} from "../models/UserModel";
import {goodModel} from "../models/GoodModel";

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err == null)
                req.body.userId = entity._id;
            let newGood = new goodModel(req.body);
            console.log(newGood);
            newGood.save(function (err, good) {
                if (err)
                    res.status(500).send(err);
                res.status(201).send(good);
            });
        });
    }
};
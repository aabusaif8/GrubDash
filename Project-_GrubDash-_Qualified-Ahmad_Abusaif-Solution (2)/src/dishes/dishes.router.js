const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed")
const controller = require("./dishes.controller")

router.route("/:dishId").get(controller.read).delete(controller.delete).put(controller.update).all(methodNotAllowed)

router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed)

module.exports = router;

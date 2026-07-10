"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pet_controller_1 = require("../controllers/pet.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All pet endpoints require authentication
router.route('/')
    .post(pet_controller_1.createPet)
    .get(pet_controller_1.getPets);
router.route('/:id')
    .get(pet_controller_1.getPetById)
    .put(pet_controller_1.updatePet)
    .delete(pet_controller_1.deletePet);
router.post('/:id/weight', pet_controller_1.addWeightLog);
router.post('/:id/vaccination', pet_controller_1.addVaccination);
exports.default = router;

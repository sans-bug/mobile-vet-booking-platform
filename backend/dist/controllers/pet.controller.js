"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVaccination = exports.addWeightLog = exports.deletePet = exports.updatePet = exports.getPetById = exports.getPets = exports.createPet = void 0;
const pet_model_1 = require("../models/pet.model");
const createPet = async (req, res) => {
    try {
        const { name, species, breed, birthDate, imageUrl, weight } = req.body;
        const ownerId = req.user._id;
        const newPet = new pet_model_1.Pet({
            ownerId,
            name,
            species,
            breed,
            birthDate,
            imageUrl,
            weightHistory: weight ? [{ weight }] : [],
        });
        await newPet.save();
        res.status(201).json({
            success: true,
            pet: newPet,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createPet = createPet;
const getPets = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const pets = await pet_model_1.Pet.find({ ownerId });
        res.status(200).json({
            success: true,
            pets,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPets = getPets;
const getPetById = async (req, res) => {
    try {
        const pet = await pet_model_1.Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        // Verify ownership or vet role
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access to pet profile' });
        }
        res.status(200).json({
            success: true,
            pet,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPetById = getPetById;
const updatePet = async (req, res) => {
    try {
        const { name, species, breed, birthDate, imageUrl } = req.body;
        let pet = await pet_model_1.Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        pet = await pet_model_1.Pet.findByIdAndUpdate(req.params.id, { name, species, breed, birthDate, imageUrl }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            pet,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updatePet = updatePet;
const deletePet = async (req, res) => {
    try {
        const pet = await pet_model_1.Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        await pet_model_1.Pet.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Pet removed successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deletePet = deletePet;
const addWeightLog = async (req, res) => {
    try {
        const { weight } = req.body;
        if (!weight) {
            return res.status(400).json({ success: false, message: 'Weight value required' });
        }
        const pet = await pet_model_1.Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'veterinarian') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        pet.weightHistory.push({ weight, date: new Date() });
        await pet.save();
        res.status(200).json({
            success: true,
            weightHistory: pet.weightHistory,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addWeightLog = addWeightLog;
const addVaccination = async (req, res) => {
    try {
        const { vaccineName, dateAdministered, nextDueDate } = req.body;
        if (!vaccineName || !dateAdministered || !nextDueDate) {
            return res.status(400).json({ success: false, message: 'All vaccination fields are required' });
        }
        const pet = await pet_model_1.Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        // Vets or admins or owners can log vaccine details
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        pet.vaccinationRecords.push({
            vaccineName,
            dateAdministered: new Date(dateAdministered),
            nextDueDate: new Date(nextDueDate),
            administeredBy: req.user.role === 'veterinarian' ? req.user._id : undefined,
        });
        await pet.save();
        res.status(200).json({
            success: true,
            vaccinationRecords: pet.vaccinationRecords,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addVaccination = addVaccination;

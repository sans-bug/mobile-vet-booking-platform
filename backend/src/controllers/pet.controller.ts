import { Response } from 'express';
import { Pet } from '../models/pet.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, species, breed, birthDate, imageUrl, weight } = req.body;
    const ownerId = req.user._id;

    const newPet = new Pet({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPets = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const ownerId = req.user._id;
    const pets = await Pet.find({ ownerId });

    res.status(200).json({
      success: true,
      pets,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPetById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const pet = await Pet.findById(req.params.id);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, species, breed, birthDate, imageUrl } = req.body;
    
    let pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { name, species, breed, birthDate, imageUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      pet,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pet removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addWeightLog = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { weight } = req.body;
    if (!weight) {
      return res.status(400).json({ success: false, message: 'Weight value required' });
    }

    const pet = await Pet.findById(req.params.id);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addVaccination = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { vaccineName, dateAdministered, nextDueDate } = req.body;
    
    if (!vaccineName || !dateAdministered || !nextDueDate) {
      return res.status(400).json({ success: false, message: 'All vaccination fields are required' });
    }

    const pet = await Pet.findById(req.params.id);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

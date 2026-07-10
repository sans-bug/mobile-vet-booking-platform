import { Response } from 'express';
import { Emergency } from '../models/emergency.model';
import { Veterinarian } from '../models/veterinarian.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';

export const triggerSOS = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { lat, lng, address, contactPhone, petId, notes, urgency } = req.body;
    const ownerId = req.user._id;

    if (!lat || !lng || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Location (lat/lng) and emergency contact number are required.',
      });
    }

    const sos = new Emergency({
      ownerId,
      petId: petId || undefined,
      location: { lat, lng, address: address || 'Current Location' },
      contactPhone,
      urgency: urgency || 'high',
      status: 'pending',
      notes: notes || '',
    });

    await sos.save();

    // Broadcast notification to all approved veterinarians in the system
    const vets = await Veterinarian.find({ verificationStatus: 'approved' });
    
    for (const vet of vets) {
      await new Notification({
        recipientId: vet.userId,
        title: 'EMERGENCY SOS ALERT',
        message: `An emergency SOS has been triggered near ${address || 'your location'}. Phone: ${contactPhone}`,
        type: 'SOS',
      }).save();
    }

    res.status(201).json({
      success: true,
      emergency: sos,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSOSRequests = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Only vets and admins can see active SOS
    if (req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const requests = await Emergency.find()
      .populate('ownerId', 'name phone email')
      .populate('petId', 'name breed species imageUrl')
      .populate({
        path: 'assignedVetId',
        populate: { path: 'userId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      emergencies: requests,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToSOS = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body; // dispatched, resolved, cancelled
    const vetProfile = await Veterinarian.findOne({ userId: req.user._id });
    
    if (!vetProfile && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only verified veterinarians can respond to SOS alerts.' });
    }

    const sos = await Emergency.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    sos.status = status;
    if (vetProfile) {
      sos.assignedVetId = vetProfile._id;
    }
    await sos.save();

    // Alert Owner
    await new Notification({
      recipientId: sos.ownerId,
      title: `SOS Alert Status: ${status.toUpperCase()}`,
      message: status === 'dispatched' 
        ? `${req.user.name} is on the way to your location.`
        : `Your SOS emergency alert has been marked as ${status}.`,
      type: 'SOS',
    }).save();

    res.status(200).json({
      success: true,
      emergency: sos,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

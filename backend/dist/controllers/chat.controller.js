"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAIChatbot = exports.getChatContacts = exports.sendMessage = exports.getMessages = void 0;
const message_model_1 = require("../models/message.model");
const user_model_1 = require("../models/user.model");
const getMessages = async (req, res) => {
    try {
        const activeUserId = req.user._id;
        const partnerId = req.params.userId;
        const messages = await message_model_1.Message.find({
            $or: [
                { senderId: activeUserId, receiverId: partnerId },
                { senderId: partnerId, receiverId: activeUserId },
            ],
        }).sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            messages,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId, text, attachmentUrl } = req.body;
        if (!receiverId || (!text && !attachmentUrl)) {
            return res.status(400).json({ success: false, message: 'Receiver and content are required' });
        }
        const message = new message_model_1.Message({
            senderId,
            receiverId,
            text: text || '',
            attachmentUrl: attachmentUrl || '',
        });
        await message.save();
        res.status(201).json({
            success: true,
            message,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.sendMessage = sendMessage;
const getChatContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find all users that the current user has chatted with
        const sentTo = await message_model_1.Message.distinct('receiverId', { senderId: userId });
        const receivedFrom = await message_model_1.Message.distinct('senderId', { receiverId: userId });
        const contactIds = Array.from(new Set([...sentTo, ...receivedFrom]));
        const contacts = await user_model_1.User.find({ _id: { $in: contactIds } })
            .select('name email role avatarUrl phone');
        res.status(200).json({
            success: true,
            contacts,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getChatContacts = getChatContacts;
// Local AI Pet Care Chatbot FAQ matcher
const handleAIChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message content is required.' });
        }
        const query = message.toLowerCase();
        let reply = '';
        if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
            reply = "Hello! I am your VetConnect AI Assistant. How can I help you with your pet's health today? Ask me about topics like vomiting, vaccines, diet, grooming, or emergency care!";
        }
        else if (query.includes('fever') || query.includes('temperature') || query.includes('hot')) {
            reply = "A normal body temperature for dogs and cats is 101 to 102.5°F (38.3 to 39.2°C). If your pet's temperature exceeds 103°F (39.4°C) or feels lethargic, please schedule a clinic checkup or use the SOS button for critical assistance.";
        }
        else if (query.includes('vomit') || query.includes('puke') || query.includes('throwing up')) {
            reply = "Vomiting can be caused by dietary changes, swallowing objects, or infection. Fast your pet for 12 hours, offer small amounts of water, then introduce a bland diet (like boiled chicken and white rice). If vomiting persists for more than 24 hours, book an appointment immediately.";
        }
        else if (query.includes('vaccin') || query.includes('rabies') || query.includes('shot')) {
            reply = "Standard immunization protocols include DHPP and Rabies vaccines for puppies (usually starting at 6-8 weeks, repeating every 3-4 weeks until 16 weeks), and FVRCP for kittens. Boosters are required annually or every 3 years. You can view Milo or Luna's vaccination cards on your dashboard for specific schedules.";
        }
        else if (query.includes('diet') || query.includes('food') || query.includes('eat')) {
            reply = "A balanced pet diet should consist of high-quality protein (chicken, beef, fish) combined with fibers and minerals. Toxic foods to avoid at all costs include: chocolate, grapes, raisins, onions, garlic, and products with xylitol.";
        }
        else if (query.includes('groom') || query.includes('bath') || query.includes('hair') || query.includes('nail')) {
            reply = "Grooming needs vary: dogs generally require baths every 4-8 weeks, weekly nail checks, and regular tooth brushing. Cats clean themselves but benefit from weekly brushing to minimize furballs.";
        }
        else if (query.includes('emergency') || query.includes('sos') || query.includes('bleeding') || query.includes('unconscious')) {
            reply = "⚠️ CRITICAL ALERT: If your pet is in severe distress (heavy bleeding, difficulty breathing, or unconscious), click the red 'SOS Emergency' button in the dashboard to ping proximate veterinarians directly!";
        }
        else {
            reply = "I appreciate your question! For specific issues, please consult one of our verified veterinarians. You can use the search bar on our homepage to filter doctors by specialization and schedule a consultation.";
        }
        res.status(200).json({
            success: true,
            reply,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.handleAIChatbot = handleAIChatbot;

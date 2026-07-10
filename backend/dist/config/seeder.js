"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const user_model_1 = require("../models/user.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const pet_model_1 = require("../models/pet.model");
const appointment_model_1 = require("../models/appointment.model");
const review_model_1 = require("../models/review.model");
const notification_model_1 = require("../models/notification.model");
const emergency_model_1 = require("../models/emergency.model");
const message_model_1 = require("../models/message.model");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const seedData = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetconnect';
    console.log('Connecting to database:', uri);
    try {
        await mongoose_1.default.connect(uri);
        console.log('Connected to DB. Clearing collections...');
        // Clear existing data
        await user_model_1.User.deleteMany({});
        await veterinarian_model_1.Veterinarian.deleteMany({});
        await pet_model_1.Pet.deleteMany({});
        await appointment_model_1.Appointment.deleteMany({});
        await review_model_1.Review.deleteMany({});
        await notification_model_1.Notification.deleteMany({});
        await emergency_model_1.Emergency.deleteMany({});
        await message_model_1.Message.deleteMany({});
        console.log('Collections cleared. Inserting seed data...');
        // 1. Create Users
        // Admin
        const admin = new user_model_1.User({
            name: 'System Administrator',
            email: 'admin@vetconnect.com',
            password: 'admin123',
            role: 'admin',
            phone: '+15550100',
            isEmailVerified: true,
            address: {
                street: '100 Admin HQ Way',
                city: 'Seattle',
                state: 'WA',
                zipCode: '98101',
            },
        });
        await admin.save();
        // Pet Owner
        const owner = new user_model_1.User({
            name: 'Jane Doe',
            email: 'user@vetconnect.com',
            password: 'user123',
            role: 'pet_owner',
            phone: '+15550200',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            isEmailVerified: true,
            address: {
                street: '456 Whisker Lane',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
            },
        });
        await owner.save();
        // Vet 1
        const vetUser1 = new user_model_1.User({
            name: 'Dr. Sarah Jenkins',
            email: 'vet1@vetconnect.com',
            password: 'vet123',
            role: 'veterinarian',
            phone: '+15550301',
            avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
            isEmailVerified: true,
            address: {
                street: '123 Clinic Boulevard',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94103',
            },
        });
        await vetUser1.save();
        // Vet 2
        const vetUser2 = new user_model_1.User({
            name: 'Dr. Alex Mercer',
            email: 'vet2@vetconnect.com',
            password: 'vet123',
            role: 'veterinarian',
            phone: '+15550302',
            avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
            isEmailVerified: true,
            address: {
                street: '789 Bark Ave',
                city: 'Oakland',
                state: 'CA',
                zipCode: '94601',
            },
        });
        await vetUser2.save();
        console.log('Base users created.');
        // 2. Create Veterinarian Profiles
        const vet1 = new veterinarian_model_1.Veterinarian({
            userId: vetUser1._id,
            specialization: 'Feline & Canine Medicine',
            experience: 8,
            clinicName: 'Paws & Claws Veterinary Clinic',
            clinicAddress: '123 Clinic Boulevard, San Francisco, CA 94103',
            consultingFee: 65,
            licenseNumber: 'VET-CA-89211',
            bio: 'Dr. Jenkins specializes in small animal wellness, preventative healthcare, and nutrition planning. She has over 8 years of clinical experience.',
            rating: 4.9,
            reviewsCount: 1,
            verificationStatus: 'approved',
            coordinates: { lat: 37.7749, lng: -122.4194 },
            services: ['General Check-up', 'Vaccination', 'Dental Care', 'Pet Nutrition', 'Online Consultation'],
            availability: [
                { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
                { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
                { day: 'Friday', slots: ['10:00', '11:00', '13:00', '14:00', '15:00'] },
            ],
        });
        await vet1.save();
        const vet2 = new veterinarian_model_1.Veterinarian({
            userId: vetUser2._id,
            specialization: 'Avian & Exotic Animals',
            experience: 12,
            clinicName: 'Exotic Pet Specialty Center',
            clinicAddress: '789 Bark Ave, Oakland, CA 94601',
            consultingFee: 90,
            licenseNumber: 'VET-CA-44321',
            bio: 'Dr. Mercer is one of the leading exotic animal practitioners in the Bay Area, specializing in reptiles, birds, and pocket pets.',
            rating: 4.7,
            reviewsCount: 0,
            verificationStatus: 'approved',
            coordinates: { lat: 37.8044, lng: -122.2711 },
            services: ['General Check-up', 'Surgery Consultation', 'Emergency Visit', 'Pet Nutrition'],
            availability: [
                { day: 'Tuesday', slots: ['09:00', '10:00', '14:00', '15:00'] },
                { day: 'Thursday', slots: ['09:00', '10:00', '14:00', '15:00'] },
            ],
        });
        await vet2.save();
        console.log('Veterinarian profiles created.');
        // 3. Create Pets
        const pet1 = new pet_model_1.Pet({
            ownerId: owner._id,
            name: 'Milo',
            species: 'Dog',
            breed: 'Golden Retriever',
            birthDate: new Date('2023-04-12'),
            imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
            weightHistory: [
                { weight: 8.5, date: new Date('2023-06-12') },
                { weight: 15.2, date: new Date('2023-09-12') },
                { weight: 22.4, date: new Date('2023-12-12') },
                { weight: 28.5, date: new Date('2026-07-01') },
            ],
            medicalHistory: [
                {
                    condition: 'Mild Ear Infection',
                    date: new Date('2024-02-15'),
                    notes: 'Treated with Otomax drops for 7 days. Fully resolved.',
                    diagnosedBy: 'Dr. Sarah Jenkins',
                },
            ],
            vaccinationRecords: [
                {
                    vaccineName: 'Rabies 1-Year',
                    dateAdministered: new Date('2025-05-10'),
                    nextDueDate: new Date('2026-05-10'),
                },
                {
                    vaccineName: 'DHPP (Distemper/Parvo)',
                    dateAdministered: new Date('2025-06-15'),
                    nextDueDate: new Date('2026-06-15'),
                },
            ],
        });
        await pet1.save();
        const pet2 = new pet_model_1.Pet({
            ownerId: owner._id,
            name: 'Luna',
            species: 'Cat',
            breed: 'Siamese',
            birthDate: new Date('2024-08-01'),
            imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
            weightHistory: [
                { weight: 2.1, date: new Date('2024-10-01') },
                { weight: 3.5, date: new Date('2025-02-01') },
                { weight: 4.2, date: new Date('2026-06-30') },
            ],
            medicalHistory: [],
            vaccinationRecords: [
                {
                    vaccineName: 'FVRCP',
                    dateAdministered: new Date('2024-11-10'),
                    nextDueDate: new Date('2025-11-10'),
                },
            ],
        });
        await pet2.save();
        console.log('Pets created.');
        // 4. Create Appointments
        const appt1 = new appointment_model_1.Appointment({
            ownerId: owner._id,
            vetId: vet1._id,
            petId: pet1._id,
            service: 'General Check-up',
            date: new Date('2026-07-12'),
            timeSlot: '10:00',
            status: 'confirmed',
            visitType: 'clinic',
            reason: 'Annual routine health check and vaccine discussion.',
            consultingFee: 65,
            paymentStatus: 'paid',
            paymentId: 'ch_mock_889218201',
        });
        await appt1.save();
        const apptPast = new appointment_model_1.Appointment({
            ownerId: owner._id,
            vetId: vet1._id,
            petId: pet1._id,
            service: 'General Check-up',
            date: new Date('2026-06-10'),
            timeSlot: '14:00',
            status: 'completed',
            visitType: 'clinic',
            reason: 'Scratching ears frequently.',
            consultingFee: 65,
            paymentStatus: 'paid',
            paymentId: 'ch_mock_33912199',
            prescription: {
                notes: 'Keep ears clean and dry. Avoid getting water inside during baths.',
                medicines: [
                    { name: 'Otomax Ear Drops', dosage: '4 drops in each ear', frequency: 'Twice daily', duration: '7 days' },
                ],
            },
            isReviewed: true,
        });
        await apptPast.save();
        console.log('Appointments created.');
        // 5. Create Reviews
        const review = new review_model_1.Review({
            vetId: vet1._id,
            ownerId: owner._id,
            appointmentId: apptPast._id,
            rating: 5,
            reviewText: 'Dr. Jenkins was extremely gentle with Milo. She explained the diagnosis and application of the ear drops perfectly!',
        });
        await review.save();
        // 6. Create notifications
        await new notification_model_1.Notification({
            recipientId: owner._id,
            title: 'Appointment Confirmed',
            message: 'Your appointment for Milo with Dr. Sarah Jenkins on July 12th is confirmed.',
            type: 'booking',
        }).save();
        await new notification_model_1.Notification({
            recipientId: vetUser1._id,
            title: 'New Booking Request',
            message: 'Jane Doe has booked a General Check-up for Milo on July 12th.',
            type: 'booking',
        }).save();
        console.log('Database seeded successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedData();

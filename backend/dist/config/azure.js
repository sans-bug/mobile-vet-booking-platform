"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBlob = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadBlob = async (fileBuffer, fileName, mimeType) => {
    const isMock = process.env.MOCK_AZURE_STORAGE === 'true';
    if (isMock) {
        // Local fallback
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const safeFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
        const filePath = path_1.default.join(uploadDir, safeFileName);
        await fs_1.default.promises.writeFile(filePath, fileBuffer);
        // Return relative URL that Express can serve statically
        return `/uploads/${safeFileName}`;
    }
    // Real Azure implementation
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Azure Storage connection string is missing.');
        }
        const containerName = process.env.AZURE_CONTAINER_NAME || 'petreports';
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        // Create container if it doesn't exist
        await containerClient.createIfNotExists({ access: 'blob' });
        const uniqueFileName = `${Date.now()}-${fileName}`;
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: mimeType },
        });
        return blockBlobClient.url;
    }
    catch (error) {
        console.error('Azure Blob Storage Upload Error:', error);
        throw new Error('Failed to upload file to Azure Blob Storage.');
    }
};
exports.uploadBlob = uploadBlob;

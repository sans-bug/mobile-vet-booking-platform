import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

export const uploadBlob = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const isMock = process.env.MOCK_AZURE_STORAGE === 'true';

  if (isMock) {
    // Local fallback
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const safeFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);
    
    await fs.promises.writeFile(filePath, fileBuffer);
    
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
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: 'blob' });
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
    
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
    
    return blockBlobClient.url;
  } catch (error) {
    console.error('Azure Blob Storage Upload Error:', error);
    throw new Error('Failed to upload file to Azure Blob Storage.');
  }
};

import { BlobServiceClient } from '@azure/storage-blob';
import { BufferResolvable, MessageAttachment } from 'discord.js';
import { v1 as uuidv1 } from 'uuid';
import { config } from '../config.dev';
import intoStream from 'into-stream';
import internal, { Stream } from 'stream';

export async function uploadFood(
  messageAttatchment: MessageAttachment
): Promise<string> {
  console.log('Uploading food to blob...');
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.azureBlob.connectionString
  );

  // Create a unique name for the container
  const containerName = config.azureBlob.containerName;

  console.log('\nCreating container...');
  console.log('\t', containerName);

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // // Create the container
  // const createContainerResponse = await containerClient.create();
  // console.log(
  //   'Container was created successfully. requestId: ',
  //   createContainerResponse.requestId
  // );

  // Create a unique name for the blob
  const blobName = uuidv1() + '-' + messageAttatchment.name;

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // Upload data to blob
  const uploadBlobResponse = await blockBlobClient.syncUploadFromURL(
    messageAttatchment.url
  );
  console.log('\nUploading to Azure storage as blob:\n\t', blobName);

  console.log('Blob was uploaded successfully. url: ', blockBlobClient.url);

  return blockBlobClient.url;
}

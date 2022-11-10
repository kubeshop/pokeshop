import { S3 } from 'aws-sdk';
import FileType from 'file-type';
const { S3_ARN = '' } = process.env;

const StorageService = () => {
  const s3 = new S3();

  return {
    async save(image: Buffer, name: string) {
      const { ext = 'jpg', mime } = (await FileType.fromBuffer(image)) || {};

      const { Location } = await s3
        .upload({
          Bucket: S3_ARN,
          Key: `${name}.${ext}`,
          ContentType: mime,
          Body: image,
        })
        .promise();

      return Location;
    },
  };
};

export default StorageService;

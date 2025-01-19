'use client';

import { toast } from '@/hooks/use-toast';
import config from '@/lib/config';
import ImageKit from 'imagekit';
import { IKImage, ImageKitProvider, IKUpload } from 'imagekitio-next';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { FilePath } from 'tailwindcss/types/config';

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return {
      token,
      expire,
      signature,
    };
  } catch (err: any) {
    throw new Error(`Authentication request failed: ${err.message}`);
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (FilePath: string) => void;
}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const onError = (error: any) => {
    setFile(null);
    console.log(error);

    toast({
      title: 'Image upload failed.',
      description: 'Please try again.',
      variant: 'destructive',
    });
  };
  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast({
      title: 'Image uploaded successfully.',
      description: `${res.filePath} uploaded successfully!`,
    });
  };
  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName="text-upload.png"
      />

      <button
        className="upload-btn"
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
            //@ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload Image</p>
        {file && <p className="upload-filename">{file.filePath}</p>}
      </button>
      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
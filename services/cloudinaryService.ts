'use server';

interface CloudinaryResponse {
    duration: number;
    public_id: string;
    url: string;
  }
export const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
  const formData = new FormData();
  console.log("API",process.env.CLOUDINARY_API_KEY)
  formData.append("file", file);
  formData.append("upload_preset", String(process.env.CLOUDINARY_UPLOAD_PRESET));
  formData.append("api_key", String(process.env.CLOUDINARY_API_KEY));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${String(process.env.CLOUDINARY_CLOUD_NAME)}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  return response.json();
}; 
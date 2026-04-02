import {
  useUploadAvatarMutation,
  useUpdateProfileMutation,
} from "@/infrastructure/api/userApi";

export function useUploadAvatarCommand() {
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const execute = async (file: File) => {
    const { url } = await uploadAvatar(file).unwrap();
    if (!url) throw new Error("Upload did not return a public URL");
    await updateProfile({ avatarUrl: url }).unwrap();
  };

  return { execute };
}

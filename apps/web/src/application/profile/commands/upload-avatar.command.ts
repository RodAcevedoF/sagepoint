import {
  useUploadAvatarMutation,
  useUpdateProfileMutation,
} from "@/infrastructure/api/userApi";

export function useUploadAvatarCommand() {
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const execute = async (file: File) => {
    const { path } = await uploadAvatar(file).unwrap();
    if (!path) throw new Error("Upload did not return a storage path");
    await updateProfile({ avatarUrl: path }).unwrap();
  };

  return { execute };
}

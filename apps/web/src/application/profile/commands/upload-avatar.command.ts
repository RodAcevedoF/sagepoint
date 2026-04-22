import {
  useUploadAvatarMutation,
  useUpdateProfileMutation,
} from "@/infrastructure/api/userApi";
import { catcher, err } from "@/application/common";

export function useUploadAvatarCommand() {
  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const execute = async (file: File) => {
    const upload = await catcher(() => uploadAvatar(file).unwrap());
    if (!upload.ok) return upload;
    if (!upload.data.path)
      return err({ message: "Upload did not return a storage path" });
    return catcher(() =>
      updateProfile({ avatarUrl: upload.data.path })
        .unwrap()
        .then(() => undefined as void),
    );
  };

  return { execute };
}

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, IS_MOCK } from './config';

export const uploadInspectionPhoto = async (
  inspectionId: string,
  file: File
): Promise<string> => {
  if (IS_MOCK) {
    // Mock: 로컬 ObjectURL 반환 (미리보기 가능)
    await new Promise((r) => setTimeout(r, 600));
    return URL.createObjectURL(file);
  }
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}.${ext}`;
  const storageRef = ref(storage, `inspection-images/${inspectionId}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

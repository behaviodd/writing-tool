const DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
}

export const uploadToGoogleDrive = async (
  accessToken: string,
  blob: Blob,
  fileName: string
): Promise<DriveUploadResult> => {
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const response = await fetch(
    `${DRIVE_UPLOAD_URL}&fields=id,name,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error(
        'Google Drive 접근 권한이 부족합니다. 로그아웃 후 다시 로그인하여 권한을 허용해주세요.'
      );
    }
    const errorBody = await response.text();
    throw new Error(`Drive 업로드 실패 (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as DriveUploadResult;
};

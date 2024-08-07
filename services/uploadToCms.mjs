import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const CMS_BASE_URL = 'https://cdn.gov-cloud.ai/';
const UPLOAD_ENDPOINT = 'https://ig.gov-cloud.ai/mobius-content-service/v1.0/content/upload?filePathAccess=private&filePath=/bottle/limka/soda/';

export async function uploadToCms(localFilePath) {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`File not found: ${localFilePath}`);
  }

  const fileStream = fs.createReadStream(localFilePath);
  const formData = new FormData();
  formData.append('file', fileStream);

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3MTg5MjcxNjksImlhdCI6MTcxODg5MTE2OSwianRpIjoiNzlhMGZkMDktNTc0Mi00NGE4LWEwNDItZDcyYWI3ZTMyYWYzIiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLmtleWNsb2FrLnN2Yy5jbHVzdGVyLmxvY2FsOjgwODAvcmVhbG1zL21hc3RlciIsImF1ZCI6WyJCT0xUWk1BTk5fQk9UIiwiUEFTQ0FMX0lOVEVMTElHRU5DRSIsIk1PTkVUIiwiYWNjb3VudCIsIlZJTkNJIl0sInN1YiI6IjMwMzdkZjZiLWE0YTUtNDE1Ni1hMTI4LWQwZTdkYTM5YzA3OCIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWSIsInNlc3Npb25fc3RhdGUiOiJjNzE0YTU0Yi1kYjZjLTQzNDctYjJmZS1mZWZmYmU3YTczMDgiLCJuYW1lIjoibW9iaXVzIG1vYml1cyIsImdpdmVuX25hbWUiOiJtb2JpdXMiLCJmYW1pbHlfbmFtZSI6Im1vYml1cyIsInByZWZlcnJlZF91c2VybmFtZSI6InBhc3N3b3JkX3RlbmFudF9tb2JpdXNAbW9iaXVzZHRhYXMuYWkiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF9tb2JpdXNAbW9iaXVzZHRhYXMuYWkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1tYXN0ZXIiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiQk9MVFpNQU5OX0JPVCI6eyJyb2xlcyI6WyJCT0xUWk1BTk5fQk9UX1VTRVIiXX0sIlBBU0NBTF9JTlRFTExJR0VOQ0UiOnsicm9sZXMiOlsiUEFTQ0FMX0lOVEVMTElHRU5DRV9VU0VSIl19LCJNT05FVCI6eyJyb2xlcyI6WyJNT05FVF9VU0VSIl19LCJIT0xBQ1JBQ1kiOnsicm9sZXMiOlsiSE9MQUNSQUNZX1VTRVIiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfSwiVklOQ0kiOnsicm9sZXMiOlsiVklOQ0lfVVNFUiJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6ImM3MTRhNTRiLWRiNmMtNDM0Ny1iMmZlLWZlZmZiZTdhNzMwOCIsInRlbmFudElkIjoiMzAzN2RmNmItYTRhNS00MTU2LWExMjgtZDBlN2RhMzljMDc4In0=.DwwruONaKN0rcezDHphMMgMkPt2XajPUiKQWADWiS06nFD-OxxGKSQ2F9xLYsNlOrDHPVLIzIChKkpk-mTSFYCEKyxB8R4jdv0AtZcvFj9yiE92i7twflCiu0z3QOM1lVitHKKLKfwEvvckZ6tGrEav0yITTiuII17XHdxAhQnbtJ130LH-rJqlVsAL66NOY1gTi5hL6b_KZ5GnmAjPC9s2PTJ3i6cDGM6vQt5E_7UNZ_aXWWRTfrgvRoHP4hh0B8kQ--WB47yURExywugSvsoacEzzGC5-PNHZoX8lkrt72S6rMW5-D1fZf5kkZhwi7mG4T0kJvkTl0V4s6PHy-rQ' // Replace with actual token
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CMS Upload Failed: ${errorText}`);
    }

    const result = await response.json();
    if (!result || !result.cdnUrl) {
      throw new Error('Invalid response from CMS: cdnUrl not found');
    }

    const fullCdnUrl = `${CMS_BASE_URL}${result.cdnUrl}`;
    console.log(`File uploaded successfully: ${fullCdnUrl}`);
    return fullCdnUrl;
  } catch (error) {
    console.error('Error uploading to CMS:', error.message);
    throw new Error('Failed to upload to CMS');
  } finally {
    fileStream.close();
  }
}

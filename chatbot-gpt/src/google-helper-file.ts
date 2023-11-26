import { GoogleAuth } from "google-auth-library";

export const getGoogleProjectId = async () => {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  })
  
  const projectId = await auth.getProjectId()
  
  return projectId
}

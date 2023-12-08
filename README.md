# GCloud Setup

### 1. Install binaries

1. Follow instructions @ https://cloud.google.com/sdk/docs/install 
2. Run `source ~/.zshrc` ( or wtv your shell config file is )

### 2. Set up gcloud CLI

1. Switch off `WARP` and type `glcoud init` to avoid the proxy setup in GCP cuz of `WARP` being turned on
2. Once redirected to the browser login page, turn on `WARP`

3. ProjectId: `engaged-domain-403109`

4. Compute Region and Zone: `asia-southeast1-a` (because Artifact Registry is located here)

5. 💡 Verify by listing artifacts repository — There should be 2 (app / api) 💡

    > gcloud artifacts repositories list --location=asia-southeast1

# MakeFile (Build / Push / Deploy Images)

1. Navigate to Root Dir

1. `make help`

2. Run the commands (ie. `make gbuild-app`)

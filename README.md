# GCloud CLI Setup

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


| Step                        | Command                             |
|-----------------------------|-------------------------------------|
| 1. Navigate to Root Dir     |                                     |
| 2. List available cmds      | `make help`                         |
| 3. Run the cmds             | (ie. `make gbuild-app`)             |


# APP / API

| Step | Command                                      | Description                                      |
|------|----------------------------------------------|--------------------------------------------------|
| 1    | `yarn`                                       | Install packages                                 |
| 2    | `yarn start`                                 | Start APP                                        |
| 3    | `uvicorn app.main:app --reload --port 3001`  | Start API                                        |

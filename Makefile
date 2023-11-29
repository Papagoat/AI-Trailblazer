.PHONY: gbuild-app gbuild-api gdeploy-app gdeploy-api help	

REGION=asia-southeast1
PROJECTID=engaged-domain-403109

help:
	@echo "Available targets:"
	@echo "  gbuild-app      : Build and push app Docker image to Artifact Registry"
	@echo "  gdeploy-app     : Deploy app to Cloud Run"
	@echo "  gbuild-api      : Build and push api Docker image to Artifact Registry"
	@echo "  gdeploy-api     : Deploy api to Cloud Run"
	@echo "  help            : Show this help message"

gbuild-app:
	gcloud builds submit --region=$(REGION) --tag $(REGION)-docker.pkg.dev/$(PROJECTID)/app/app ./chatbot-gpt-frontend

gdeploy-app:
	gcloud run deploy app --allow-unauthenticated --image $(REGION)-docker.pkg.dev/$(PROJECTID)/app/app

gbuild-api:
	gcloud builds submit --region=$(REGION) --tag $(REGION)-docker.pkg.dev/$(PROJECTID)/api/api ./chatbot-gpt

gdeploy-api:
	gcloud run deploy app --allow-unauthenticated --image $(REGION)-docker.pkg.dev/$(PROJECTID)/api/api
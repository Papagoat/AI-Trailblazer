### ----- Build Stage -----
FROM node:18.16-alpine as builder
COPY package.json yarn.lock ./
# RUN yarn add -D @types/lodash
RUN yarn install
RUN mkdir /app
RUN mv ./node_modules ./app
WORKDIR /app
COPY .env.production.local .env.production.local
COPY . ./
RUN ls -la /app
RUN yarn build

### ----- Serve Stage -----
FROM nginx:1.24.0-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html

ENV HOST 0.0.0.0
ENV PORT 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

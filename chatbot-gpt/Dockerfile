FROM node:18.16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN ls -la
RUN yarn build

RUN yarn global add pm2

CMD ["pm2-runtime", "pm2.config.js"]


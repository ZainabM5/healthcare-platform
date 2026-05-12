FROM node:18

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_OPTIONS=--max-old-space-size=512

EXPOSE 3000

CMD ["npm", "start"]
FROM node:lts-alpine3.20 AS builder
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY ./prisma ./
RUN npx prisma generate
COPY . .
RUN npm run build


FROM node:lts-alpine3.20
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
CMD ["npm", "start"]
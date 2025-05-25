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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js
# COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env


EXPOSE 5000
CMD ["npm", "start"]
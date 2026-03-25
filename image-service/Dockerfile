FROM node:20-alpine AS builder
WORKDIR /image
COPY package.*json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /image
COPY --from=builder /image/* ./
EXPOSE 4500
CMD ["npm" , "start"]
FROM node:20-alpine AS builder
WORKDIR /worker
COPY package.*json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /worker
COPY --from=builder /worker/* ./
CMD ["npm" , "start"]
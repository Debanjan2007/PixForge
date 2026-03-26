FROM node:22-alpine AS builder
WORKDIR /image
COPY package.*json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /image
COPY package.*json ./
RUN npm install --omit=dev
COPY --from=builder /image/dist ./dist
EXPOSE 4500
CMD ["node" , "dist/index.js"]
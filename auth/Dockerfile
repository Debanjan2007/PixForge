FROM node:22-alpine AS build
WORKDIR /auth
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /auth
COPY package.*json ./
RUN npm install --omit=dev
COPY --from=build /auth/dist ./dist
EXPOSE 5600
CMD ["node", "dist/index.js"]
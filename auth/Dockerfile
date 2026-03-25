FROM node:20-alpine AS build
WORKDIR /auth
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /auth
COPY --from=build /auth/* ./
EXPOSE 5600
CMD ["npm", "start"]
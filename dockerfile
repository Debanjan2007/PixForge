# builder stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY ./app ./app
RUN npm run build
# production stage
FROM node:20-alpine as production
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
RUN cd ./dist/src && mkdir uploads
EXPOSE 5600
CMD ["npm" , "start"]
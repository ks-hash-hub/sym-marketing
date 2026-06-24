# Stage 1: build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite bakes env vars at build time — pass tokens in as build args
ARG VITE_AIRTABLE_TOKEN
ENV VITE_AIRTABLE_TOKEN=$VITE_AIRTABLE_TOKEN
ARG VITE_CHARTMETRIC_TOKEN
ENV VITE_CHARTMETRIC_TOKEN=$VITE_CHARTMETRIC_TOKEN
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

FROM node:12.18.2-alpine
WORKDIR /app
COPY / /app
RUN apk add --no-cache make gcc g++ python
RUN cd /app && \
    npm ci && \
    npm run lint && \
    npm run build

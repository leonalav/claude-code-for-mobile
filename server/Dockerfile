FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY main.go ./
RUN go build -ldflags="-s -w" -o claude-server main.go

FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM alpine:latest

RUN apk --no-cache add ca-certificates git

WORKDIR /app

COPY --from=builder /app/claude-server /app/
COPY --from=frontend-builder /app/dist /app/dist

ENV PORT=3456
ENV STATIC_DIR=/app/dist
ENV REPO_PATH=/workspace

EXPOSE 3456

CMD ["/app/claude-server"]

FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci



FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_BUCKET_BASE_URL=${NEXT_PUBLIC_BUCKET_BASE_URL}
ARG NEXT_PUBLIC_LANDING_URL=${NEXT_PUBLIC_LANDING_URL}

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build



FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3005
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]

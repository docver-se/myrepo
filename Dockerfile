FROM node:22 as build

WORKDIR /app

COPY package.json package-lock.json /app/

COPY .env.production ./.env.production

COPY prisma ./prisma

RUN npm ci

COPY . /app

RUN npm run build


FROM node:22 as runner

WORKDIR /app

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.env.production ./.env.production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

COPY ./docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV SERVICE_NAME="DOCVERSE"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV RUN_MIGRATIONS=ENABLE

EXPOSE 3005

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]


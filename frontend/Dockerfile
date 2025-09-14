# ---- Build Stage ----
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL


RUN npm install
COPY . .
RUN npm run build

# ---- Runtime Stage ----
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]

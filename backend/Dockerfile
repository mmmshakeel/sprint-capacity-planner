FROM node:20-alpine

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Set environment
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3300

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3300/health || exit 1

CMD ["npm", "run", "start:dev"]
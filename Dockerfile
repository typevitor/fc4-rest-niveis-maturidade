FROM node:22.8.0-slim

COPY start.sh /
RUN chmod +x /start.sh

RUN groupmod -g 1001 node && usermod -u 1001 -g 1001 node

USER node

WORKDIR /home/node/app

EXPOSE 3000

CMD ["/start.sh"] 

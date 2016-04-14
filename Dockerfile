FROM node:4
COPY package.json /src/package.json
RUN cd /src; npm install --production --depth=0
COPY . /src
EXPOSE 80
# CMD ["node", "/src/server.js"]
CMD node /src/server.js

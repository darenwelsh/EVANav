FROM ubuntu:16.04

# Environment variables
ENV NODE_JS_VERSION=8

RUN apt-get update && apt-get install -y curl apt-transport-https build-essential \
  && curl -sL https://deb.nodesource.com/setup_${NODE_JS_VERSION}.x | bash - \
  && apt-get install -y nodejs openjdk-8-jdk maven \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" \
  | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update && apt-get install -y yarn
  
RUN yarn global add http-server

EXPOSE 3000 8080

WORKDIR /opt/nasa-path-finder

COPY package.json /opt/nasa-path-finder/package.json

COPY yarn.lock /opt/nasa-path-finder/yarn.lock

COPY . /opt/nasa-path-finder

RUN yarn

RUN yarn build

RUN yarn compile

CMD yarn start:web & yarn start:server
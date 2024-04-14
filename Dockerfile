FROM node:lts

RUN apt update
RUN apt install -y ffmpeg

RUN mkdir /scr /source /dest

VOLUME [ "/source", "/dest" ]

WORKDIR /scr

COPY /src /scr/src
COPY package.json /scr/

RUN npm i --production

CMD [ "node", "." ]
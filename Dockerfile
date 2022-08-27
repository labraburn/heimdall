FROM ubuntu:focal

# Install required dependencies
RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get -q install -y \
    curl \
    make \
    g++ \
    && rm -r /var/lib/apt/lists/*

# Install NodeJS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get -q install -y \
    nodejs \
    && rm -r /var/lib/apt/lists/*

# Create and activate `www` user
RUN useradd --user-group --create-home --system --skel /dev/null --home-dir /www www

# Switch workdir
WORKDIR /heimdall

# Cerate keystore directory
RUN mkdir -p /heimdall/build/keystore
RUN chown -R www:www /heimdall/build/keystore

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

# Switch user
USER www:www
EXPOSE 8080
CMD [ "npm", "start" ]